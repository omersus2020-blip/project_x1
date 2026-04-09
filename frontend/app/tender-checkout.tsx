import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import {
    fetchTenderById,
    fetchAddresses,
    fetchPaymentMethods,
    enrollTender,
    TenderFromAPI,
    getStoredUser,
} from '@/constants/api';
import { useTranslation } from 'react-i18next';

export default function TenderCheckoutScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const isRtl = i18n.language === 'he' || i18n.language === 'ar';
    const alignStyle: any = { textAlign: isRtl ? 'right' : 'left' };
    const rowStyle: any = { flexDirection: isRtl ? 'row-reverse' : 'row' };
    const [tender, setTender] = useState<TenderFromAPI | null>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Selections
    const [quantity, setQuantity] = useState(1);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const user = await getStoredUser();
            if (!user) {
                router.replace('/sign-in');
                return;
            }

            const [tenderData, addressesData, paymentsData] = await Promise.all([
                fetchTenderById(id as string),
                fetchAddresses(),
                fetchPaymentMethods(),
            ]);

            setTender(tenderData);
            setAddresses(addressesData);
            setPaymentMethods(paymentsData);

            if (addressesData.length > 0) {
                const defAuth = addressesData.find((a: any) => a.isDefault);
                setSelectedAddressId(defAuth ? defAuth.id : addressesData[0].id);
            }
            if (paymentsData.length > 0) {
                const defPay = paymentsData.find((p: any) => p.isDefault);
                setSelectedPaymentId(defPay ? defPay.id : paymentsData[0].id);
            }
        } catch (error) {
            console.error('Failed to load checkout data', error);
            Alert.alert(t('common.error', 'Error'), t('checkout.load_failed', 'Failed to load checkout data'));
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (delta: number) => {
        const newQty = quantity + delta;
        if (newQty >= 1 && newQty <= 3) {
            setQuantity(newQty);
        }
    };

    const handleConfirm = async () => {
        if (!selectedAddressId) {
            Alert.alert(t('checkout.missing_address', 'Missing Address'), t('checkout.please_add_address', 'Please select or add a delivery address.'));
            return;
        }
        if (!selectedPaymentId) {
            Alert.alert(t('checkout.missing_payment', 'Missing Payment Method'), t('checkout.please_add_payment', 'Please select or add a payment method.'));
            return;
        }

        try {
            setProcessing(true);
            const user = await getStoredUser();
            if (!user) return;

            await enrollTender(id as string, user.id, quantity, selectedAddressId, selectedPaymentId);

            Alert.alert(
                t('common.success', "Success!"),
                t('tender.join_success', "You have successfully joined the group deal!"),
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            router.replace('/(tabs)/current');
                        }
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert(t('common.error', "Error"), error.message || t('tender.join_failed', "Failed to join tender"));
        } finally {
            setProcessing(false);
        }
    };

    if (loading || !tender) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={AppColors.textPrimary} />
            </View>
        );
    }

    const subtotal = tender.currentPrice * quantity;
    const shipping = 0; // Free for MVP
    const total = subtotal + shipping;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Notice */}
                <View style={styles.noticeCard}>
                    <MaterialIcons name="info-outline" size={20} color="#EF4444" />
                    <Text style={styles.noticeText}>
                        {t('checkout.cancel_fee_notice', 'Note: If you cancel your enrollment before the tender expires, a 5% fee will apply.')}
                    </Text>
                </View>

                {/* Item Summary */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>{t('checkout.item_summary', 'Item Summary')}</Text>
                    <View style={styles.itemRow}>
                        <Image source={{ uri: tender.imageUrl }} style={styles.itemImage} />
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle} numberOfLines={2}>{tender.title}</Text>
                            <Text style={styles.itemPrice} adjustsFontSizeToFit={true} numberOfLines={1}>${tender.currentPrice.toFixed(2)}</Text>

                            {/* Quantity Selector */}
                            <View style={styles.quantityContainer}>
                                <Text style={styles.quantityLabel}>{t('checkout.quantity', 'Quantity:')}</Text>
                                <View style={styles.quantityControl}>
                                    <Pressable
                                        onPress={() => handleQuantityChange(-1)}
                                        style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                                        disabled={quantity <= 1}
                                    >
                                        <MaterialIcons name="remove" size={16} color={quantity <= 1 ? AppColors.textMuted : AppColors.textPrimary} />
                                    </Pressable>
                                    <Text style={styles.qtyText}>{quantity}</Text>
                                    <Pressable
                                        onPress={() => handleQuantityChange(1)}
                                        style={[styles.qtyBtn, quantity >= 3 && styles.qtyBtnDisabled]}
                                        disabled={quantity >= 3}
                                    >
                                        <MaterialIcons name="add" size={16} color={quantity >= 3 ? AppColors.textMuted : AppColors.textPrimary} />
                                    </Pressable>
                                </View>
                                {quantity === 3 && <Text style={styles.maxQtyNote}>Max 3</Text>}
                            </View>
                        </View>
                    </View>
                </View>

                {/* Delivery Address */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>{t('checkout.delivery_address', 'Delivery Address')}</Text>
                        <Pressable onPress={() => router.push('/shipping-addresses')}>
                            <Text style={styles.editLink}>{t('common.edit', 'Edit')}</Text>
                        </Pressable>
                    </View>

                    {addresses.length === 0 ? (
                        <Pressable style={styles.addDashedBtn} onPress={() => router.push('/shipping-addresses')}>
                            <MaterialIcons name="add-location-alt" size={20} color={AppColors.textSecondary} />
                            <Text style={styles.addDashedText}>{t('checkout.add_address', 'Add Delivery Address')}</Text>
                        </Pressable>
                    ) : (
                        <View style={styles.optionsList}>
                            {addresses.map(addr => (
                                <Pressable
                                    key={addr.id}
                                    style={[styles.optionRow, rowStyle, selectedAddressId === addr.id && styles.optionRowActive]}
                                    onPress={() => setSelectedAddressId(addr.id)}
                                >
                                    <View style={styles.radioOut}>
                                        {selectedAddressId === addr.id && <View style={styles.radioIn} />}
                                    </View>
                                    <View style={styles.optionDetails}>
                                        <View style={[styles.cardHeader, rowStyle]}>
                                            <View style={[styles.labelBadge, rowStyle]}>
                                                <MaterialIcons name="location-on" size={14} color={AppColors.priceGreen} />
                                                <Text style={[styles.labelText, alignStyle]}>{addr.label}</Text>
                                            </View>
                                            {addr.isDefault && <Text style={[styles.defaultBadge, alignStyle]}>{t('shipping.default', 'Default')}</Text>}
                                        </View>
                                        <Text style={[styles.addressText, alignStyle]}>{addr.street}</Text>
                                        <Text style={[styles.addressText, alignStyle]}>{addr.city}{addr.state ? `, ${addr.state}` : ''}</Text>
                                        <Text style={[styles.countryText, alignStyle]}>{addr.country}</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                {/* Payment Method */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>{t('checkout.payment_method', 'Payment Method')}</Text>
                        <Pressable onPress={() => router.push('/payment-methods')}>
                            <Text style={styles.editLink}>{t('common.edit', 'Edit')}</Text>
                        </Pressable>
                    </View>

                    {paymentMethods.length === 0 ? (
                        <Pressable style={styles.addDashedBtn} onPress={() => router.push('/payment-methods')}>
                            <MaterialIcons name="add-card" size={20} color={AppColors.textSecondary} />
                            <Text style={styles.addDashedText}>{t('checkout.add_payment', 'Add Payment Method')}</Text>
                        </Pressable>
                    ) : (
                        <View style={styles.optionsList}>
                            {paymentMethods.map(pm => (
                                <Pressable
                                    key={pm.id}
                                    style={[styles.optionRow, rowStyle, selectedPaymentId === pm.id && styles.optionRowActive]}
                                    onPress={() => setSelectedPaymentId(pm.id)}
                                >
                                    <View style={styles.radioOut}>
                                        {selectedPaymentId === pm.id && <View style={styles.radioIn} />}
                                    </View>
                                    <View style={[styles.cardIcon, { marginRight: isRtl ? 0 : 12, marginLeft: isRtl ? 12 : 0 }]}>
                                        <MaterialIcons name="credit-card" size={24} color={AppColors.textPrimary} />
                                    </View>
                                    <View style={[styles.optionDetails, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                                        <View style={[styles.cardHeader, rowStyle, { marginBottom: 4, width: '100%' }]}>
                                            <Text style={[styles.cardBrand, alignStyle]}>{pm.brand}</Text>
                                            {pm.isDefault && <Text style={[styles.defaultBadge, alignStyle]}>{t('payment.default', 'Default')}</Text>}
                                        </View>
                                        <Text style={[styles.cardNumber, alignStyle]}>•••• •••• •••• {pm.last4}</Text>
                                        <Text style={[styles.cardExpiry, alignStyle]}>{t('payment.expires', 'Expires')} {String(pm.expiryMonth).padStart(2, '0')}/{pm.expiryYear}</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>

                {/* Order Summary */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>{t('checkout.order_summary', 'Order Summary')}</Text>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>{t('checkout.subtotal', 'Subtotal')}</Text>
                        <Text style={styles.summaryValue} adjustsFontSizeToFit={true} numberOfLines={1}>${subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>{t('checkout.shipping', 'Shipping')}</Text>
                        <Text style={styles.summaryValueFree}>{t('checkout.free', 'Free')}</Text>
                    </View>

                    <View style={styles.summaryDivider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryTotalLabel}>{t('checkout.total', 'Total')}</Text>
                        <Text style={styles.summaryTotalValue} adjustsFontSizeToFit={true} numberOfLines={1}>${total.toFixed(2)}</Text>
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.footerInfo}>
                    <Text style={styles.footerTotalLabel}>{t('checkout.total', 'Total')}</Text>
                    <Text style={styles.footerTotalValue} adjustsFontSizeToFit={true} numberOfLines={1}>${total.toFixed(2)}</Text>
                </View>
                <Pressable
                    style={({ pressed }) => [
                        styles.confirmBtn,
                        pressed && { opacity: 0.9 },
                        processing && { opacity: 0.7 }
                    ]}
                    onPress={handleConfirm}
                    disabled={processing}
                >
                    {processing ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <Text style={styles.confirmBtnText}>{t('checkout.confirm', 'Confirm & Join')}</Text>
                    )}
                </Pressable>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    noticeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2', // Light red
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FEE2E2',
        gap: 8,
    },
    noticeText: {
        flex: 1,
        fontSize: 13,
        color: '#DC2626',
        fontWeight: '600',
        lineHeight: 18,
    },
    sectionCard: {
        backgroundColor: AppColors.cardBackground,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.textPrimary,
        marginBottom: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    editLink: {
        fontSize: 14,
        color: AppColors.ctaButton,
        fontWeight: '600',
    },
    itemRow: {
        flexDirection: 'row',
        gap: 12,
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    itemInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: AppColors.textPrimary,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 17,
        fontWeight: '800',
        color: AppColors.priceGreen,
        marginBottom: 10,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    quantityLabel: {
        fontSize: 13,
        color: AppColors.textSecondary,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        borderRadius: 8,
    },
    qtyBtn: {
        padding: 8,
    },
    qtyBtnDisabled: {
        opacity: 0.5,
    },
    qtyText: {
        fontSize: 15,
        fontWeight: '600',
        color: AppColors.textPrimary,
        paddingHorizontal: 8,
        minWidth: 24,
        textAlign: 'center',
    },
    maxQtyNote: {
        fontSize: 11,
        color: '#EF4444',
        fontWeight: '600',
    },
    addDashedBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#D1D5DB',
        borderRadius: 12,
        gap: 8,
    },
    addDashedText: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.textSecondary,
    },
    optionsList: {
        gap: 10,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
    },
    optionRowActive: {
        borderColor: AppColors.ctaButton,
        backgroundColor: '#F5F8FF', // Light blue tint
    },
    radioOut: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: AppColors.textMuted,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioIn: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: AppColors.ctaButton,
    },
    optionDetails: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.textPrimary,
        marginBottom: 2,
    },
    optionDesc: {
        fontSize: 13,
        color: AppColors.textSecondary,
    },
    cardIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    cardBrand: { fontSize: 16, fontWeight: '700', color: AppColors.textPrimary },
    cardNumber: { fontSize: 14, color: AppColors.textSecondary, marginTop: 2, letterSpacing: 1 },
    cardExpiry: { fontSize: 12, color: AppColors.textMuted, marginTop: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    labelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    labelText: { fontSize: 13, fontWeight: '600', color: AppColors.priceGreen },
    defaultBadge: { fontSize: 11, fontWeight: '700', color: AppColors.textMuted, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    addressText: { fontSize: 15, color: AppColors.textPrimary, lineHeight: 22 },
    countryText: { fontSize: 13, color: AppColors.textSecondary, marginTop: 2 },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: AppColors.textSecondary,
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '600',
        color: AppColors.textPrimary,
    },
    summaryValueFree: {
        fontSize: 15,
        fontWeight: '700',
        color: AppColors.priceGreen,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 12,
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.textPrimary,
    },
    summaryTotalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: AppColors.textPrimary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 32, // Extra padding for safe area
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 5,
    },
    footerInfo: {
        flex: 1,
    },
    footerTotalLabel: {
        fontSize: 13,
        color: AppColors.textSecondary,
    },
    footerTotalValue: {
        fontSize: 22,
        fontWeight: '800',
        color: AppColors.priceGreen,
        marginTop: 2,
    },
    confirmBtn: {
        backgroundColor: AppColors.ctaButton,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 14,
        minWidth: 160,
        alignItems: 'center',
    },
    confirmBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
