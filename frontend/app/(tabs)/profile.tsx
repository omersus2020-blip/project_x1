import React from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { MOCK_USER } from '@/constants/mock-data';
import { AppColors } from '@/constants/theme';
import { TenderHistoryEntry } from '@/constants/types';

function HistoryItem({ item }: { item: TenderHistoryEntry }) {
    return (
        <View style={styles.historyCard}>
            <View style={styles.historyIconContainer}>
                <MaterialIcons name={item.icon as any} size={28} color={AppColors.primaryBlue} />
            </View>
            <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <Text style={styles.historyDate}>{item.date}</Text>
            </View>
            <View style={styles.savingsBadge}>
                <Text style={styles.savingsBadgeText}>חיסכון {item.savings} ש״ח</Text>
            </View>
        </View>
    );
}

export default function ProfileScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={MOCK_USER.tenderHistory}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.greeting}>שלום, {MOCK_USER.name}!</Text>
                        </View>

                        {/* Avatar + Savings */}
                        <View style={styles.profileSection}>
                            <View style={styles.avatarContainer}>
                                <MaterialIcons name="person" size={50} color={AppColors.primaryBlue} />
                            </View>

                            <View style={styles.savingsCard}>
                                <View style={styles.savingsRow}>
                                    <MaterialIcons name="trending-up" size={28} color={AppColors.savingsGreen} />
                                    <Text style={styles.savingsAmount}>
                                        ₪{MOCK_USER.totalSavings.toLocaleString()}
                                    </Text>
                                    <MaterialIcons name="verified" size={24} color={AppColors.primaryBlueLight} />
                                </View>
                                <Text style={styles.savingsLabel}>החיסכון המצטבר שלך</Text>
                            </View>
                        </View>

                        {/* History title */}
                        <View style={styles.sectionHeader}>
                            <MaterialIcons name="history" size={22} color={AppColors.sectionTitle} />
                            <Text style={styles.sectionTitle}>היסטוריית מכרזים</Text>
                        </View>
                    </>
                }
                renderItem={({ item }) => <HistoryItem item={item} />}
                ListFooterComponent={<View style={{ height: 30 }} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    listContent: {
        paddingBottom: 20,
    },
    header: {
        backgroundColor: AppColors.primaryBlue,
        paddingVertical: 28,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    greeting: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        writingDirection: 'rtl',
    },
    profileSection: {
        alignItems: 'center',
        marginTop: -30,
        paddingHorizontal: 20,
    },
    avatarContainer: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: '#DBEAFE',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    savingsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingVertical: 22,
        paddingHorizontal: 30,
        marginTop: 16,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },
    savingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    savingsAmount: {
        fontSize: 38,
        fontWeight: '900',
        color: AppColors.sectionTitle,
    },
    savingsLabel: {
        fontSize: 15,
        color: AppColors.subtitleText,
        marginTop: 6,
        writingDirection: 'rtl',
    },
    sectionHeader: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 28,
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: AppColors.sectionTitle,
        writingDirection: 'rtl',
    },
    historyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginBottom: 10,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    historyIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: AppColors.badgeBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 14,
    },
    historyInfo: {
        flex: 1,
        alignItems: 'flex-end',
    },
    historyTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: AppColors.sectionTitle,
        writingDirection: 'rtl',
    },
    historyDate: {
        fontSize: 13,
        color: AppColors.subtitleText,
        marginTop: 3,
        writingDirection: 'rtl',
    },
    savingsBadge: {
        backgroundColor: '#DCFCE7',
        borderRadius: 10,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 12,
    },
    savingsBadgeText: {
        fontSize: 13,
        fontWeight: '700',
        color: AppColors.savingsGreen,
        writingDirection: 'rtl',
    },
});
