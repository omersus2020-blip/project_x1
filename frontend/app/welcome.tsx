import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppColors } from '@/constants/theme';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoSection}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>GD</Text>
                    </View>
                    <Text style={styles.appName}>Group Deals</Text>
                    <Text style={styles.tagline}>Save more together</Text>
                </View>

                {/* Feature highlights */}
                <View style={styles.features}>
                    <View style={styles.featureRow}>
                        <View style={styles.featureIcon}>
                            <Text style={styles.featureEmoji}>🤝</Text>
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>Group Buying Power</Text>
                            <Text style={styles.featureDesc}>Join others to unlock bigger discounts</Text>
                        </View>
                    </View>
                    <View style={styles.featureRow}>
                        <View style={styles.featureIcon}>
                            <Text style={styles.featureEmoji}>💰</Text>
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>Save on Every Purchase</Text>
                            <Text style={styles.featureDesc}>The more people join, the lower the price</Text>
                        </View>
                    </View>
                    <View style={styles.featureRow}>
                        <View style={styles.featureIcon}>
                            <Text style={styles.featureEmoji}>⚡</Text>
                        </View>
                        <View style={styles.featureTextContainer}>
                            <Text style={styles.featureTitle}>Real-Time Deals</Text>
                            <Text style={styles.featureDesc}>Watch prices drop as groups fill up</Text>
                        </View>
                    </View>
                </View>

                {/* CTA Buttons */}
                <View style={styles.ctaSection}>
                    <Pressable
                        style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
                        onPress={() => router.push('/sign-up')}
                        id="get-started-btn"
                    >
                        <Text style={styles.primaryButtonText}>Get Started</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.secondaryButton, pressed && { backgroundColor: '#F3F4F6' }]}
                        onPress={() => router.push('/sign-in')}
                        id="sign-in-link"
                    >
                        <Text style={styles.secondaryButtonText}>
                            Already have an account? <Text style={styles.signInLink}>Sign In</Text>
                        </Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },

    // Logo
    logoSection: {
        alignItems: 'center',
        gap: 8,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: AppColors.textPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    logoText: {
        fontSize: 36,
        fontWeight: '900',
        color: AppColors.white,
        letterSpacing: 2,
    },
    appName: {
        fontSize: 32,
        fontWeight: '800',
        color: AppColors.textPrimary,
    },
    tagline: {
        fontSize: 16,
        color: AppColors.textSecondary,
    },

    // Features
    features: {
        gap: 20,
        paddingHorizontal: 8,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureEmoji: {
        fontSize: 22,
    },
    featureTextContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.textPrimary,
    },
    featureDesc: {
        fontSize: 13,
        color: AppColors.textSecondary,
        marginTop: 2,
    },

    // CTA
    ctaSection: {
        gap: 12,
    },
    primaryButton: {
        backgroundColor: AppColors.ctaButton,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: AppColors.ctaButtonText,
        fontSize: 17,
        fontWeight: '800',
    },
    secondaryButton: {
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 15,
        color: AppColors.textSecondary,
    },
    signInLink: {
        color: AppColors.textPrimary,
        fontWeight: '700',
    },
});
