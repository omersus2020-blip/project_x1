import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, SafeAreaView,
    Pressable, ActivityIndicator, Alert, KeyboardAvoidingView,
    Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { forgotPassword } from '@/constants/api';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (!email.trim()) {
            Alert.alert(t('common.error', 'Error'), t('auth.error_fill_fields', 'Please enter your email'));
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert(t('common.error', 'Error'), t('auth.error_invalid_email', 'Please enter a valid email address'));
            return;
        }

        try {
            setLoading(true);
            const data = await forgotPassword(email.trim());
            router.push({
                pathname: '/reset-password',
                params: { email: email.trim(), userId: data.userId },
            });
        } catch (error: any) {
            Alert.alert(t('common.error', 'Error'), error.message || t('common.error_generic', 'Something went wrong'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <Pressable onPress={() => router.back()} style={styles.backBtn}>
                            <MaterialIcons name="arrow-back" size={24} color={AppColors.textPrimary} />
                        </Pressable>
                        <Text style={styles.title}>{t('auth.forgot_password', 'Forgot Password?')}</Text>
                        <Text style={styles.subtitle}>
                            {t('auth.forgot_password_desc', 'Enter your email address and we will send you a verification code.')}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('auth.email_label', 'Email')}</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons name="mail-outline" size={20} color={AppColors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.email_placeholder', 'Enter your email')}
                                    placeholderTextColor={AppColors.textMuted}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <Pressable
                            style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.9 }, loading && { opacity: 0.7 }]}
                            onPress={handleNext}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>{t('auth.continue', 'Continue')}</Text>}
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
    title: { fontSize: 28, fontWeight: '800', color: AppColors.textPrimary },
    subtitle: { fontSize: 15, color: '#4A5568', marginTop: 10, lineHeight: 22 },
    form: { gap: 18 },
    inputGroup: { gap: 6 },
    label: { fontSize: 14, fontWeight: '600', color: AppColors.textPrimary },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
    input: { flex: 1, fontSize: 15, color: AppColors.textPrimary, paddingVertical: 0 },
    submitBtn: { backgroundColor: AppColors.ctaButton, paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 8 },
    submitBtnText: { color: AppColors.ctaButtonText, fontSize: 17, fontWeight: '800' },
});
