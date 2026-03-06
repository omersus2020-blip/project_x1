import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { AppColors } from '@/constants/theme';
import { Tender } from '@/constants/types';

interface TenderCardProps {
    tender: Tender;
    onPress: (tender: Tender) => void;
}

function formatTimeLeft(endDate: string): string {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return 'הסתיים';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function TenderCard({ tender, onPress }: TenderCardProps) {
    const [timeLeft, setTimeLeft] = useState(formatTimeLeft(tender.endDate));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(formatTimeLeft(tender.endDate));
        }, 1000);
        return () => clearInterval(interval);
    }, [tender.endDate]);

    return (
        <View style={styles.cardWrapper}>
            <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => onPress(tender)}
                id={`tender-card-${tender.id}`}
            >
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: tender.imageUrl }}
                        style={styles.image}
                        contentFit="contain"
                    />
                </View>
                <Text style={styles.title} numberOfLines={2}>{tender.title}</Text>

                <View style={styles.priceContainer}>
                    <Text style={styles.currentPrice}>₪{tender.currentPrice}</Text>
                    <Text style={styles.originalPrice}>₪{tender.startingPrice}</Text>
                </View>

                <View style={styles.progressContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            { width: `${Math.min(100, (tender.currentParticipants / tender.targetParticipants) * 100)}%` }
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>{tender.currentParticipants} / {tender.targetParticipants} משתתפים</Text>

                <Text style={styles.countdown}>⏱ {timeLeft}</Text>
                <View style={styles.ctaButtonWrapper}>
                    <Pressable
                        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
                        onPress={() => onPress(tender)}
                        id={`tender-cta-${tender.id}`}
                    >
                        <Text style={styles.ctaText}>הצע הצעה</Text>
                    </Pressable>
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    cardWrapper: {
        flex: 1,
        margin: 6,
        borderRadius: 16,
        backgroundColor: AppColors.cardBackground,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden', // crucial for Android border radius with nested Pressables
    },
    card: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        borderRadius: 16,
    },
    cardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    imageContainer: {
        width: '100%',
        height: 90,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden',
    },
    image: {
        width: 70,
        height: 70,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: AppColors.sectionTitle,
        textAlign: 'center',
        marginBottom: 4,
        writingDirection: 'rtl',
    },
    priceContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 6,
    },
    currentPrice: {
        fontSize: 16,
        fontWeight: '800',
        color: AppColors.primaryBlue,
        writingDirection: 'rtl',
    },
    originalPrice: {
        fontSize: 12,
        color: '#6B7280',
        textDecorationLine: 'line-through',
        writingDirection: 'rtl',
    },
    progressContainer: {
        width: '100%',
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        marginBottom: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: AppColors.primaryBlue,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 8,
        textAlign: 'center',
        writingDirection: 'rtl',
    },
    countdown: {
        fontSize: 11,
        color: AppColors.countdownText,
        textAlign: 'center',
        marginBottom: 8,
    },
    ctaButtonWrapper: {
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
    },
    ctaButton: {
        backgroundColor: AppColors.ctaButton,
        paddingVertical: 8,
        paddingHorizontal: 20,
        width: '100%',
        alignItems: 'center',
    },
    ctaPressed: {
        backgroundColor: AppColors.primaryBlue,
    },
    ctaText: {
        color: AppColors.ctaButtonText,
        fontSize: 14,
        fontWeight: '700',
        writingDirection: 'rtl',
    },
});
