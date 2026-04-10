import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { loginUser } from '@/constants/api';
import { useTranslation } from 'react-i18next';

export default function SignInScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert(t('common.error', 'Error'), t('auth.error_fill_fields', 'Please fill in all fields'));
            return;
        }

        try {
            setLoading(true);
            await loginUser(email.trim(), password);
            router.replace('/(tabs)');
        } catch (error: any) {
            Alert.alert(t('auth.signin_failed', 'Sign In Failed'), error.message || t('auth.invalid_credentials', 'Invalid email or password'));
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        Alert.alert(t('auth.coming_soon', 'Coming Soon'), t('auth.provider_coming_soon', { provider, defaultValue: `${provider} sign-in will be available soon!` }));
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
                        <Text style={styles.title}>{t('auth.welcome_back', 'Welcome Back')}</Text>
                        <Text style={styles.subtitle}>{t('auth.signin_subtitle', 'Sign in to continue saving with your group')}</Text>
                    </View>

                    {/* Form */}
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
                                    autoCorrect={false}
                                    value={email}
                                    onChangeText={setEmail}
                                    id="signin-email"
                                    importantForAutofill="no"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>{t('auth.password_label', 'Password')}</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons name="lock-outline" size={20} color={AppColors.textMuted} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('auth.password_placeholder', 'Enter your password')}
                                    placeholderTextColor={AppColors.textMuted}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                    id="signin-password"
                                    importantForAutofill="no"
                                />
                                <Pressable onPress={() => setShowPassword(!showPassword)}>
                                    <MaterialIcons
                                        name={showPassword ? 'visibility' : 'visibility-off'}
                                        size={20}
                                        color={AppColors.textMuted}
                                    />
                                </Pressable>
                            </View>
                            <Pressable
                                onPress={() => router.push('/forgot-password')}
                                style={{ alignSelf: 'flex-end', marginTop: 4 }}
                            >
                                <Text style={{ color: '#667eea', fontSize: 13, fontWeight: '600' }}>
                                    {t('auth.forgot_password', 'Forgot Password?')}
                                </Text>
                            </Pressable>
                        </View>

                        <Pressable
                            style={({ pressed }) => [styles.signInButton, pressed && { opacity: 0.9 }, loading && { opacity: 0.7 }]}
                            onPress={handleSignIn}
                            disabled={loading}
                            id="signin-submit"
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.signInButtonText}>{t('auth.signin_btn', 'Sign In')}</Text>
                            )}
                        </Pressable>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>{t('auth.or_continue_with', 'or continue with')}</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social buttons */}
                    <View style={styles.socialRow}>
                        <Pressable
                            style={({ pressed }) => [styles.socialButton, pressed && { backgroundColor: '#F3F4F6' }]}
                            onPress={() => handleSocialLogin('Google')}
                        >
                            <Text style={styles.socialIcon}>G</Text>
                            <Text style={styles.socialText}>Google</Text>
                        </Pressable>
                        <Pressable
                            style={({ pressed }) => [styles.socialButton, pressed && { backgroundColor: '#F3F4F6' }]}
                            onPress={() => handleSocialLogin('Apple')}
                        >
                            <MaterialIcons name="apple" size={20} color={AppColors.textPrimary} />
                            <Text style={styles.socialText}>Apple</Text>
                        </Pressable>
                    </View>

                    {/* Sign up link */}
                    <Pressable
                        style={styles.signUpLink}
                        onPress={() => router.replace('/sign-up')}
                    >
                        <Text style={styles.signUpText}>
                            {t('auth.dont_have_account', "Don't have an account?")} <Text style={styles.signUpBold}>{t('auth.signup_link', 'Sign Up')}</Text>
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
        marginBottom: 32,
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
        gap: 18,
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
        backgroundColor: '#FFFFFF',
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
    signInButton: {
        backgroundColor: AppColors.ctaButton,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 4,
    },
    signInButtonText: {
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

    // Sign up
    signUpLink: {
        alignItems: 'center',
    },
    signUpText: {
        fontSize: 15,
        color: AppColors.textSecondary,
    },
    signUpBold: {
        color: AppColors.textPrimary,
        fontWeight: '700',
    },
});
