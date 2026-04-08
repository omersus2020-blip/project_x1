import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { registerUser } from '@/constants/api';
import { useTranslation } from 'react-i18next';

export default function SignUpScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert(t('common.error', 'Error'), t('auth.error_fill_fields', 'Please fill in all fields'));
            return;
        }
        const emailRegax = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegax.test(email)) {
            Alert.alert(t('common.error', 'Error'), t('auth.error_invalid_email', 'Please enter a valid email'));
            return;
        }


        if (password !== confirmPassword) {
            Alert.alert(t('common.error', 'Error'), t('auth.error_password_match', 'Passwords do not match'));
            return;
        }

        if (password.length < 6) {
            Alert.alert(t('common.error', 'Error'), t('auth.error_password_length', 'Password must be at least 6 characters'));
            return;
        }

        try {
            setLoading(true);
            const data = await registerUser(name.trim(), email.trim(), password);
            // Navigate to OTP verification screen
            router.replace({
                pathname: '/otp-verify',
                params: { userId: data.userId, email: data.email },
            });
        } catch (error: any) {
            Alert.alert(t('auth.signup_failed', 'Sign Up Failed'), error.message || t('common.error_generic', 'Something went wrong'));
        } finally {
            setLoading(false);
        }
    };

    const handleSocialSignUp = (provider: string) => {
        Alert.alert(t('auth.coming_soon', 'Coming Soon'), t('auth.provider_signup_coming_soon', { provider, defaultValue: `${provider} sign-up will be available soon!` }));
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
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable onPress={() => router.back()} style={styles.backBtn}>
                            <MaterialIcons name="arrow-back" size={24} color={AppColors.textPrimary} />
                        </Pressable>
                        <Text style={styles.title}>{t('auth.create_account', 'Create Account')}</Text>
                        <Text style={styles.subtitle}>{t('auth.signup_subtitle', 'Join Group Deals and start saving today')}</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('auth.name_label', 'Full Name')}</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons name="person-outline" size={20} color={AppColors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.name_placeholder', 'Enter your full name')}
                                    placeholderTextColor={AppColors.textMuted}
                                    value={name}
                                    onChangeText={setName}
                                    id="signup-name"
                                />
                            </View>
                        </View>

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
                                    autoCorrect={false}
                                    value={email}
                                    onChangeText={setEmail}
                                    id="signup-email"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('auth.password_label', 'Password')}</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons name="lock-outline" size={20} color={AppColors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.create_password_placeholder', 'Create a password (min 6 chars)')}
                                    placeholderTextColor={AppColors.textMuted}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    id="signup-password"
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)}>
                                    <MaterialIcons
                                        name={showPassword ? 'visibility' : 'visibility-off'}
                                        size={20}
                                        color={AppColors.textMuted}
                                    />
                                </Pressable>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('auth.confirm_password_label', 'Confirm Password')}</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons name="lock-outline" size={20} color={AppColors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.confirm_password_placeholder', 'Confirm your password')}
                                    placeholderTextColor={AppColors.textMuted}
                                    secureTextEntry={!showPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    id="signup-confirm-password"
                                />
                            </View>
                        </View>

                        <Pressable
                            style={({ pressed }) => [styles.submitButton, pressed && { opacity: 0.9 }, loading && { opacity: 0.7 }]}
                            onPress={handleSignUp}
                            disabled={loading}
                            id="signup-submit"
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>{t('auth.create_account', 'Create Account')}</Text>
                            )}
                        </Pressable>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>{t('auth.or_signup_with', 'or sign up with')}</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social buttons */}
                    <View style={styles.socialRow}>
                        <Pressable
                            style={({ pressed }) => [styles.socialButton, pressed && { backgroundColor: '#F3F4F6' }]}
                            onPress={() => handleSocialSignUp('Google')}
                        >
                            <Text style={styles.socialIcon}>G</Text>
                            <Text style={styles.socialText}>Google</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.socialButton, pressed && { backgroundColor: '#F3F4F6' }]}
                            onPress={() => handleSocialSignUp('Apple')}
                        >
                            <MaterialIcons name="apple" size={20} color={AppColors.textPrimary} />
                            <Text style={styles.socialText}>Apple</Text>
                        </Pressable>
                    </View>

                    {/* Sign in link */}
                    <Pressable
                        style={styles.signInLink}
                        onPress={() => router.replace('/sign-in')}
                    >
                        <Text style={styles.signInText}>
                            {t('auth.already_have_account', 'Already have an account?')} <Text style={styles.signInBold}>{t('auth.signin_link', 'Sign In')}</Text>
                        </Text>
                    </Pressable>
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

    // Header
    header: {
        paddingTop: 16,
        marginBottom: 28,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: AppColors.textPrimary,
    },
    subtitle: {
        fontSize: 15,
        color: AppColors.textSecondary,
        marginTop: 6,
    },

    // Form
    form: {
        gap: 16,
        marginBottom: 28,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.textPrimary,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        paddingHorizontal: 14,
        paddingVertical: 14,
        gap: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: AppColors.textPrimary,
        paddingVertical: 0,
    },
    submitButton: {
        backgroundColor: AppColors.ctaButton,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 4,
    },
    submitButtonText: {
        color: AppColors.ctaButtonText,
        fontSize: 17,
        fontWeight: '800',
    },

    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: AppColors.cardBorder,
    },
    dividerText: {
        fontSize: 13,
        color: AppColors.textMuted,
    },

    // Social
    socialRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 28,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        borderRadius: 14,
        paddingVertical: 14,
        backgroundColor: AppColors.cardBackground,
    },
    socialIcon: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.textPrimary,
    },
    socialText: {
        fontSize: 15,
        fontWeight: '600',
        color: AppColors.textPrimary,
    },

    // Sign in
    signInLink: {
        alignItems: 'center',
    },
    signInText: {
        fontSize: 15,
        color: AppColors.textSecondary,
    },
    signInBold: {
        color: AppColors.textPrimary,
        fontWeight: '700',
    },
});
