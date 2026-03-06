import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView,
    Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { MOCK_TENDERS } from '@/constants/mock-data';
import { AppColors } from '@/constants/theme';
import { Tender } from '@/constants/types';

// Simulate: user has joined tenders 1, 3, 4
const JOINED_TENDER_IDS = ['1', '3', '4'];

function getStatusLabel(tender: Tender): { text: string; color: string; bg: string } {
    const timeLeft = new Date(tender.endDate).getTime() - Date.now();
    if (timeLeft <= 0) {
        return { text: 'הסתיים', color: '#6B7280', bg: '#F3F4F6' };
    }
    if (tender.currentParticipants >= tender.targetParticipants * 0.9) {
        return { text: 'על סף צניחה!', color: '#DC2626', bg: '#FEF2F2' };
    }
    return { text: 'פעיל', color: AppColors.savingsGreen, bg: '#DCFCE7' };
}

function formatTimeShort(endDate: string): string {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return 'הסתיים';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)} ימים`;
    return `${hours} שעות ${mins} דקות`;
}

export default function CurrentScreen() {
    const router = useRouter();
    const joinedTenders = MOCK_TENDERS.filter((t) =>
        JOINED_TENDER_IDS.includes(t.id)
    );

    const handlePress = (tender: Tender) => {
        router.push({ pathname: '/tender-details', params: { id: tender.id } });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>ההזמנות שלי</Text>
            </View>

            <FlatList
                data={joinedTenders}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialIcons name="shopping-bag" size={80} color={AppColors.cardBorder} />
                        <Text style={styles.emptyTitle}>אין הזמנות עדיין</Text>
                        <Text style={styles.emptySubtitle}>
                            כשתצטרף למכרז, ההזמנות שלך יופיעו כאן
                        </Text>
                    </View>
                }
                ListHeaderComponent={
                    joinedTenders.length > 0 ? (
                        <Text style={styles.countText}>
                            {joinedTenders.length} מכרזים פעילים
                        </Text>
                    ) : null
                }
                renderItem={({ item }) => {
                    const status = getStatusLabel(item);
                    const savings = item.startingPrice - item.currentPrice;
                    return (
                        <Pressable
                            style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
                            onPress={() => handlePress(item)}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>{item.title}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                                    <Text style={[styles.statusText, { color: status.color }]}>
                                        {status.text}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.cardBody}>
                                {/* Price info */}
                                <View style={styles.infoRow}>
                                    <MaterialIcons name="attach-money" size={18} color={AppColors.primaryBlue} />
                                    <Text style={styles.infoLabel}>מחיר נוכחי:</Text>
                                    <Text style={styles.infoValue}>₪{item.currentPrice}</Text>
                                </View>

                                {/* Participants */}
                                <View style={styles.infoRow}>
                                    <MaterialIcons name="people" size={18} color={AppColors.primaryBlue} />
                                    <Text style={styles.infoLabel}>משתתפים:</Text>
                                    <Text style={styles.infoValue}>
                                        {item.currentParticipants}/{item.targetParticipants}
                                    </Text>
                                </View>

                                {/* Time left */}
                                <View style={styles.infoRow}>
                                    <MaterialIcons name="access-time" size={18} color={AppColors.accentOrange} />
                                    <Text style={styles.infoLabel}>זמן שנותר:</Text>
                                    <Text style={styles.infoValue}>{formatTimeShort(item.endDate)}</Text>
                                </View>
                            </View>

                            {/* Savings footer */}
                            {savings > 0 && (
                                <View style={styles.savingsFooter}>
                                    <MaterialIcons name="trending-down" size={16} color={AppColors.savingsGreen} />
                                    <Text style={styles.savingsText}>
                                        חסכת עד כה: ₪{savings}
                                    </Text>
                                </View>
                            )}

                            {/* Progress bar */}
                            <View style={styles.progressBarBg}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        {
                                            width: `${Math.min(
                                                100,
                                                (item.currentParticipants / item.targetParticipants) * 100
                                            )}%`,
                                        },
                                    ]}
                                />
                            </View>
                        </Pressable>
                    );
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: AppColors.primaryBlue,
        paddingVertical: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        writingDirection: 'rtl',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    countText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.sectionTitle,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 12,
        writingDirection: 'rtl',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
    },
    cardHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: AppColors.sectionTitle,
        writingDirection: 'rtl',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        writingDirection: 'rtl',
    },
    cardBody: {
        gap: 8,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: AppColors.subtitleText,
        writingDirection: 'rtl',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '700',
        color: AppColors.sectionTitle,
    },
    savingsFooter: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#DCFCE7',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    savingsText: {
        fontSize: 14,
        fontWeight: '700',
        color: AppColors.savingsGreen,
        writingDirection: 'rtl',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: AppColors.primaryBlueLight,
        borderRadius: 3,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: AppColors.sectionTitle,
        marginTop: 16,
        writingDirection: 'rtl',
    },
    emptySubtitle: {
        fontSize: 15,
        color: AppColors.subtitleText,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 22,
        writingDirection: 'rtl',
    },
});
