import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, Pressable,
    FlatList, Alert, Modal, TextInput, ActivityIndicator,
    KeyboardAvoidingView, Platform, // These were removed in the provided edit, but are still needed. Re-adding them.
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Changed from react-native
import { useRouter, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { fetchPaymentMethods, createPaymentMethod, deletePaymentMethod } from '@/constants/api';
import { useTranslation } from 'react-i18next';

interface PaymentMethod {
    id: string; label: string; last4: string; brand: string;
    expiryMonth: number; expiryYear: number; isDefault: boolean;
}

const BRAND_ICONS: Record<string, string> = {
    Visa: '💳', Mastercard: '💳', Amex: '💳', Other: '💳',
};

export default function PaymentMethodsScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [cards, setCards] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ brand: 'Visa', last4: '', expMonth: '', expYear: '' });
    const [saving, setSaving] = useState(false);

    const isRtl = i18n.language === 'he' || i18n.language === 'ar';
    const alignStyle: any = { textAlign: isRtl ? 'right' : 'left' };
    const rowStyle: any = { flexDirection: isRtl ? 'row-reverse' : 'row' };
    const alignFlexStyle: any = { alignItems: isRtl ? 'flex-end' : 'flex-start' };

    useFocusEffect(useCallback(() => { load(); }, []));

    const load = async () => {
        try {
            const data = await fetchPaymentMethods();
            setCards(data);
        } catch { } finally { setLoading(false); }
    };

    const handleAdd = async () => {
        if (!form.last4.trim() || !form.expMonth.trim() || !form.expYear.trim()) {
            Alert.alert(t('common.error', 'Error'), t('payment.error_empty', 'Please fill in last 4 digits and expiry date'));
            return;
        }
        try {
            setSaving(true);
            await createPaymentMethod({
                label: form.brand, last4: form.last4, brand: form.brand,
                expiryMonth: parseInt(form.expMonth), expiryYear: parseInt(form.expYear),
                isDefault: cards.length === 0,
            });
            setShowModal(false);
            setForm({ brand: 'Visa', last4: '', expMonth: '', expYear: '' });
            await load();
        } catch (e: any) { Alert.alert('Error', e.message); } finally { setSaving(false); }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Remove Card', 'Are you sure you want to remove this card?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive', onPress: async () => {
                    try { await deletePaymentMethod(id); await load(); } catch (e: any) { Alert.alert('Error', e.message); }
                }
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={AppColors.textPrimary} />
                </Pressable>
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.title}>{t('payment.title', 'Payment Methods')}</Text>
                    <Text style={styles.subtitle}>{t('payment.subtitle', 'Manage your cards and payment options')}</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={AppColors.textPrimary} style={{ flex: 1 }} />
            ) : (
                <FlatList
                    data={cards}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialIcons name="credit-card-off" size={48} color={AppColors.textMuted} />
                            <Text style={[styles.emptyText, alignStyle]}>{t('payment.no_methods', 'No payment methods')}</Text>
                            <Text style={[styles.emptySubtext, alignStyle]}>{t('payment.add_first', 'Add a card to get started')}</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={[styles.cardRow, rowStyle]}>
                                <View style={styles.cardIcon}>
                                    <MaterialIcons name="credit-card" size={24} color={AppColors.textPrimary} />
                                </View>
                                <View style={[{ flex: 1 }, alignFlexStyle]}>
                                    <View style={[styles.cardHeader, rowStyle]}>
                                        <Text style={[styles.cardBrand, alignStyle]}>{item.brand}</Text>
                                        {item.isDefault && <Text style={[styles.defaultBadge, alignStyle]}>{t('payment.default', 'Default')}</Text>}
                                    </View>
                                    <Text style={[styles.cardNumber, alignStyle]}>•••• •••• •••• {item.last4}</Text>
                                    <Text style={[styles.cardExpiry, alignStyle]}>{t('payment.expires', 'Expires')} {String(item.expiryMonth).padStart(2, '0')}/{item.expiryYear}</Text>
                                </View>
                                <Pressable onPress={() => handleDelete(item.id)} hitSlop={10}>
                                    <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                                </Pressable>
                            </View>
                        </View>
                    )}
                />
            )}

            <Pressable style={[styles.addButton, rowStyle]} onPress={() => setShowModal(true)}>
                <MaterialIcons name="add" size={22} color={AppColors.ctaButtonText} />
                <Text style={styles.addButtonText}>{t('payment.add_card', 'Add Card')}</Text>
            </Pressable>

            <Modal visible={showModal} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={[styles.modalTitle, alignStyle]}>{t('payment.add_card', 'Add Card')}</Text>

                        <View style={[styles.modalInput, rowStyle]}>
                            <MaterialIcons name="credit-card" size={18} color={AppColors.textMuted} />
                            <TextInput
                                style={[styles.modalInputText, alignStyle, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                                placeholder={t('payment.last4', 'Last 4 digits')}
                                placeholderTextColor={AppColors.textMuted}
                                keyboardType="number-pad"
                                maxLength={4}
                                value={form.last4}
                                onChangeText={(v) => setForm({ ...form, last4: v.replace(/\D/g, '').slice(0, 4) })}
                            />
                        </View>

                        <View style={[styles.expiryRow, rowStyle]}>
                            <View style={[styles.modalInput, { flex: 1 }, rowStyle]}>
                                <TextInput
                                    style={[styles.modalInputText, alignStyle, { textAlign: 'center' }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                                    placeholder={t('payment.mm', 'MM')}
                                    placeholderTextColor={AppColors.textMuted}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    value={form.expMonth}
                                    onChangeText={(v) => setForm({ ...form, expMonth: v.replace(/\D/g, '').slice(0, 2) })}
                                />
                            </View>
                            <Text style={styles.expirySeparator}>/</Text>
                            <View style={[styles.modalInput, { flex: 1 }, rowStyle]}>
                                <TextInput
                                    style={[styles.modalInputText, alignStyle, { textAlign: 'center' }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                                    placeholder={t('payment.yyyy', 'YYYY')}
                                    placeholderTextColor={AppColors.textMuted}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                    value={form.expYear}
                                    onChangeText={(v) => setForm({ ...form, expYear: v.replace(/\D/g, '').slice(0, 4) })}
                                />
                            </View>
                        </View>

                        <View style={[styles.brandRow, rowStyle]}>
                            {['Visa', 'Mastercard', 'Amex', 'Other'].map((b) => (
                                <Pressable key={b} style={[styles.brandChip, form.brand === b && styles.brandChipActive]} onPress={() => setForm({ ...form, brand: b })}>
                                    <Text style={[styles.brandChipText, alignStyle, form.brand === b && styles.brandChipTextActive]}>{b}</Text>
                                </Pressable>
                            ))}
                        </View>

                        <View style={[styles.modalActions, rowStyle]}>
                            <Pressable style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                                <Text style={styles.cancelText}>{t('common.cancel', 'Cancel')}</Text>
                            </Pressable>
                            <Pressable style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleAdd} disabled={saving}>
                                {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnText}>{t('common.save', 'Save')}</Text>}
                            </Pressable>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: AppColors.background },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '800', color: AppColors.textPrimary, textAlign: 'center' },
    subtitle: { fontSize: 15, color: AppColors.textSecondary, marginTop: 4, textAlign: 'center' },
    list: { padding: 16, paddingBottom: 100 },
    emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
    emptyText: { fontSize: 18, fontWeight: '700', color: AppColors.textPrimary },
    emptySubtext: { fontSize: 14, color: AppColors.textSecondary },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: AppColors.cardBorder },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    cardIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cardBrand: { fontSize: 16, fontWeight: '700', color: AppColors.textPrimary },
    defaultBadge: { fontSize: 11, fontWeight: '700', color: AppColors.priceGreen, backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    cardNumber: { fontSize: 14, color: AppColors.textSecondary, marginTop: 2, letterSpacing: 1 },
    cardExpiry: { fontSize: 12, color: AppColors.textMuted, marginTop: 2 },
    addButton: { position: 'absolute', bottom: 30, left: 24, right: 24, backgroundColor: AppColors.ctaButton, paddingVertical: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    addButtonText: { color: AppColors.ctaButtonText, fontSize: 16, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: AppColors.textPrimary, marginBottom: 4 },
    modalInput: { alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: AppColors.cardBorder, paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
    modalInputText: { flex: 1, fontSize: 15, color: AppColors.textPrimary },
    expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    expirySeparator: { fontSize: 20, color: AppColors.textMuted },
    brandRow: { flexDirection: 'row', gap: 8 },
    brandChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: AppColors.cardBorder, backgroundColor: '#FFF' },
    brandChipActive: { backgroundColor: AppColors.ctaButton, borderColor: AppColors.ctaButton },
    brandChipText: { fontSize: 13, fontWeight: '600', color: AppColors.textPrimary },
    brandChipTextActive: { color: '#FFF' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: '#F3F4F6' },
    cancelText: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary },
    saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: AppColors.ctaButton },
    saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
