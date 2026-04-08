import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedTendersService {
  constructor(private prisma: PrismaService) { }

  async toggleSave(tenderId: string, userId: string) {
    // Check if tender exists
    const tender = await this.prisma.tender.findUnique({
      where: { id: tenderId },
    });
    if (!tender) throw new NotFoundException('Tender not found');

    // Check if already saved
    const existing = await this.prisma.savedTender.findUnique({
      where: {
        userId_tenderId: { userId, tenderId },
      },
    });

    if (existing) {
      // Unsave
      await this.prisma.savedTender.delete({
        where: { id: existing.id },
      });
      return { saved: false };
    } else {
      // Save
      await this.prisma.savedTender.create({
        data: {
          tenderId,
          userId,
          tenderTitle: tender.title, // Snapshot
        },
      });
      return { saved: true };
    }
  }

  async getSavedByUserId(userId: string) {
    return this.prisma.savedTender.findMany({
      where: { userId },
      include: {
        tender: true, // Include the full tender details for the UI
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async isSaved(tenderId: string, userId: string) {
    const saved = await this.prisma.savedTender.findUnique({
      where: {
        userId_tenderId: { userId, tenderId },
      },
    });
    return { isSaved: !!saved };
  }
}
