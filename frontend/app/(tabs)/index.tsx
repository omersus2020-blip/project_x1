import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Pressable,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TenderCard } from '@/components/tender-card';
import { MOCK_TENDERS } from '@/constants/mock-data';
import { AppColors } from '@/constants/theme';
import { Tender } from '@/constants/types';
import { fetchActiveTenders, TenderFromAPI, getUnreadNotificationCount, getStoredUser } from '@/constants/api';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage } from '@/i18n';
import { useFocusEffect } from '@react-navigation/native';

const CATEGORIES = ['All', 'Electronics', 'Kitchen', 'Office', 'Home'];

// Convert API response to the Tender shape used by TenderCard
function apiToTender(t: TenderFromAPI): Tender {
    return {
        id: t.id,
        title: t.title,
        description: t.description,
        imageUrl: t.imageUrl,
        startingPrice: t.originalPrice,
        targetPrice: t.originalPrice * 0.6,
        currentPrice: t.currentPrice,
        endDate: t.endDate,
        currentParticipants: t.currentParticipants,
        targetParticipants: t.targetParticipants,
        category: t.category,
        status: t.status === 'ACTIVE' ? 'OPEN' : 'CLOSED',
        priceTiers: [],
    };
}

export default function BrowseScreen() {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            loadUnreadCount();
        }, [])
    );

    const loadUnreadCount = async () => {
        try {
            const user = await getStoredUser();
            if (user?.id) {
                const res = await getUnreadNotificationCount(user.id);
                setUnreadCount(res.count);
            }
        } catch (error) {
            console.error('Failed to load unread count:', error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await fetchActiveTenders();
            setTenders(data.map(apiToTender));
        } catch (error) {
            console.error('Failed to fetch tenders, falling back to mock:', error);
            setTenders(MOCK_TENDERS);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleLanguageToggle = () => {
        const current = i18n.language;
        if (current === 'en') changeAppLanguage('he');
        else if (current === 'he') changeAppLanguage('ar');
        else changeAppLanguage('en');
    };



    const filteredTenders = useMemo(() => {
        return tenders.filter((t) => {
            const matchesQuery =
                query === '' ||
                t.title.toLowerCase().includes(query.toLowerCase()) ||
                t.description.toLowerCase().includes(query.toLowerCase());
            const matchesCategory =
                selectedCategory === 'All' || t.category === selectedCategory;
            return matchesQuery && matchesCategory;
        });
    }, [query, selectedCategory, tenders]);

    const handleTenderPress = (tender: Tender) => {
        router.push({ pathname: '/tender-details', params: { id: tender.id } });
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={filteredTenders}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh} 
                        colors={[AppColors.textPrimary]} 
                        tintColor={AppColors.textPrimary}
                    />
                }
                ListHeaderComponent={
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            {/* Inbox / Envelope Icon on Top Left */}
                            <Pressable 
                                onPress={() => router.push('/notifications')} 
                                style={styles.inboxButton}
                            >
                                <MaterialIcons name="mail-outline" size={26} color={AppColors.textPrimary} />
                                {unreadCount > 0 && (
                                    <View style={styles.badgeContainer}>
                                        <Text style={styles.badgeText}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </Pressable>

                            <View style={styles.headerTitleContainer}>
                                <Text style={styles.headerTitle}>{t('home.title')}</Text>
                                <Text style={styles.headerSubtitle}>{t('home.subtitle')}</Text>
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

                        {/* Search bar */}
                        <View style={styles.searchBar}>
                            <MaterialIcons name="search" size={20} color={AppColors.textMuted} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder={t('home.search_placeholder')}
                                placeholderTextColor={AppColors.textMuted}
                                value={query}
                                onChangeText={setQuery}
                                id="search-input"
                            />
                            {query.length > 0 && (
                                <Pressable onPress={() => setQuery('')}>
                                    <MaterialIcons name="close" size={18} color={AppColors.textMuted} />
                                </Pressable>
                            )}
                        </View>

                        {/* Category chips */}
                        <View style={styles.categoryRow}>
                            {CATEGORIES.map((cat) => (
                                <Pressable
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        selectedCategory === cat && styles.categoryChipActive,
                                    ]}
                                    onPress={() => setSelectedCategory(cat)}
                                >
                                    <Text
                                        style={[
                                            styles.categoryChipText,
                                            selectedCategory === cat && styles.categoryChipTextActive,
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </>
                }
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="large" color={AppColors.textPrimary} />
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="search-off" size={64} color={AppColors.cardBorder} />
                            <Text style={styles.emptyText}>{t('home.no_deals')}</Text>
                        </View>
                    )
                }
                renderItem={({ item }) => (
                    <TenderCard tender={item} onPress={handleTenderPress} />
                )}
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
        paddingBottom: 8,
        position: 'relative',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
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
    inboxButton: {
        position: 'absolute',
        left: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeContainer: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: '#EF4444', // Red color for badge
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: AppColors.background,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    languageButton: {
        position: 'absolute',
        right: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Search
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginHorizontal: 16,
        marginTop: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: AppColors.textPrimary,
        paddingVertical: 0,
    },

    // Categories
    categoryRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 14,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: AppColors.chipInactive,
        borderWidth: 1,
        borderColor: AppColors.chipBorder,
    },
    categoryChipActive: {
        backgroundColor: AppColors.chipActive,
        borderColor: AppColors.chipActive,
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: AppColors.chipInactiveText,
    },
    categoryChipTextActive: {
        color: AppColors.chipActiveText,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: AppColors.textSecondary,
        marginTop: 12,
    },
});
