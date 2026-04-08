import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    SafeAreaView,
    Pressable,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { verifyOtp, resendOtp } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function OtpVerifyScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { userId, email } = useLocalSearchParams<{ userId: string; email: string }>();

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
    const [resending, setResending] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const hiddenInputRef = useRef<TextInput>(null);
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnims = useRef(
        Array(OTP_LENGTH).fill(null).map(() => new Animated.Value(1))
    ).current;

    // Fade in animation on mount
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        // Auto focus
        setTimeout(() => {
            hiddenInputRef.current?.focus();
        }, 500);
    }, []);

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer <= 0) return;
        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [resendTimer]);

    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleChange = (text: string) => {
        const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
        setOtp(cleaned);

        // Animate the newly added character box
        if (cleaned.length > 0) {
            const index = cleaned.length - 1;
            Animated.sequence([
                Animated.timing(scaleAnims[index], { toValue: 1.15, duration: 80, useNativeDriver: true }),
                Animated.timing(scaleAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
            ]).start();
        }

        // Auto-submit when all digits filled
        if (cleaned.length === OTP_LENGTH) {
            handleVerify(cleaned);
        }
    };

    const handleVerify = async (code?: string) => {
        const otpCode = code || otp;
        if (otpCode.length !== OTP_LENGTH) {
            Alert.alert(
                t('common.error', 'Error'),
                t('otp.error_incomplete', 'Please enter the full 6-digit code')
            );
            return;
        }

        try {
            setLoading(true);
            const data = await verifyOtp(userId!, otpCode);

            // Store token + user
            await AsyncStorage.setItem('auth_token', data.token);
            await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));

            router.replace('/(tabs)');
        } catch (error: any) {
            triggerShake();
            setOtp('');
            hiddenInputRef.current?.focus();
            Alert.alert(
                t('otp.verification_failed', 'Verification Failed'),
                error.message || t('common.error_generic', 'Something went wrong')
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0 || resending) return;
        try {
            setResending(true);
            await resendOtp(userId!);
            setResendTimer(RESEND_COOLDOWN);
            setOtp('');
            hiddenInputRef.current?.focus();
            Alert.alert(
                t('otp.code_resent', 'Code Resent'),
                t('otp.code_resent_message', 'A new verification code has been sent to your email.')
            );
        } catch (error: any) {
            Alert.alert(
                t('common.error', 'Error'),
                error.message || t('otp.resend_failed', 'Failed to resend code. Please try again.')
            );
        } finally {
            setResending(false);
        }
    };

    const maskedEmail = email
        ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c)
        : '***';

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const renderOtpBoxes = () => {
        const boxes = [];
        for (let i = 0; i < OTP_LENGTH; i++) {
            const char = otp[i] || '';
            const isCurrent = i === otp.length;
            const isFilled = i < otp.length;

            boxes.push(
                <Animated.View
                    key={i}
                    style={[
                        styles.otpBoxWrapper,
                        { transform: [{ scale: scaleAnims[i] }] },
                    ]}
                >
                    <View style={[
                        styles.otpBox,
                        isFilled ? styles.otpBoxFilled : null,
                        isFocused && isCurrent ? styles.otpBoxFocused : null,
                    ]}>
                        <Text style={styles.otpText}>{char}</Text>
                        {isFocused && isCurrent && <View style={styles.cursor} />}
                    </View>
                </Animated.View>
            );
        }
        return boxes;
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View style={{ opacity: fadeAnim }}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Pressable onPress={() => router.back()} style={styles.backBtn}>
                                <MaterialIcons name="arrow-back" size={24} color={AppColors.textPrimary} />
                            </Pressable>
                        </View>

                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <View style={styles.iconCircle}>
                                <MaterialIcons name="mark-email-read" size={48} color="#667eea" />
                            </View>
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>
                            {t('otp.verify_title', 'Verify Your Email')}
                        </Text>
                        <Text style={styles.subtitle}>
                            {t('otp.verify_subtitle', 'We\'ve sent a 6-digit verification code to')}
                        </Text>
                        <Text style={styles.emailText}>{maskedEmail}</Text>

                        {/* OTP Input Container */}
                        <Pressable 
                            style={styles.otpPressable} 
                            onPress={() => hiddenInputRef.current?.focus()}
                        >
                            <Animated.View style={[styles.otpContainer, { transform: [{ translateX: shakeAnim }] }]}>
                                {renderOtpBoxes()}
                            </Animated.View>
                            
                            <TextInput
                                ref={hiddenInputRef}
                                style={styles.hiddenInput}
                                value={otp}
                                onChangeText={handleChange}
                                keyboardType="number-pad"
                                maxLength={OTP_LENGTH}
                                textContentType="oneTimeCode"
                                autoComplete="one-time-code"
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                caretHidden={true}
                                autoFocus={false}
                            />
                        </Pressable>

                        {/* Verify Button */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.verifyButton,
                                pressed && { opacity: 0.9 },
                                loading && { opacity: 0.7 },
                            ]}
                            onPress={() => handleVerify()}
                            disabled={loading || otp.length !== OTP_LENGTH}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.verifyButtonText}>
                                    {t('otp.verify_button', 'Verify')}
                                </Text>
                            )}
                        </Pressable>

                        {/* Resend Section */}
                        <View style={styles.resendSection}>
                            <Text style={styles.resendLabel}>
                                {t('otp.didnt_receive', "Didn't receive the code?")}
                            </Text>
                            {resendTimer > 0 ? (
                                <View style={styles.timerRow}>
                                    <MaterialIcons name="timer" size={16} color={AppColors.textMuted} />
                                    <Text style={styles.timerText}>
                                        {t('otp.resend_in', 'Resend in')} {formatTime(resendTimer)}
                                    </Text>
                                </View>
                            ) : (
                                <Pressable
                                    onPress={handleResend}
                                    disabled={resending}
                                    style={({ pressed }) => [
                                        styles.resendButton,
                                        pressed && { opacity: 0.8 },
                                    ]}
                                >
                                    {resending ? (
                                        <ActivityIndicator size="small" color="#667eea" />
                                    ) : (
                                        <Text style={styles.resendButtonText}>
                                            {t('otp.resend_code', 'Resend Code')}
                                        </Text>
                                    )}
                                </Pressable>
                            )}
                        </View>

                        {/* Help text */}
                        <View style={styles.helpSection}>
                            <MaterialIcons name="info-outline" size={16} color={AppColors.textMuted} />
                            <Text style={styles.helpText}>
                                {t('otp.help_text', 'Check your spam folder if you don\'t see the email. The code expires in 5 minutes.')}
                            </Text>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.background,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    header: {
        paddingTop: 16,
        marginBottom: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 20,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#f0f0ff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e0e0ff',
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: AppColors.textPrimary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: AppColors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    emailText: {
        fontSize: 15,
        fontWeight: '700',
        color: AppColors.textPrimary,
        textAlign: 'center',
        marginBottom: 32,
        marginTop: 4,
    },

    // OTP Input
    otpPressable: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 32,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 10,
    },
    otpBoxWrapper: {
        flex: 1,
        marginHorizontal: 4,
    },
    otpBox: {
        height: 56,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: AppColors.cardBorder,
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    otpBoxFilled: {
        borderColor: '#667eea',
        backgroundColor: '#f8f8ff',
    },
    otpBoxFocused: {
        borderColor: '#667eea',
        borderWidth: 2.5,
    },
    otpText: {
        fontSize: 24,
        fontWeight: '800',
        color: AppColors.textPrimary,
    },
    hiddenInput: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.01,
    },
    cursor: {
        position: 'absolute',
        width: 2,
        height: 24,
        backgroundColor: '#667eea',
    },

    verifyButton: {
        backgroundColor: AppColors.ctaButton,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 28,
    },
    verifyButtonText: {
        color: AppColors.ctaButtonText,
        fontSize: 17,
        fontWeight: '800',
    },
    resendSection: {
        alignItems: 'center',
        marginBottom: 28,
    },
    resendLabel: {
        fontSize: 14,
        color: AppColors.textSecondary,
        marginBottom: 10,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timerText: {
        fontSize: 14,
        color: AppColors.textMuted,
        fontWeight: '600',
    },
    resendButton: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#f0f0ff',
        borderWidth: 1,
        borderColor: '#e0e0ff',
    },
    resendButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#667eea',
    },
    helpSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
    },
    helpText: {
        flex: 1,
        fontSize: 13,
        color: AppColors.textMuted,
        lineHeight: 18,
    },
});
