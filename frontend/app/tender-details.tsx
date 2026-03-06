import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    SafeAreaView,
    Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { MOCK_TENDERS } from '@/constants/mock-data';
import { AppColors } from '@/constants/theme';

function useCountdown(endDate: string) {
    const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        function calc() {
            const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
            setRemaining({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        }
        calc();
        const interval = setInterval(calc, 1000);
        return () => clearInterval(interval);
    }, [endDate]);

    return remaining;
}

export default function TenderDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const tender = MOCK_TENDERS.find((t) => t.id === id);

    if (!tender) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>המכרז לא נמצא</Text>
            </SafeAreaView>
        );
    }

    const countdown = useCountdown(tender.endDate);
    const savings = tender.startingPrice - tender.currentPrice;
    const potentialSavings = tender.startingPrice - tender.targetPrice;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Title */}
                <Text style={styles.pageTitle}>פרטי המכרז: {tender.title}</Text>

                {/* Image & Price tiers */}
                <View style={styles.tierSection}>
                    <Text style={styles.tierTitle}>גרף מדרגות מחיר</Text>
                    <View style={styles.tierRow}>
                        <Image source={{ uri: tender.imageUrl }} style={styles.productImage} contentFit="contain" />
                        <View style={styles.tiersContainer}>
                            {tender.priceTiers.map((tier, i) => (
                                <View
                                    key={i}
                                    style={[
                                        styles.tierBar,
                                        {
                                            height: 20 + tier.discountPercent * 1.2,
                                            backgroundColor: tender.currentParticipants >= tier.minParticipants
                                                ? AppColors.savingsGreen
                                                : '#E5E7EB',
                                        },
                                    ]}
                                >
                                    <Text style={styles.tierPercent}>{tier.discountPercent}%</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View style={styles.tierLabels}>
                        {tender.priceTiers.map((tier, i) => (
                            <Text key={i} style={styles.tierLabel}>{tier.minParticipants}</Text>
                        ))}
                    </View>
                </View>

                {/* Savings info */}
                <View style={styles.savingsCard}>
                    <Text style={styles.savingsText}>
                        חסכת כבר {savings} ש״ח! פוטנציאל חיסכון נוסף של {potentialSavings - savings} ש״ח ליעד.
                    </Text>
                </View>

                {/* Live participants */}
                <View style={styles.participantsCard}>
                    <Text style={styles.participantsTitle}>מונה משתתפים חי</Text>
                    <View style={styles.participantsRow}>
                        <MaterialIcons name="people" size={36} color={AppColors.primaryBlue} />
                        <Text style={styles.participantsCount}>
                            {tender.currentParticipants} משתתפים
                        </Text>
                    </View>
                    <Text style={styles.participantsTarget}>
                        מטרה {tender.targetParticipants} לירידה הבאה ל-{tender.targetPrice} ש״ח
                    </Text>
                </View>

                {/* Countdown */}
                <View style={styles.countdownCard}>
                    <View style={styles.countdownRow}>
                        <View style={styles.countdownItem}>
                            <Text style={styles.countdownValue}>{countdown.days}</Text>
                            <Text style={styles.countdownLabel}>ימים</Text>
                        </View>
                        <View style={styles.countdownItem}>
                            <Text style={styles.countdownValue}>{countdown.hours}</Text>
                            <Text style={styles.countdownLabel}>שעות</Text>
                        </View>
                        <View style={styles.countdownItem}>
                            <Text style={styles.countdownValue}>{countdown.minutes}</Text>
                            <Text style={styles.countdownLabel}>דקות</Text>
                        </View>
                        <View style={styles.countdownItem}>
                            <Text style={styles.countdownValue}>{countdown.seconds}</Text>
                            <Text style={styles.countdownLabel}>שניות</Text>
                        </View>
                    </View>
                </View>

                {/* CTA buttons */}
                <View style={styles.ctaRow}>
                    <View style={styles.secondaryCtaWrapper}>
                        <Pressable
                            style={({ pressed }) => [styles.secondaryCta, pressed && { opacity: 0.8 }]}
                            id="add-to-cart-btn"
                        >
                            <Text style={styles.secondaryCtaText}>הוספה{'\n'}חינם ללא עלות</Text>
                        </Pressable>
                    </View>
                    <View style={styles.primaryCtaWrapper}>
                        <Pressable
                            style={({ pressed }) => [styles.primaryCta, pressed && { opacity: 0.9 }]}
                            id="join-tender-btn"
                        >
                            <Text style={styles.primaryCtaText}>הצטרף למכרז עכשיו</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: AppColors.sectionTitle,
        textAlign: 'center',
        marginBottom: 16,
        writingDirection: 'rtl',
    },
    errorText: {
        fontSize: 18,
        color: '#EF4444',
        textAlign: 'center',
        marginTop: 60,
        writingDirection: 'rtl',
    },

    // Price tiers
    tierSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    tierTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.sectionTitle,
        textAlign: 'center',
        marginBottom: 12,
        writingDirection: 'rtl',
    },
    tierRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 16,
    },
    productImage: {
        width: 80,
        height: 80,
    },
    tiersContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 6,
    },
    tierBar: {
        width: 36,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 20,
    },
    tierPercent: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    tierLabels: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 16,
        gap: 22,
        marginTop: 4,
    },
    tierLabel: {
        fontSize: 10,
        color: AppColors.subtitleText,
        width: 36,
        textAlign: 'center',
    },

    // Savings
    savingsCard: {
        backgroundColor: AppColors.accentOrange,
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
    },
    savingsText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        writingDirection: 'rtl',
        lineHeight: 22,
    },

    // Participants
    participantsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    participantsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.sectionTitle,
        marginBottom: 10,
        writingDirection: 'rtl',
    },
    participantsRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 10,
        marginBottom: 6,
    },
    participantsCount: {
        fontSize: 28,
        fontWeight: '900',
        color: AppColors.primaryBlue,
        writingDirection: 'rtl',
    },
    participantsTarget: {
        fontSize: 13,
        color: AppColors.subtitleText,
        writingDirection: 'rtl',
    },

    // Countdown
    countdownCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    countdownRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        gap: 20,
    },
    countdownItem: {
        alignItems: 'center',
    },
    countdownValue: {
        fontSize: 32,
        fontWeight: '900',
        color: AppColors.sectionTitle,
    },
    countdownLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: AppColors.subtitleText,
        marginTop: 2,
        writingDirection: 'rtl',
    },

    // CTA
    ctaRow: {
        flexDirection: 'row-reverse',
        gap: 12,
    },
    primaryCtaWrapper: {
        flex: 2,
        borderRadius: 14,
        overflow: 'hidden',
    },
    primaryCta: {
        backgroundColor: AppColors.accentOrange,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryCtaText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        writingDirection: 'rtl',
    },
    secondaryCtaWrapper: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
    },
    secondaryCta: {
        backgroundColor: AppColors.savingsGreen,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryCtaText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        writingDirection: 'rtl',
    },
});
