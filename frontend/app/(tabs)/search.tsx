import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TenderCard } from '@/components/tender-card';
import { MOCK_TENDERS } from '@/constants/mock-data';
import { AppColors } from '@/constants/theme';
import { Tender } from '@/constants/types';

const CATEGORIES = ['הכל', 'מזון', 'חשמל', 'שירותים'];

export default function SearchScreen() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('הכל');

    const filteredTenders = useMemo(() => {
        return MOCK_TENDERS.filter((t) => {
            const matchesQuery =
                query === '' ||
                t.title.includes(query) ||
                t.description.includes(query);
            const matchesCategory =
                selectedCategory === 'הכל' || t.category === selectedCategory;
            return matchesQuery && matchesCategory;
        });
    }, [query, selectedCategory]);

    const handleTenderPress = (tender: Tender) => {
        router.push({ pathname: '/tender-details', params: { id: tender.id } });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>חיפוש מכרזים</Text>
            </View>

            {/* Search bar */}
            <View style={styles.searchBar}>
                <MaterialIcons name="search" size={22} color={AppColors.subtitleText} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="חפש מוצר או מכרז..."
                    placeholderTextColor={AppColors.subtitleText}
                    value={query}
                    onChangeText={setQuery}
                    id="search-input"
                />
                {query.length > 0 && (
                    <MaterialIcons
                        name="close"
                        size={20}
                        color={AppColors.subtitleText}
                        onPress={() => setQuery('')}
                    />
                )}
            </View>

            {/* Category chips */}
            <View style={styles.categoryRow}>
                {CATEGORIES.map((cat) => (
                    <Text
                        key={cat}
                        style={[
                            styles.categoryChip,
                            selectedCategory === cat && styles.categoryChipActive,
                        ]}
                        onPress={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </Text>
                ))}
            </View>

            {/* Results */}
            <FlatList
                data={filteredTenders}
                keyExtractor={(item) => item.id}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MaterialIcons name="search-off" size={64} color={AppColors.cardBorder} />
                        <Text style={styles.emptyText}>לא נמצאו תוצאות</Text>
                    </View>
                }
                ListHeaderComponent={
                    <Text style={styles.resultsCount}>
                        {filteredTenders.length} תוצאות
                    </Text>
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
    searchBar: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        marginHorizontal: 16,
        marginTop: 16,
        paddingHorizontal: 14,
        paddingVertical: 10,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: AppColors.sectionTitle,
        textAlign: 'right',
        writingDirection: 'rtl',
        paddingVertical: 0,
    },
    categoryRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'center',
        gap: 10,
        marginTop: 14,
        marginBottom: 4,
        paddingHorizontal: 16,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.subtitleText,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        textAlign: 'center',
    },
    categoryChipActive: {
        backgroundColor: AppColors.primaryBlue,
        color: '#FFFFFF',
        borderColor: AppColors.primaryBlue,
    },
    listContent: {
        paddingHorizontal: 10,
        paddingBottom: 30,
    },
    resultsCount: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.subtitleText,
        textAlign: 'center',
        marginVertical: 10,
        writingDirection: 'rtl',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: AppColors.subtitleText,
        marginTop: 12,
        writingDirection: 'rtl',
    },
});
