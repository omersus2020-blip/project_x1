import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, StyleSheet,
    Pressable, ActivityIndicator, Alert, KeyboardAvoidingView,
    Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { getStoredUser, updateProfile } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

export default function EditProfileScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const isRtl = i18n.language === 'he' || i18n.language === 'ar';
    const alignStyle: any = { textAlign: isRtl ? 'right' : 'left' };
    const rowStyle: any = { flexDirection: isRtl ? 'row-reverse' : 'row' };

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const user = await getStoredUser();
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
        setInitialLoading(false);
    };

    const handleSave = async () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert(t('common.error', 'Error'), t('edit_profile.error_required', 'Name and email are required'));
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert(t('common.error', 'Error'), t('auth.error_invalid_email', 'Please enter a valid email address'));
            return;
        }
        try {
            setLoading(true);
            await updateProfile({ name: name.trim(), email: email.trim() });
            Alert.alert(t('common.success', 'Success'), t('edit_profile.updated_success', 'Profile updated successfully'), [
                { text: t('common.ok', 'OK'), onPress: () => router.back() },
            ]);
        } catch (error: any) {
            Alert.alert(t('common.error', 'Error'), error.message || t('common.error', 'Failed to update profile'));
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={AppColors.textPrimary} style={{ flex: 1 }} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <Pressable onPress={() => router.back()} style={styles.backBtn}>
                            <MaterialIcons name="arrow-back" size={24} color={AppColors.textPrimary} />
                        </Pressable>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={styles.title}>{t('edit_profile.title', 'Edit Profile')}</Text>
                            <Text style={styles.subtitle}>{t('edit_profile.subtitle', 'Update your personal information')}</Text>
                        </View>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, alignStyle]}>{t('edit_profile.full_name', 'Full Name')}</Text>
                            <View style={[styles.inputContainer, rowStyle]}>
                                <MaterialIcons name="person-outline" size={20} color={AppColors.textMuted} />
                                <TextInput style={[styles.input, alignStyle, Platform.OS === 'web' && { outlineStyle: 'none' } as any]} value={name} onChangeText={setName} placeholder={t('edit_profile.placeholder_name', 'Your name')} placeholderTextColor={AppColors.textMuted} />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, alignStyle]}>{t('edit_profile.email', 'Email')}</Text>
                            <View style={[styles.inputContainer, rowStyle]}>
                                <View pointerEvents="none">
                                    <MaterialIcons name="mail-outline" size={20} color={AppColors.textMuted} />
                                </View>
                                <TextInput
                                    key={email ? 'active' : 'loading'}
                                    style={[styles.input, alignStyle, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder={t('edit_profile.placeholder_email', 'Your email')}
                                    placeholderTextColor={AppColors.textMuted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    spellCheck={false}
                                    autoComplete="email"
                                    textContentType="emailAddress"
                                />
                            </View>
                        </View>

                        <Pressable
                            style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.9 }, loading && { opacity: 0.7 }]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>{t('edit_profile.save_changes', 'Save Changes')}</Text>}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: AppColors.background },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    header: { paddingTop: 16, marginBottom: 32 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '800', color: AppColors.textPrimary, textAlign: 'center' },
    subtitle: { fontSize: 15, color: AppColors.textSecondary, marginTop: 6, textAlign: 'center' },
    form: { gap: 18 },
    inputGroup: { gap: 6 },
    label: { fontSize: 14, fontWeight: '600', color: AppColors.textPrimary, width: '100%' },
    inputContainer: { alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 14, borderWidth: 1, borderColor: AppColors.cardBorder, paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
    input: { flex: 1, fontSize: 15, color: AppColors.textPrimary, paddingVertical: 0 },
    saveButton: { backgroundColor: AppColors.ctaButton, paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 8 },
    saveButtonText: { color: AppColors.ctaButtonText, fontSize: 17, fontWeight: '800' },
});
