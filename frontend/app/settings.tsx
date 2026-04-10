import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet,
    Pressable, Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { changePassword, deleteAccount, logout } from '@/constants/api';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [changingPw, setChangingPw] = useState(false);

    const isRtl = i18n.language === 'he' || i18n.language === 'ar';
    const alignStyle: any = { textAlign: isRtl ? 'right' : 'left' };
    const rowStyle: any = { flexDirection: isRtl ? 'row-reverse' : 'row' };
    const alignEndStyle: any = { alignItems: isRtl ? 'flex-end' : 'flex-start' };

    const handleChangePassword = async () => {
        if (!currentPw || !newPw || !confirmPw) {
            Alert.alert('Error', 'Please fill in all password fields');
            return;
        }
        if (newPw !== confirmPw) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }
        if (newPw.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters');
            return;
        }
        try {
            setChangingPw(true);
            await changePassword(currentPw, newPw);
            Alert.alert('Success', 'Password changed successfully');
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to change password');
        } finally { setChangingPw(false); }
    };

    const handleSignOut = () => {
        Alert.alert(t('settings.sign_out', 'Sign Out'), t('settings.sign_out_desc', 'Are you sure you want to sign out?'), [
            { text: t('common.cancel', 'Cancel'), style: 'cancel' },
            {
                text: t('settings.sign_out', 'Sign Out'), onPress: async () => {
                    await logout();
                    router.replace('/welcome');
                },
            },
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            t('settings.delete_account', 'Delete Account'),
            t('settings.delete_warning', 'This action is permanent. All your data will be deleted and cannot be recovered.'),
            [
                { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                {
                    text: t('settings.delete_account', 'Delete Account'), style: 'destructive', onPress: async () => {
                        try {
                            await deleteAccount();
                            router.replace('/welcome');
                        } catch (e: any) {
                            Alert.alert('Error', e.message);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={AppColors.textPrimary} />
                    </Pressable>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.title}>{t('settings.title', 'Settings')}</Text>
                        <Text style={styles.subtitle}>{t('settings.subtitle', 'App preferences and privacy')}</Text>
                    </View>
                </View>

                {/* Change Password */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, alignStyle]}>{t('settings.change_pw', 'Change Password')}</Text>
                    <View style={[styles.inputContainer, rowStyle]}>
                        <MaterialIcons name="lock-outline" size={18} color={AppColors.textMuted} />
                        <TextInput style={[styles.input, alignStyle]} placeholder={t('settings.current_pw', 'Current password')} placeholderTextColor={AppColors.textMuted} secureTextEntry value={currentPw} onChangeText={setCurrentPw} />
                    </View>
                    <View style={[styles.inputContainer, rowStyle]}>
                        <MaterialIcons name="lock" size={18} color={AppColors.textMuted} />
                        <TextInput style={[styles.input, alignStyle]} placeholder={t('settings.new_pw', 'New password')} placeholderTextColor={AppColors.textMuted} secureTextEntry value={newPw} onChangeText={setNewPw} />
                    </View>
                    <View style={[styles.inputContainer, rowStyle]}>
                        <MaterialIcons name="lock" size={18} color={AppColors.textMuted} />
                        <TextInput style={[styles.input, alignStyle]} placeholder={t('settings.confirm_pw', 'Confirm new password')} placeholderTextColor={AppColors.textMuted} secureTextEntry value={confirmPw} onChangeText={setConfirmPw} />
                    </View>
                    <Pressable style={[styles.changeButton, changingPw && { opacity: 0.7 }]} onPress={handleChangePassword} disabled={changingPw}>
                        {changingPw ? <ActivityIndicator color="#FFF" /> : <Text style={styles.changeButtonText}>{t('settings.update_pw', 'Update Password')}</Text>}
                    </Pressable>
                </View>

                {/* Account Actions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, alignStyle]}>{t('settings.account', 'Account')}</Text>
                    <Pressable style={[styles.actionRow, rowStyle]} onPress={handleSignOut}>
                        <View style={styles.actionIcon}>
                            <MaterialIcons name="logout" size={22} color={AppColors.textPrimary} />
                        </View>
                        <View style={[{ flex: 1 }, alignEndStyle]}>
                            <Text style={[styles.actionTitle, alignStyle]}>{t('settings.sign_out', 'Sign Out')}</Text>
                            <Text style={[styles.actionSubtitle, alignStyle]}>{t('settings.sign_out_desc', 'Sign out of your account')}</Text>
                        </View>
                        <MaterialIcons name={isRtl ? "chevron-left" : "chevron-right"} size={22} color={AppColors.textMuted} />
                    </Pressable>
                    <View style={styles.divider} />
                    <Pressable style={[styles.actionRow, rowStyle]} onPress={handleDeleteAccount}>
                        <View style={[styles.actionIcon, { backgroundColor: '#FEF2F2' }]}>
                            <MaterialIcons name="delete-forever" size={22} color="#EF4444" />
                        </View>
                        <View style={[{ flex: 1 }, alignEndStyle]}>
                            <Text style={[styles.actionTitle, alignStyle, { color: '#EF4444' }]}>{t('settings.delete_account', 'Delete Account')}</Text>
                            <Text style={[styles.actionSubtitle, alignStyle]}>{t('settings.delete_account_desc', 'Permanently delete your account and data')}</Text>
                        </View>
                        <MaterialIcons name={isRtl ? "chevron-left" : "chevron-right"} size={22} color={AppColors.textMuted} />
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    scrollContent: { paddingBottom: 40 },
    header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: AppColors.background },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '800', color: AppColors.textPrimary, textAlign: 'center' },
    subtitle: { fontSize: 15, color: AppColors.textSecondary, marginTop: 4, textAlign: 'center' },
    section: { backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: AppColors.cardBorder, gap: 10 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: AppColors.textPrimary, marginBottom: 4, width: '100%' },
    inputContainer: { alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: AppColors.cardBorder, paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
    input: { flex: 1, fontSize: 15, color: AppColors.textPrimary },
    changeButton: { backgroundColor: AppColors.ctaButton, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 4 },
    changeButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
    actionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    actionTitle: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary },
    actionSubtitle: { fontSize: 12, color: AppColors.textSecondary, marginTop: 2 },
    divider: { height: 1, backgroundColor: '#F3F4F6' },
});
