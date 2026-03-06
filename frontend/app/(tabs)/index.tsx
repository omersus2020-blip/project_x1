import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    I18nManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TenderCard } from '@/components/tender-card';
import { MOCK_TENDERS, MOCK_USER } from '@/constants/mock-data';
import { AppColors } from '@/constants/theme';
import { Tender } from '@/constants/types';
import { fetchActiveTenders, TenderFromAPI } from '@/constants/api';

I18nManager.allowRTL(true);

// Convert API response to the Tender shape used by TenderCard
function apiToTender(t: TenderFromAPI): Tender {
    return {
        id: t.id,
        title: t.title,
        description: t.description,
        imageUrl: t.imageUrl,
        startingPrice: t.originalPrice,
        targetPrice: t.originalPrice * 0.6, // estimate
        currentPrice: t.currentPrice,
        endDate: t.endDate,
        currentParticipants: t.currentParticipants,
        targetParticipants: t.targetParticipants,
        category: t.category,
        status: t.status === 'ACTIVE' ? 'OPEN' : t.status === 'COMPLETED' ? 'CLOSED' : 'CLOSED',
        priceTiers: [],
    };
}

export default function HomeScreen() {
    const router = useRouter();
    const [tenders, setTenders] = useState<Tender[]>([]);
    const [loading, setLoading] = useState(true);
    const [usingMock, setUsingMock] = useState(false);

    useEffect(() => {
        loadTenders();
    }, []);

    async function loadTenders() {
        try {
            setLoading(true);
            const data = await fetchActiveTenders();
            setTenders(data.map(apiToTender));
            setUsingMock(false);
        } catch (error) {
            console.log('⚠️ Backend unreachable, using mock data:', error);
            setTenders(MOCK_TENDERS);
            setUsingMock(true);
        } finally {
            setLoading(false);
        }
    }

    const handleTenderPress = (tender: Tender) => {
        router.push({ pathname: '/tender-details', params: { id: tender.id } });
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={tenders}
                keyExtractor={(item) => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.greeting}>שלום, {MOCK_USER.name}!</Text>
                        </View>

                        {/* Savings banner */}
                        <View style={styles.savingsBanner}>
                            <MaterialIcons name="savings" size={24} color="#FFFFFF" />
                            <Text style={styles.savingsText}>
                                החיסכון המצטבר שלך: ₪{MOCK_USER.totalSavings.toLocaleString()}
                            </Text>
                        </View>

                        {/* Mock data indicator */}
                        {usingMock && (
                            <View style={styles.mockBanner}>
                                <MaterialIcons name="info-outline" size={16} color="#92400E" />
                                <Text style={styles.mockText}>מציג נתונים לדוגמה (השרת לא זמין)</Text>
                            </View>
                        )}

                        {/* Section title */}
                        <Text style={styles.sectionTitle}>
                            מכרזים פתוחים עכשיו ({tenders.length})
                        </Text>

                        {/* Loading */}
                        {loading && (
                            <ActivityIndicator size="large" color={AppColors.primaryBlue} style={{ marginTop: 20 }} />
                        )}
                    </>
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
        backgroundColor: '#F8F9FA',
    },
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 30,
    },
    header: {
        backgroundColor: AppColors.primaryBlue,
        paddingVertical: 24,
        paddingHorizontal: 20,
        marginHorizontal: -10,
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    greeting: {
        fontSize: 26,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        writingDirection: 'rtl',
    },
    savingsBanner: {
        backgroundColor: AppColors.savingsBannerBg,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 20,
        marginHorizontal: 6,
        marginTop: 16,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    savingsText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        writingDirection: 'rtl',
    },
    mockBanner: {
        backgroundColor: '#FEF3C7',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginHorizontal: 6,
        marginTop: 10,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    mockText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#92400E',
        writingDirection: 'rtl',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: AppColors.sectionTitle,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 12,
        writingDirection: 'rtl',
    },
});
