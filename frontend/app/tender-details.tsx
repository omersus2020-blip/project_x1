import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { fetchTenderById, enrollTender, TenderFromAPI, getStoredUser, isTenderSaved, toggleSaveTender } from '@/constants/api';
import { ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { incrementTenderViews } from '@/constants/api';

function useCountdown(endDate: string | undefined) {
    const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

    useEffect(() => {
        if (!endDate) return;
        function calc() {
            const diff = Math.max(0, new Date(endDate as string).getTime() - Date.now());
            setRemaining({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
                isExpired: diff === 0,
            });
        }
        calc();
        const interval = setInterval(calc, 1000);
        return () => clearInterval(interval);
    }, [endDate]);

    return remaining;
}

function getDiscountPercent(original: number, current: number): number {
    if (original <= 0) return 0;
    return Math.round(((original - current) / original) * 100);
}

export default function TenderDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { t } = useTranslation();
    const [tender, setTender] = useState<TenderFromAPI | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    // Call hook unconditionally BEFORE any early returns
    const countdown = useCountdown(tender?.endDate);

    useEffect(() => {
        if (id) {
            loadTender();
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            incrementTenderViews(id as string);
        }
    }, [id]);

    const loadTender = async () => {
        try {
            setLoading(true);
            const data = await fetchTenderById(id);
            setTender(data);

            // Check if saved
            const user = await getStoredUser();
            if (user?.id && id) {
                const res = await isTenderSaved(id, user.id);
                setIsSaved(res.isSaved);
            }
        } catch (error) {
            console.error('Failed to load tender', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            setEnrolling(true);
            const user = await getStoredUser();
            if (!user) {
                Alert.alert(t('auth.signin_required', "Sign In Required"), t('auth.please_signin', "Please sign in to join this tender."));
                return;
            }
            await enrollTender(id, user.id);
            Alert.alert(t('common.success', "Success!"), t('tender.join_success', "You have successfully joined the group deal!"));
            await loadTender(); // Refresh data after joining
        } catch (error: any) {
            Alert.alert(t('common.error', "Error"), error.message || t('tender.join_failed', "Failed to join tender"));
        } finally {
            setEnrolling(false);
        }
    };

    const handleToggleSave = async () => {
        try {
            setSaving(true);
            const user = await getStoredUser();
            if (!user) {
                Alert.alert(t('auth.signin_required', "Sign In Required"), t('auth.please_signin', "Please sign in to save deals."));
                return;
            }
            const res = await toggleSaveTender(id, user.id);
            setIsSaved(res.saved);
        } catch (error) {
            console.error('Failed to toggle save', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={AppColors.textPrimary} />
            </View>
        );
    }

    if (!tender) {
        return (
            <View style={styles.container}>
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={64} color={AppColors.cardBorder} />
                    <Text style={styles.errorText}>{t('tender.not_found', 'Deal not found')}</Text>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>{t('tender.go_back', 'Go Back')}</Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    const discount = getDiscountPercent(tender.originalPrice, tender.currentPrice);
    const savings = tender.originalPrice - tender.currentPrice;
    const progressPercent = Math.min(100, (tender.currentParticipants / tender.targetParticipants) * 100);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Hero Image */}
                <View style={styles.heroCard}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: tender.imageUrl }}
                            style={styles.heroImage}
                            contentFit="cover"
                        />
                        {discount > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>-{discount}%</Text>
                            </View>
                        )}
                    </View>

                    {/* Title + Category */}
                    <View style={styles.titleSection}>
                        <View style={styles.titleRow}>
                            <Text style={styles.productTitle}>{tender.title}</Text>
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{tender.category}</Text>
                            </View>
                        </View>
                        <Text style={styles.description}>{tender.description}</Text>
                    </View>

                    <Text style={styles.description}>{tender.description}</Text>

                    <Text style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                        👀 {(tender as any)?.views || 0} views
                    </Text>

                    {/* Price section */}
                    <View style={styles.priceSection}>
                        <View style={styles.priceCol}>
                            <Text style={styles.priceLabel}>{t('tender.current_price', 'Current Price')}</Text>
                            <Text style={styles.currentPrice}>${tender.currentPrice.toFixed(2)}</Text>
                        </View>
                        <View style={styles.priceDivider} />
                        <View style={styles.priceCol}>
                            <Text style={styles.priceLabel}>{t('tender.regular_price', 'Regular Price')}</Text>
                            <Text style={styles.originalPrice}>${tender.originalPrice.toFixed(2)}</Text>
                        </View>
                        {savings > 0 && (
                            <>
                                <View style={styles.priceDivider} />
                                <View style={styles.priceCol}>
                                    <Text style={styles.priceLabel}>{t('tender.you_save', 'You Save')}</Text>
                                    <Text style={styles.savingsPrice}>${savings.toFixed(2)}</Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Participants section */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="people-outline" size={20} color={AppColors.textPrimary} />
                        <Text style={styles.sectionTitle}>{t('tender.progress', 'Group Progress')}</Text>
                    </View>

                    <View style={styles.participantsInfo}>
                        <Text style={styles.participantsCount}>{tender.currentParticipants}</Text>
                        <Text style={styles.participantsTotal}>/ {tender.targetParticipants} {t('tender.people_joined', 'people joined')}</Text>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
                    </View>

                    <Text style={styles.progressHint}>
                        {tender.targetParticipants - tender.currentParticipants} {t('tender.more_people_needed', 'more people needed to unlock the best price')}
                    </Text>
                </View>

                {/* Discount Ladder */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="stacked-bar-chart" size={20} color={AppColors.textPrimary} />
                        <Text style={styles.sectionTitle}>{t('tender.ladder_title', 'Discount Ladder')}</Text>
                    </View>

                    <View style={styles.ladderContainer}>
                        {(tender.tiers || []).map((tier, i, arr) => {
                            const isReached = tender.currentParticipants >= tier.minParticipants;
                            const isCurrent = isReached && (
                                i === arr.length - 1 ||
                                tender.currentParticipants < arr[i + 1].minParticipants
                            );
                            return (
                                <View key={i} style={styles.ladderStep}>
                                    <View style={[
                                        styles.ladderBar,
                                        {
                                            height: 20 + tier.discountPercent * 1.8,
                                            backgroundColor: isReached ? AppColors.priceGreen : '#E5E7EB',
                                        },
                                        isCurrent && styles.ladderBarCurrent,
                                    ]}>
                                        <Text style={[
                                            styles.ladderPercent,
                                            !isReached && { color: AppColors.textMuted },
                                        ]}>
                                            {tier.discountPercent}%
                                        </Text>
                                    </View>
                                    <Text style={styles.ladderPeople}>{tier.minParticipants}</Text>
                                </View>
                            );
                        })}
                    </View>
                    <View style={styles.ladderLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: AppColors.priceGreen }]} />
                            <Text style={styles.legendText}>{t('tender.unlocked', 'Unlocked')}</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#E5E7EB' }]} />
                            <Text style={styles.legendText}>{t('tender.locked', 'Locked')}</Text>
                        </View>
                    </View>
                </View>

                {/* Countdown Timer */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="access-time" size={20} color={AppColors.textPrimary} />
                        <Text style={styles.sectionTitle}>{t('tender.time_remaining', 'Time Remaining')}</Text>
                    </View>

                    {countdown.isExpired ? (
                        <View style={styles.expiredBanner}>
                            <MaterialIcons name="timer-off" size={24} color={AppColors.textSecondary} />
                            <Text style={styles.expiredText}>{t('tender.deal_expired', 'This deal has expired')}</Text>
                        </View>
                    ) : (
                        <View style={styles.countdownRow}>
                            <View style={styles.countdownItem}>
                                <View style={styles.countdownBox}>
                                    <Text style={styles.countdownValue}>{countdown.days}</Text>
                                </View>
                                <Text style={styles.countdownLabel}>{t('time.days', 'Days')}</Text>
                            </View>
                            <Text style={styles.countdownSeparator}>:</Text>
                            <View style={styles.countdownItem}>
                                <View style={styles.countdownBox}>
                                    <Text style={styles.countdownValue}>{countdown.hours}</Text>
                                </View>
                                <Text style={styles.countdownLabel}>{t('time.hours', 'Hours')}</Text>
                            </View>
                            <Text style={styles.countdownSeparator}>:</Text>
                            <View style={styles.countdownItem}>
                                <View style={styles.countdownBox}>
                                    <Text style={styles.countdownValue}>{countdown.minutes}</Text>
                                </View>
                                <Text style={styles.countdownLabel}>{t('time.min', 'Min')}</Text>
                            </View>
                            <Text style={styles.countdownSeparator}>:</Text>
                            <View style={styles.countdownItem}>
                                <View style={styles.countdownBox}>
                                    <Text style={styles.countdownValue}>{countdown.seconds}</Text>
                                </View>
                                <Text style={styles.countdownLabel}>{t('time.sec', 'Sec')}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* CTA Buttons */}
                <View style={styles.ctaSection}>
                    <Pressable
                        style={({ pressed }) => [styles.primaryCta, pressed && { opacity: 0.9 }, enrolling && { opacity: 0.7 }]}
                        id="join-tender-btn"
                        onPress={handleJoin}
                        disabled={enrolling}
                    >
                        {enrolling ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <>
                                <MaterialIcons name="group-add" size={22} color="#FFFFFF" />
                                <Text style={styles.primaryCtaText}>{t('tender.join_deal', 'Join This Group Deal')}</Text>
                            </>
                        )}
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.secondaryCta,
                            pressed && { backgroundColor: '#F3F4F6' },
                            isSaved && { borderColor: AppColors.textPrimary, backgroundColor: '#F9FAFB' }
                        ]}
                        id="add-to-cart-btn"
                        onPress={handleToggleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color={AppColors.textPrimary} />
                        ) : (
                            <>
                                <MaterialIcons
                                    name={isSaved ? "bookmark" : "bookmark-border"}
                                    size={20}
                                    color={isSaved ? AppColors.textPrimary : AppColors.textPrimary}
                                />
                                <Text style={[styles.secondaryCtaText, isSaved && { fontWeight: '800' }]}>
                                    {isSaved ? t('tender.saved', 'Saved') : t('tender.save_for_later', 'Save for Later')}
                                </Text>
                            </>
                        )}
                    </Pressable>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },

    // Error state
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: AppColors.textSecondary,
    },
    backButton: {
        backgroundColor: AppColors.ctaButton,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },

    // Hero card
    heroCard: {
        backgroundColor: AppColors.cardBackground,
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    imageContainer: {
        width: '100%',
        height: 240,
        backgroundColor: '#F3F4F6',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: AppColors.priceGreen,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
    },
    discountText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },

    // Title
    titleSection: {
        padding: 20,
        paddingBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    productTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: AppColors.textPrimary,
        flex: 1,
    },
    categoryBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: AppColors.textSecondary,
    },
    description: {
        fontSize: 14,
        color: AppColors.textSecondary,
        lineHeight: 20,
        marginTop: 8,
    },

    // Price section
    priceSection: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    priceCol: {
        flex: 1,
        alignItems: 'center',
    },
    priceLabel: {
        fontSize: 12,
        color: AppColors.textMuted,
        marginBottom: 4,
    },
    currentPrice: {
        fontSize: 22,
        fontWeight: '800',
        color: AppColors.priceGreen,
    },
    originalPrice: {
        fontSize: 18,
        fontWeight: '600',
        color: AppColors.textSecondary,
        textDecorationLine: 'line-through',
    },
    savingsPrice: {
        fontSize: 18,
        fontWeight: '800',
        color: AppColors.priceGreen,
    },
    priceDivider: {
        width: 1,
        backgroundColor: '#F3F4F6',
    },

    // Section card
    sectionCard: {
        backgroundColor: AppColors.cardBackground,
        borderRadius: 18,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: AppColors.textPrimary,
    },

    // Participants
    participantsInfo: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 12,
    },
    participantsCount: {
        fontSize: 36,
        fontWeight: '900',
        color: AppColors.textPrimary,
    },
    participantsTotal: {
        fontSize: 16,
        color: AppColors.textSecondary,
    },
    progressContainer: {
        height: 8,
        backgroundColor: AppColors.progressBg,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressBar: {
        height: '100%',
        backgroundColor: AppColors.progressFill,
        borderRadius: 4,
    },
    progressHint: {
        fontSize: 13,
        color: AppColors.textSecondary,
        lineHeight: 18,
    },

    // Discount Ladder
    ladderContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        marginBottom: 16,
    },
    ladderStep: {
        alignItems: 'center',
    },
    ladderBar: {
        width: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 24,
    },
    ladderBarCurrent: {
        borderWidth: 2,
        borderColor: AppColors.textPrimary,
    },
    ladderPercent: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    ladderPeople: {
        fontSize: 11,
        color: AppColors.textSecondary,
        marginTop: 6,
    },
    ladderLegend: {
        flexDirection: 'row',
        gap: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
        color: AppColors.textSecondary,
    },

    // Countdown
    countdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    countdownItem: {
        alignItems: 'center',
    },
    countdownBox: {
        backgroundColor: '#F3F4F6',
        width: 56,
        height: 56,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countdownValue: {
        fontSize: 24,
        fontWeight: '800',
        color: AppColors.textPrimary,
    },
    countdownLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: AppColors.textMuted,
        marginTop: 6,
    },
    countdownSeparator: {
        fontSize: 24,
        fontWeight: '800',
        color: AppColors.textMuted,
        marginBottom: 18,
    },
    expiredBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#F9FAFB',
        paddingVertical: 20,
        borderRadius: 12,
    },
    expiredText: {
        fontSize: 16,
        fontWeight: '600',
        color: AppColors.textSecondary,
    },

    // CTA Buttons
    ctaSection: {
        gap: 10,
        marginTop: 4,
    },
    primaryCta: {
        backgroundColor: AppColors.ctaButton,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 10,
    },
    primaryCtaText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    secondaryCta: {
        backgroundColor: AppColors.cardBackground,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
    },
    secondaryCtaText: {
        fontSize: 15,
        fontWeight: '600',
        color: AppColors.textPrimary,
    },
});
