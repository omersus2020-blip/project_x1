import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, StyleSheet,
    Pressable, ActivityIndicator, Alert, KeyboardAvoidingView,
    Platform, ScrollView, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { verifyOtp, forceResetPassword, resendOtp, getStoredToken } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function ResetPasswordScreen() {
    const { userId, email } = useLocalSearchParams<{ userId: string; email: string }>();
    const router = useRouter();
    const { t } = useTranslation();

    // OTP State
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [verifying, setVerifying] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const inputRefs = useRef<Array<TextInput | null>>([]);
    const scaleAnims = useRef([...Array(OTP_LENGTH)].map(() => new Animated.Value(1))).current;

    // Timer State
    const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
    const [resending, setResending] = useState(false);

    // Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let interval: any;
        if (resendTimer > 0 && !isOtpVerified) {
            interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer, isOtpVerified]);

    const generateStrongPassword = () => {
        const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const specials = '!@#$%^&*';

        let pass = '';
        for (let i = 0; i < 12; i++) {
            const pool = i % 3 === 0 ? numbers : i % 2 === 0 ? specials : letters;
            pass += pool.charAt(Math.floor(Math.random() * pool.length));
        }
        pass += 'A1!a'; // ensure minimal complexity

        setNewPassword(pass);
        setConfirmPassword(pass);
        setShowPassword(true); // Reveal the generated password
    };

    const handleChangeOtp = (text: string, index: number) => {
        if (isOtpVerified) return;

        const digits = text.replace(/[^0-9]/g, '');

        if (digits.length > 1) {
            const newOtp = [...otp];
            for (let i = 0; i < digits.length && index + i < OTP_LENGTH; i++) {
                newOtp[index + i] = digits[i];
                Animated.sequence([
                    Animated.timing(scaleAnims[index + i], { toValue: 1.15, duration: 80, useNativeDriver: true }),
                    Animated.timing(scaleAnims[index + i], { toValue: 1, duration: 80, useNativeDriver: true }),
                ]).start();
            }
            setOtp(newOtp);

            const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
            inputRefs.current[nextIndex]?.focus();

            if (newOtp.join('').length === OTP_LENGTH) {
                handleVerifyOtp(newOtp.join(''));
            }
            return;
        }

        const digit = digits.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        if (digit) {
            Animated.sequence([
                Animated.timing(scaleAnims[index], { toValue: 1.15, duration: 80, useNativeDriver: true }),
                Animated.timing(scaleAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
            ]).start();
        }

        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        if (digit && index === OTP_LENGTH - 1) {
            handleVerifyOtp(newOtp.join(''));
        }
    };

    const handleKeyPressOtp = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
        }
    };

    const handleVerifyOtp = async (code: string) => {
        if (code.length !== OTP_LENGTH) return;
        try {
            setVerifying(true);
            const data = await verifyOtp(userId!, code);

            // Temporary authentication to allow password reset
            await AsyncStorage.setItem('auth_token', data.token);
            await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));

            setIsOtpVerified(true);
            Alert.alert('Code Verified!', 'You can now set a new password.');
        } catch (error: any) {
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
            Alert.alert(t('common.error', 'Error'), error.message || t('common.error_generic', 'Invalid code'));
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0 || resending) return;
        try {
            setResending(true);
            await resendOtp(userId!);
            setResendTimer(RESEND_COOLDOWN);
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            Alert.alert(t('common.error', 'Error'), error.message);
        } finally {
            setResending(false);
        }
    };

    const handleSavePassword = async () => {
        if (!isOtpVerified) return;

        if (newPassword.length < 6) {
            Alert.alert(t('common.error', 'Error'), t('auth.error_password_length', 'Password must be at least 6 characters'));
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(t('common.error', 'Error'), t('auth.error_password_match', 'Passwords do not match'));
            return;
        }

        try {
            setSaving(true);
            await forceResetPassword(newPassword);
            Alert.alert('Success', 'Password has been reset successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        // User is already fully logged in via verifyOtp!
                        router.replace('/(tabs)');
                    }
                }
            ]);
        } catch (error: any) {
            Alert.alert(t('common.error', 'Error'), error.message || 'Failed to update password');
        } finally {
            setSaving(false);
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
                        <Text style={styles.title}>Secure Reset</Text>
                        <Text style={styles.subtitle}>
                            Enter the 6-digit code sent to <Text style={{ fontWeight: '700' }}>{email}</Text>
                        </Text>
                    </View>

                    <View style={styles.formContainer}>
                        {/* OTP SECTION */}
                        <View style={styles.otpSection}>
                            <View style={styles.otpContainer}>
                                {otp.map((digit, index) => (
                                    <Animated.View key={`otp-${index}`} style={[styles.otpBoxWrapper, { transform: [{ scale: scaleAnims[index] }] }]}>
                                        <TextInput
                                            ref={(ref) => { inputRefs.current[index] = ref; }}
                                            style={[styles.otpBox, digit ? styles.otpBoxFilled : null, isOtpVerified ? styles.otpBoxSuccess : null]}
                                            value={digit}
                                            onChangeText={(text) => handleChangeOtp(text, index)}
                                            onKeyPress={(e) => handleKeyPressOtp(e, index)}
                                            keyboardType="number-pad"
                                            maxLength={OTP_LENGTH}
                                            textContentType="oneTimeCode"
                                            autoComplete="sms-otp"
                                            selectTextOnFocus
                                            editable={!isOtpVerified && !verifying}
                                        />
                                    </Animated.View>
                                ))}
                            </View>

                            {verifying ? (
                                <ActivityIndicator style={{ marginTop: 20 }} color={AppColors.ctaButton} />
                            ) : !isOtpVerified && (
                                <View style={styles.resendContainer}>
                                    <Text style={styles.resendText}>Didn't receive the code? </Text>
                                    <Pressable onPress={handleResend} disabled={resendTimer > 0 || resending}>
                                        <Text style={[styles.resendLink, (resendTimer > 0 || resending) && styles.resendLinkDisabled]}>
                                            {resendTimer > 0 ? `Resend Check in ${resendTimer}s` : 'Resend Code'}
                                        </Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>

                        <View style={styles.divider} />

                        {/* NEW PASSWORD SECTION */}
                        <View style={[styles.passwordSection, !isOtpVerified && { opacity: 0.5 }]}>
                            <View style={styles.inputGroup}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={styles.label}>New Password</Text>
                                    {isOtpVerified && (
                                        <Pressable onPress={generateStrongPassword}>
                                            <Text style={{ color: AppColors.ctaButton, fontSize: 13, fontWeight: '600' }}>{t('auth.auto_generate', 'Auto-Generate')}</Text>
                                        </Pressable>
                                    )}
                                </View>
                                <View style={[styles.inputContainer, !isOtpVerified && { backgroundColor: '#F0F0F0' }]}>
                                    <MaterialIcons name="lock-outline" size={20} color={AppColors.textMuted} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter new password"
                                        placeholderTextColor={AppColors.textMuted}
                                        secureTextEntry={!showPassword}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        editable={isOtpVerified}
                                    />
                                    <Pressable onPress={() => setShowPassword(!showPassword)} disabled={!isOtpVerified}>
                                        <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={20} color={AppColors.textMuted} />
                                    </Pressable>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <View style={[styles.inputContainer, !isOtpVerified && { backgroundColor: '#F0F0F0' }]}>
                                    <MaterialIcons name="lock-outline" size={20} color={AppColors.textMuted} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Repeat new password"
                                        placeholderTextColor={AppColors.textMuted}
                                        secureTextEntry={!showPassword}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        editable={isOtpVerified}
                                    />
                                </View>
                            </View>

                            <Pressable
                                style={({ pressed }) => [styles.submitBtn, (!isOtpVerified || saving) && { opacity: 0.6 }, pressed && { opacity: 0.8 }]}
                                onPress={handleSavePassword}
                                disabled={!isOtpVerified || saving}
                            >
                                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Update Password</Text>}
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: AppColors.background },
    scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
    header: { paddingTop: 16, marginBottom: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '800', color: AppColors.textPrimary },
    subtitle: { fontSize: 15, color: '#4A5568', marginTop: 10, lineHeight: 22 },

    formContainer: { gap: 24 },
    otpSection: { alignItems: 'center', marginVertical: 10 },
    otpContainer: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
    otpBoxWrapper: {},
    otpBox: { width: 48, height: 56, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, fontSize: 24, fontWeight: '700', textAlign: 'center', color: AppColors.textPrimary, backgroundColor: '#FFF' },
    otpBoxFilled: { borderColor: AppColors.ctaButton, backgroundColor: '#F0F4FF' },
    otpBoxSuccess: { borderColor: '#4CAF50', backgroundColor: '#E8F5E9', color: '#2E7D32' },
    resendContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 24, justifyContent: 'center' },
    resendText: { fontSize: 14, color: AppColors.textSecondary },
    resendLink: { fontSize: 14, color: AppColors.ctaButton, fontWeight: '700' },
    resendLinkDisabled: { color: AppColors.textMuted },

    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 },

    passwordSection: { gap: 18 },
    inputGroup: { gap: 6 },
    label: { fontSize: 14, fontWeight: '600', color: AppColors.textPrimary },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
    input: { flex: 1, fontSize: 15, color: AppColors.textPrimary, paddingVertical: 0 },

    submitBtn: { backgroundColor: AppColors.ctaButton, paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 8 },
    submitBtnText: { color: AppColors.ctaButtonText, fontSize: 17, fontWeight: '800' },
});
