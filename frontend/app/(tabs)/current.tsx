import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { MOCK_TENDERS } from '@/constants/mock-data';
import { AppColors } from '@/constants/theme';
import { Tender } from '@/constants/types';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage } from '@/i18n';
import { fetchSavedTenders, getStoredUser, SavedTenderFromAPI, fetchEnrolledTenders, fetchUserOrders } from '@/constants/api';
import { ActivityIndicator } from 'react-native';

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

type TabType = 'active' | 'completed' | 'saved';

export default function MyPurchasesScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [selectedTab, setSelectedTab] = useState<TabType>('active');
    const [savedTenders, setSavedTenders] = useState<any[]>([]);
    const [activeTenders, setActiveTenders] = useState<any[]>([]);
    const [completedOrders, setCompletedOrders] = useState<any[]>([]);
    const [loadingTab, setLoadingTab] = useState(false);

    React.useEffect(() => {
        loadDataForTab(selectedTab);
    }, [selectedTab]);

    const loadDataForTab = async (tab: TabType) => {
        try {
            setLoadingTab(true);
            const user = await getStoredUser();
            if (!user) return;

            if (tab === 'saved') {
                const data = await fetchSavedTenders(user.id);
                setSavedTenders(data);
            } else if (tab === 'active') {
                const items = await fetchEnrolledTenders(user.id);
                setActiveTenders(items.filter((item: any) => item.tender?.status === 'ACTIVE'));
            } else if (tab === 'completed') {
                const items = await fetchUserOrders(user.id);
                setCompletedOrders(items);
            }
        } catch (error) {
            console.error(`Failed to load data for tab ${tab}`, error);
        } finally {
            setLoadingTab(false);
        }
    };

    const getDisplayedData = (): any[] => {
        if (selectedTab === 'active') {
            return activeTenders.map(item => ({
                ...item.tender,
                startingPrice: item.tender.originalPrice, 
                targetPrice: item.tender.tiers && item.tender.tiers.length > 0 
                    ? item.tender.originalPrice * (1 - Math.max(...item.tender.tiers.map((t: any) => t.discountPercent)) / 100)
                    : item.tender.originalPrice,
                priceTiers: item.tender.tiers?.map((t: any) => ({
                    minParticipants: t.minParticipants,
                    discountPercent: t.discountPercent
                })) || [],
                enrollmentInfo: item
            }));
        }
        if (selectedTab === 'completed') {
            return completedOrders.map(order => ({
                ...order.tender,
                startingPrice: order.tender?.originalPrice || 0,
                currentPrice: order.finalPrice,
                targetPrice: order.finalPrice,
                status: 'CLOSED',
                orderInfo: order
            }));
        }
        return savedTenders.map((st: any) => ({
            ...st.tender,
            startingPrice: st.tender.originalPrice, 
            targetPrice: st.tender.tiers && st.tender.tiers.length > 0 
                ? st.tender.originalPrice * (1 - Math.max(...st.tender.tiers.map((t: any) => t.discountPercent)) / 100)
                : st.tender.originalPrice,
            priceTiers: st.tender.tiers?.map((t: any) => ({
                minParticipants: t.minParticipants,
                discountPercent: t.discountPercent
            })) || [],
            status: st.tender.status === 'ACTIVE' ? 'OPEN' : 'CLOSED',
        }));
    };

    const displayedTenders = getDisplayedData();

    const handleLanguageToggle = () => {
        const current = i18n.language;
        if (current === 'en') changeAppLanguage('he');
        else if (current === 'he') changeAppLanguage('ar');
        else changeAppLanguage('en');
    };

    const handlePress = (tender: Tender) => {
        router.push({ pathname: '/tender-details', params: { id: tender.id } });
    };

    const renderPurchaseCard = ({ item }: { item: any }) => {
        const discount = getDiscountPercent(item.startingPrice, item.currentPrice);
        const progressPercent = Math.min(100, (item.currentParticipants / (item.targetParticipants || 1)) * 100);
        const timeInfo = item.endDate ? formatTimeLeft(item.endDate, t) : null;

        return (
            <Pressable
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
                onPress={() => handlePress(item)}
            >
                {/* Top section: Image + Info */}
                <View style={styles.topSection}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.image}
                            contentFit="cover"
                        />
                        {discount > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>-{discount}%</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.infoSection}>
                        <View style={styles.titleRow}>
                            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                            <View style={styles.categoryBadge}>
                                <Text style={styles.categoryText}>{item.category}</Text>
                            </View>
                        </View>

                        <Text style={styles.currentPrice}>${item.currentPrice.toFixed(2)}</Text>

                        <View style={styles.metaRow}>
                            <View style={styles.peopleInfo}>
                                <MaterialIcons name="people-outline" size={16} color={AppColors.textSecondary} />
                                <Text style={styles.metaText}>
                                    <Text style={styles.metaBold}>{item.currentParticipants}/{item.targetParticipants}</Text> {t('tender.people', 'people')}
                                </Text>
                            </View>
                            {timeInfo && (
                                <View style={styles.timeInfo}>
                                    <MaterialIcons name="access-time" size={14} color={AppColors.textSecondary} />
                                    <Text style={styles.metaText}>{timeInfo.text}</Text>
                                </View>
                            )}
                        </View>

                        {selectedTab === 'active' && (
                            <View style={styles.progressContainer}>
                                <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
                            </View>
                        )}
                        {selectedTab === 'completed' && item.orderInfo && (
                            <View style={{ marginTop: 8 }}>
                                <Text style={{ fontSize: 13, color: AppColors.textSecondary }}>Order Status: <Text style={{ fontWeight: '600', color: AppColors.priceGreen }}>{item.orderInfo.status}</Text></Text>
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={displayedTenders}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerTitleContainer}>
                                <View style={styles.headerTitleRow}>
                                    <MaterialIcons name="inventory-2" size={24} color={AppColors.textPrimary} />
                                    <Text style={styles.headerTitle}>{t('purchases.title', 'My Purchases')}</Text>
                                </View>
                                <Text style={styles.headerSubtitle}>{t('purchases.subtitle', 'Track your group buys')}</Text>
                            </View>
                            <Pressable 
                                onPress={handleLanguageToggle} 
                                style={styles.languageButton}
                            >
                                <MaterialIcons name="language" size={24} color={AppColors.textPrimary} />
                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: AppColors.textPrimary }}>
                                    {i18n.language.toUpperCase()}
                                </Text>
                            </Pressable>
                        </View>



                        {/* Tab toggle */}
                        <View style={styles.tabRow}>
                            <Pressable
                                style={[
                                    styles.tabButton,
                                    selectedTab === 'active' && styles.tabButtonActive,
                                ]}
                                onPress={() => setSelectedTab('active')}
                            >
                                <Text
                                    style={[
                                        styles.tabButtonText,
                                        selectedTab === 'active' && styles.tabButtonTextActive,
                                    ]}
                                >
                                    {t('purchases.active_tab', 'Active')} ({activeTenders.length})
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.tabButton,
                                    selectedTab === 'completed' && styles.tabButtonActive,
                                ]}
                                onPress={() => setSelectedTab('completed')}
                            >
                                <Text
                                    style={[
                                        styles.tabButtonText,
                                        selectedTab === 'completed' && styles.tabButtonTextActive,
                                    ]}
                                >
                                    {t('purchases.completed_tab', 'Completed')} ({completedOrders.length})
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.tabButton,
                                    selectedTab === 'saved' && styles.tabButtonActive,
                                ]}
                                onPress={() => setSelectedTab('saved')}
                            >
                                <Text
                                    style={[
                                        styles.tabButtonText,
                                        selectedTab === 'saved' && styles.tabButtonTextActive,
                                    ]}
                                >
                                    {t('purchases.saved_tab', 'Saved')} ({savedTenders.length})
                                </Text>
                            </Pressable>
                        </View>
                    </>
                }
                ListEmptyComponent={
                    loadingTab ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="large" color={AppColors.textPrimary} />
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialIcons
                                name={selectedTab === 'active' ? 'shopping-bag' : selectedTab === 'completed' ? 'check-circle' : 'bookmark-border'}
                                size={64}
                                color={AppColors.cardBorder}
                            />
                            <Text style={styles.emptyTitle}>
                                {selectedTab === 'active' 
                                    ? t('purchases.no_active', 'No active purchases') 
                                    : selectedTab === 'completed' 
                                        ? t('purchases.no_completed', 'No completed purchases')
                                        : t('purchases.no_saved', 'No saved items')}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {selectedTab === 'active'
                                    ? t('purchases.empty_active_subtitle', 'Join a group deal to start saving!')
                                    : selectedTab === 'completed'
                                        ? t('purchases.empty_completed_subtitle', 'Your completed purchases will appear here')
                                        : t('purchases.empty_saved_subtitle', 'Save items for later to see them here')}
                            </Text>
                        </View>
                    )
                }
                renderItem={renderPurchaseCard}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.background,
    },
    listContent: {
        paddingBottom: 30,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        position: 'relative',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: AppColors.textPrimary,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: AppColors.textSecondary,
        marginTop: 2,
        textAlign: 'center',
    },
    languageButton: {
        position: 'absolute',
        right: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        gap: 4,
    },
    statLabel: {
        fontSize: 13,
        color: AppColors.textSecondary,
        marginTop: 4,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: AppColors.textPrimary,
    },

    // Tab toggle
    tabRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    tabButtonActive: {
        backgroundColor: AppColors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.textSecondary,
    },
    tabButtonTextActive: {
        color: AppColors.textPrimary,
    },

    // Purchase cards
    card: {
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        backgroundColor: AppColors.cardBackground,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
        overflow: 'hidden',
    },
    topSection: {
        flexDirection: 'row',
        padding: 12,
        gap: 12,
    },
    imageContainer: {
        width: 100,
        height: 100,
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
        top: 6,
        left: 6,
        backgroundColor: AppColors.priceGreen,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 6,
    },
    discountText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
    },
    infoSection: {
        flex: 1,
        justifyContent: 'space-between',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 6,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: AppColors.textPrimary,
        flex: 1,
    },
    categoryBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '600',
        color: AppColors.textSecondary,
    },
    currentPrice: {
        fontSize: 17,
        fontWeight: '800',
        color: AppColors.priceGreen,
        marginTop: 2,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
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
        fontSize: 11,
        color: AppColors.textSecondary,
    },
    metaBold: {
        fontWeight: '700',
        color: AppColors.textPrimary,
    },
    progressContainer: {
        height: 4,
        backgroundColor: AppColors.progressBg,
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 6,
    },
    progressBar: {
        height: '100%',
        backgroundColor: AppColors.progressFill,
        borderRadius: 2,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.textPrimary,
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: AppColors.textSecondary,
        marginTop: 8,
        lineHeight: 20,
        paddingHorizontal: 40,
    },
});
