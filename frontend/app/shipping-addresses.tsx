import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, Pressable,
    FlatList, Alert, Modal, TextInput, ActivityIndicator,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { fetchAddresses, createAddress, deleteAddress } from '@/constants/api';
import { useTranslation } from 'react-i18next';
import AutocompleteInput from '@/components/AutocompleteInput';
interface Address {
    id: string; label: string; street: string; city: string;
    state: string; country: string; isDefault: boolean;
}

export default function ShippingAddressesScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ label: 'Home', street: '', city: '', country: 'Israel' });
    const [saving, setSaving] = useState(false);

    const isRtl = i18n.language === 'he' || i18n.language === 'ar';
    const alignStyle: any = { textAlign: isRtl ? 'right' : 'left' };
    const rowStyle: any = { flexDirection: isRtl ? 'row-reverse' : 'row' };

    useFocusEffect(useCallback(() => { load(); }, []));

    const load = async () => {
        try {
            const data = await fetchAddresses();
            setAddresses(data);
        } catch { } finally { setLoading(false); }
    };

    const handleAdd = async () => {
        if (!form.street.trim() || !form.city.trim()) {
            Alert.alert(t('common.error', 'Error'), t('shipping.error_empty', 'Please fill in street and city'));
            return;
        }
        try {
            setSaving(true);
            await createAddress({ ...form, isDefault: addresses.length === 0 });
            setShowModal(false);
            setForm({ label: 'Home', street: '', city: '', country: 'Israel' });
            await load();
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally { setSaving(false); }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Delete Address', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try { await deleteAddress(id); await load(); } catch (e: any) { Alert.alert('Error', e.message); }
                },
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
                    <Text style={styles.title}>{t('shipping.title', 'Shipping Addresses')}</Text>
                    <Text style={styles.subtitle}>{t('shipping.subtitle', 'Manage your delivery locations')}</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={AppColors.textPrimary} style={{ flex: 1 }} />
            ) : (
                <FlatList
                    data={addresses}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <MaterialIcons name="location-off" size={48} color={AppColors.textMuted} />
                            <Text style={[styles.emptyText, alignStyle]}>{t('shipping.no_addresses', 'No addresses yet')}</Text>
                            <Text style={[styles.emptySubtext, alignStyle]}>{t('shipping.add_first', 'Add your first delivery address')}</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={[styles.cardHeader, rowStyle]}>
                                <View style={[styles.labelBadge, rowStyle]}>
                                    <MaterialIcons name="location-on" size={14} color={AppColors.priceGreen} />
                                    <Text style={[styles.labelText, alignStyle]}>{item.label}</Text>
                                </View>
                                {item.isDefault && <Text style={[styles.defaultBadge, alignStyle]}>{t('shipping.default', 'Default')}</Text>}
                            </View>
                            <Text style={[styles.addressText, alignStyle]}>{item.street}</Text>
                            <Text style={[styles.addressText, alignStyle]}>{item.city}{item.state ? `, ${item.state}` : ''}</Text>
                            <Text style={[styles.countryText, alignStyle]}>{item.country}</Text>
                            <Pressable onPress={() => handleDelete(item.id)} style={[styles.deleteBtn, rowStyle, { alignSelf: isRtl ? 'flex-start' : 'flex-end' }]}>
                                <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
                                <Text style={[styles.deleteText, alignStyle]}>{t('shipping.remove', 'Remove')}</Text>
                            </Pressable>
                        </View>
                    )}
                />
            )}

            <Pressable style={[styles.addButton, rowStyle]} onPress={() => setShowModal(true)}>
                <MaterialIcons name="add" size={22} color={AppColors.ctaButtonText} />
                <Text style={styles.addButtonText}>{t('shipping.add_address', 'Add Address')}</Text>
            </Pressable>

            <Modal visible={showModal} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={[styles.modalTitle, alignStyle]}>{t('shipping.new_address', 'New Address')}</Text>
                        {[
                            { key: 'country', placeholder: t('shipping.country', 'Country'), icon: 'flag' },
                            { key: 'city', placeholder: t('shipping.city', 'City'), icon: 'location-city' },
                            { key: 'street', placeholder: t('shipping.street', 'Street address'), icon: 'home' },
                            { key: 'label', placeholder: t('shipping.notes', 'Specific notes'), icon: 'note' },
                        ].map(({ key, placeholder, icon }, index) => (
                            <AutocompleteInput
                                key={key}
                                type={key as 'label' | 'street' | 'city' | 'country'}
                                value={(form as any)[key]}
                                onChangeText={(v) => setForm({ ...form, [key]: v })}
                                placeholder={placeholder}
                                icon={icon}
                                alignStyle={alignStyle}
                                rowStyle={rowStyle}
                                zIndex={20 - index}
                            />
                        ))}
                        <View style={[styles.modalActions, rowStyle]}>
                            <Pressable style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                                <Text style={styles.cancelText}>{t('shipping.cancel', 'Cancel')}</Text>
                            </Pressable>
                            <Pressable style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleAdd} disabled={saving}>
                                {saving ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.saveBtnText}>{t('shipping.save', 'Save')}</Text>}
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
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    labelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    labelText: { fontSize: 13, fontWeight: '600', color: AppColors.priceGreen },
    defaultBadge: { fontSize: 11, fontWeight: '700', color: AppColors.textMuted, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    addressText: { fontSize: 15, color: AppColors.textPrimary, lineHeight: 22 },
    countryText: { fontSize: 13, color: AppColors.textSecondary, marginTop: 2 },
    deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12, alignSelf: 'flex-end' },
    deleteText: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
    addButton: { position: 'absolute', bottom: 30, left: 24, right: 24, backgroundColor: AppColors.ctaButton, paddingVertical: 16, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    addButtonText: { color: AppColors.ctaButtonText, fontSize: 16, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modal: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
    modalTitle: { fontSize: 20, fontWeight: '800', color: AppColors.textPrimary, marginBottom: 4 },
    modalInput: { alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: AppColors.cardBorder, paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
    modalInputText: { flex: 1, fontSize: 15, color: AppColors.textPrimary },
    modalActions: { gap: 12, marginTop: 8 },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: '#F3F4F6' },
    cancelText: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary },
    saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', backgroundColor: AppColors.ctaButton },
    saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
