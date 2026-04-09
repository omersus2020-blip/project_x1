import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { TenderStatus, BidStatus, NotificationType } from '@prisma/client';

@Injectable()
export class TenderTasksService {
    private readonly logger = new Logger(TenderTasksService.name);

    constructor(private readonly prisma: PrismaService) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleExpiredTenders() {
        this.logger.debug('Checking for expired tenders...');

        const now = new Date();
        const expiredTenders = await this.prisma.tender.findMany({
            where: {
                status: TenderStatus.ACTIVE,
                endDate: { lte: now },
            },
            include: {
                enrollments: {
                    include: {
                        user: {
                            include: {
                                addresses: {
                                    where: { isDefault: true },
                                    take: 1,
                                },
                            },
                        },
                    },
                },
                bids: {
                    orderBy: { bidPrice: 'asc' },
                },
                supplier: true,
            },
        });

        for (const tender of expiredTenders) {
            this.logger.log(`Processing expired tender: ${tender.id} (${tender.title})`);

            // 1. Mark tender as COMPLETED
            await this.prisma.tender.update({
                where: { id: tender.id },
                data: { status: TenderStatus.COMPLETED },
            });

            // 2. Determine winning bid and mark all bids
            const winningBid = tender.bids.length > 0 ? tender.bids[0] : null;

            if (tender.bids.length > 0) {
                // Mark winning bid
                await this.prisma.supplierBid.update({
                    where: { id: tender.bids[0].id },
                    data: { status: BidStatus.WON },
                });

                // Mark all other bids as LOST
                if (tender.bids.length > 1) {
                    const losingBidIds = tender.bids.slice(1).map(b => b.id);
                    await this.prisma.supplierBid.updateMany({
                        where: { id: { in: losingBidIds } },
                        data: { status: BidStatus.LOST },
                    });
                }

                this.logger.log(`Winning supplier bid: ${winningBid!.userId} with price $${winningBid!.bidPrice}`);
            } else {
                this.logger.warn(`No supplier bids for tender ${tender.id}`);
            }

            // 3. Create Orders for all enrolled customers
            if (tender.enrollments.length > 0) {
                for (const enrollment of tender.enrollments) {
                    let addressStr: string | null = null;
                    if (enrollment.addressId) {
                        const addr = await this.prisma.address.findUnique({ where: { id: enrollment.addressId } });
                        if (addr) {
                            addressStr = `${addr.street}, ${addr.city}, ${addr.country}`;
                        }
                    }
                    if (!addressStr) {
                        const defaultAddress = enrollment.user.addresses[0];
                        addressStr = defaultAddress
                            ? `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.country}`
                            : null;
                    }

                    // Estimated delivery: 7 days from now
                    const estimatedDelivery = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

                    await this.prisma.order.create({
                        data: {
                            tenderId: tender.id,
                            userId: enrollment.userId,
                            finalPrice: tender.currentPrice,
                            quantity: enrollment.quantity,
                            totalPrice: tender.currentPrice * enrollment.quantity,
                            status: 'PROCESSING',
                            deliveryAddress: addressStr,
                            estimatedDelivery: estimatedDelivery,
                            deliveryNotes: `Group buy order for "${tender.title}"`,
                            supplierBidId: winningBid?.id || null,
                            userName: enrollment.user.name,
                            userEmail: enrollment.user.email,
                            tenderTitle: tender.title
                        },
                    });

                    // 4. Notify each enrolled user about their order
                    await this.prisma.notification.create({
                        data: {
                            userId: enrollment.userId,
                            title: `Your order for "${tender.title}" is confirmed!`,
                            body: `Congratulations! The tender has ended. Your final price is $${tender.currentPrice.toFixed(2)} each ($${(tender.currentPrice * enrollment.quantity).toFixed(2)} total for ${enrollment.quantity} items). `
                                + (addressStr
                                    ? `Delivery to: ${addressStr}. `
                                    : `Please add a delivery address in your profile. `)
                                + `Estimated delivery: ${estimatedDelivery.toLocaleDateString()}.`,
                            type: NotificationType.ORDER_CREATED,
                            tenderId: tender.id,
                            tenderTitle: tender.title
                        },
                    });
                }

                this.logger.log(`Created ${tender.enrollments.length} orders and notifications for tender ${tender.id}`);
            } else {
                this.logger.log(`No customers enrolled in tender ${tender.id}`);
            }

            // 5. Notify the supplier with a summary report of all enrolled users
            if (winningBid) {
                const enrolledUsersSummary = tender.enrollments.map((e, i) => {
                    const addr = e.user.addresses[0];
                    const addrStr = addr ? `${addr.street}, ${addr.city}` : 'No address';
                    return `${i + 1}. ${e.user.name} (${e.user.email}) — ${addrStr}`;
                }).join('\n');

                // Notify the winning supplier
                const totalRevenue = tender.enrollments.reduce((sum, e) => sum + (tender.currentPrice * e.quantity), 0);
                const totalQuantity = tender.enrollments.reduce((sum, e) => sum + e.quantity, 0);

                await this.prisma.notification.create({
                    data: {
                        userId: winningBid.userId,
                        title: `You won the tender: "${tender.title}"!`,
                        body: `Your bid of $${winningBid.bidPrice.toFixed(2)} won! `
                            + `${tender.enrollments.length} customer(s) ordered ${totalQuantity} items total. `
                            + `Total revenue: $${totalRevenue.toFixed(2)}.\n\n`
                            + `Enrolled customers:\n${enrolledUsersSummary || 'None'}`,
                        type: NotificationType.TENDER_WON,
                        tenderId: tender.id,
                        tenderTitle: tender.title
                    },
                });

                this.logger.log(`Notified winning supplier ${winningBid.userId} for tender ${tender.id}`);
            }

            // 6. Notify the tender creator (supplier who uploaded it)
            if (tender.supplierId !== winningBid?.userId) {
                await this.prisma.notification.create({
                    data: {
                        userId: tender.supplierId,
                        title: `Your tender "${tender.title}" has completed`,
                        body: `${tender.enrollments.length} customer(s) ordered ${tender.enrollments.reduce((sum, e) => sum + e.quantity, 0)} items at final price $${tender.currentPrice.toFixed(2)}. `
                            + (winningBid
                                ? `Winning supplier bid: $${winningBid.bidPrice.toFixed(2)}.`
                                : `No supplier bids were received.`),
                        type: NotificationType.TENDER_COMPLETED,
                        tenderId: tender.id,
                        tenderTitle: tender.title
                    },
                });
            }
        }
    }
}
