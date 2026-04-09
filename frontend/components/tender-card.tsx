import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { Tender } from '@/constants/types';
import { useTranslation } from 'react-i18next';

interface TenderCardProps {
    tender: Tender;
    onPress: (tender: Tender) => void;
}

function getDiscountPercent(original: number, current: number): number {
    if (original <= 0) return 0;
    return Math.round(((original - current) / original) * 100);
}

function formatTimeLeft(endDate: string, t: any): { text: string; isExpired: boolean } {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return { text: t('tender.expired', 'Expired'), isExpired: true };
    const totalMinutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return { text: `${days}${t('tender.d', 'd')} ${remainingHours}${t('tender.h', 'h')}`, isExpired: false };
    }
    return { text: `${hours}${t('tender.h', 'h')} ${minutes}${t('tender.m', 'm')}`, isExpired: false };
}

export function TenderCard({ tender, onPress }: TenderCardProps) {
    const { t } = useTranslation();
    const discount = getDiscountPercent(tender.startingPrice, tender.currentPrice);
    const progressPercent = Math.min(100, (tender.currentParticipants / tender.targetParticipants) * 100);
    const timeInfo = formatTimeLeft(tender.endDate, t);

    return (
        <View style={styles.cardWrapper}>
            <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => onPress(tender)}
                id={`tender-card-${tender.id}`}
            >
                {/* Top section: Image + Info */}
                <View style={styles.topSection}>
                    {/* Product Image */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: tender.imageUrl }}
                            style={styles.image}
                            contentFit="cover"
                        />
                        {discount > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>-{discount}%</Text>
                            </View>
                        )}
                    </View>

                    {/* Info section */}
                    <View style={styles.infoSection}>
                        {/* Title + Category row */}
                        <View style={styles.titleRow}>
                            <Text style={styles.title} numberOfLines={2}>{tender.title}</Text>
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{tender.category}</Text>
                            </View>
                        </View>

                        {/* Price row */}
                        <View style={styles.priceRow}>
                            <Text style={styles.currentPrice}>${tender.currentPrice.toFixed(2)}</Text>
                            {discount > 0 && (
                                <Text style={styles.originalPrice}>${tender.startingPrice.toFixed(2)}</Text>
                            )}
                        </View>

                        {/* People + Time row */}
                        <View style={styles.metaRow}>
                            <View style={styles.peopleInfo}>
                                <MaterialIcons name="people-outline" size={16} color={AppColors.textSecondary} />
                                <Text style={styles.metaText}>
                                    <Text style={styles.metaBold}>{tender.currentParticipants}/{tender.targetParticipants}</Text> {t('tender.people', 'people')}
                                </Text>
                            </View>
                            <View style={styles.timeInfo}>
                                <MaterialIcons name="access-time" size={14} color={AppColors.textSecondary} />
                                <Text style={[styles.metaText, timeInfo.isExpired && styles.expiredText]}>
                                    {timeInfo.text}
                                </Text>
                            </View>
                        </View>

                        {/* Progress bar */}
                        <View style={styles.progressContainer}>
                            <View
                                style={[
                                    styles.progressBar,
                                    { width: `${progressPercent}%` },
                                ]}
                            />
                        </View>
                    </View>
                </View>

                {/* Join Group button */}
                <View style={styles.ctaButtonWrapper}>
                    <Pressable
                        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
                        onPress={() => onPress(tender)}
                        id={`tender-cta-${tender.id}`}
                    >
                        <Text style={styles.ctaText}>{t('tender.join_group', 'Join Group')}</Text>
                    </Pressable>
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    cardWrapper: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        backgroundColor: AppColors.cardBackground,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
        overflow: 'hidden',
    },
    card: {
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardPressed: {
        opacity: 0.95,
    },

    // Top section (image + info side by side)
    topSection: {
        flexDirection: 'row',
        padding: 12,
        gap: 12,
    },

    // Image
    imageContainer: {
        width: 110,
        height: 110,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    discountBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: AppColors.discountBadge,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    discountText: {
        color: AppColors.discountBadgeText,
        fontSize: 12,
        fontWeight: '700',
    },

    // Info section
    infoSection: {
        flex: 1,
        justifyContent: 'space-between',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: AppColors.textPrimary,
        flex: 1,
    },
    categoryBadge: {
        backgroundColor: AppColors.categoryBadge,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
        color: AppColors.categoryBadgeText,
    },

    // Price
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginTop: 4,
    },
    currentPrice: {
        fontSize: 18,
        fontWeight: '800',
        color: AppColors.priceGreen,
    },
    originalPrice: {
        fontSize: 13,
        color: AppColors.textSecondary,
        textDecorationLine: 'line-through',
    },

    // Meta info
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    peopleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    metaText: {
        fontSize: 12,
        color: AppColors.textSecondary,
    },
    metaBold: {
        fontWeight: '700',
        color: AppColors.textPrimary,
    },
    expiredText: {
        color: AppColors.textSecondary,
    },

    // Progress bar
    progressContainer: {
        height: 5,
        backgroundColor: AppColors.progressBg,
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 8,
    },
    progressBar: {
        height: '100%',
        backgroundColor: AppColors.progressFill,
        borderRadius: 3,
    },

    // CTA Button
    ctaButtonWrapper: {
        paddingHorizontal: 12,
        paddingBottom: 12,
        paddingTop: 4,
    },
    ctaButton: {
        backgroundColor: AppColors.ctaButton,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    ctaPressed: {
        backgroundColor: '#333333',
    },
    ctaText: {
        color: AppColors.ctaButtonText,
        fontSize: 15,
        fontWeight: '700',
    },
});
