import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Pressable,
    RefreshControl,
    View as RNView
} from 'react-native';
import { fetchUserNotifications, markNotificationAsRead, NotificationFromAPI, getStoredUser } from '@/constants/api';
import { AppColors } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState<NotificationFromAPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { i18n } = useTranslation();

    const isRtl = i18n.language === 'he' || i18n.language === 'ar';

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const user = await getStoredUser();
            if (user?.id) {
                const data = await fetchUserNotifications(user.id);
                setNotifications(data);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handlePressNotification = async (item: NotificationFromAPI) => {
        if (!item.isRead) {
            // Optimistically update
            setNotifications(prev =>
                prev.map(n => n.id === item.id ? { ...n, isRead: true } : n)
            );
            try {
                await markNotificationAsRead(item.id);
            } catch (error) {
                console.error('Failed to mark as read', error);
                // Revert
                setNotifications(prev =>
                    prev.map(n => n.id === item.id ? { ...n, isRead: false } : n)
                );
            }
        }
        
        // If it's a tender notification, we could deep link to it here if we wanted
        // For now just reading it is fine.
    };

    const renderItem = ({ item }: { item: NotificationFromAPI }) => {
        const isUnread = !item.isRead;
        const iconName = item.type === 'TENDER_WON' ? 'emoji-events'
            : item.type === 'ORDER_CREATED' ? 'local-shipping'
            : item.type === 'TENDER_COMPLETED' ? 'check-circle'
            : 'notifications';

        return (
            <Pressable
                style={[
                    styles.card,
                    isUnread && styles.cardUnread,
                    { flexDirection: isRtl ? 'row-reverse' : 'row' }
                ]}
                onPress={() => handlePressNotification(item)}
            >
                <View style={[
                    styles.iconContainer, 
                    isUnread && styles.iconContainerUnread,
                    { [isRtl ? 'marginLeft' : 'marginRight']: 12 }
                ]}>
                    <MaterialIcons name={iconName} size={24} color={isUnread ? '#EF4444' : AppColors.textSecondary} />
                </View>
                <View style={[styles.contentContainer, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                    <Text style={[styles.title, isUnread && styles.titleUnread, { textAlign: isRtl ? 'right' : 'left' }]}>{item.title}</Text>
                    <Text style={[styles.body, { textAlign: isRtl ? 'right' : 'left' }]}>{item.body}</Text>
                    <Text style={[styles.timestamp, { textAlign: isRtl ? 'right' : 'left' }]}>
                        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                </View>
                {isUnread && <View style={[styles.unreadDot, { [isRtl ? 'marginRight' : 'marginLeft']: 8 }]} />}
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[AppColors.textPrimary]} />
                }
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator size="large" color={AppColors.textPrimary} />
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialIcons name="notifications-none" size={64} color={AppColors.cardBorder} />
                            <Text style={styles.emptyText}>No notifications yet.</Text>
                        </View>
                    )
                }
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    listContent: {
        padding: 16,
        gap: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardUnread: {
        borderColor: '#FCA5A5', 
        backgroundColor: '#FEF2F2',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainerUnread: {
        backgroundColor: '#FEE2E2',
    },
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: AppColors.textPrimary,
        marginBottom: 4,
    },
    titleUnread: {
        fontWeight: '800',
    },
    body: {
        fontSize: 14,
        color: AppColors.textSecondary,
        lineHeight: 20,
    },
    timestamp: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 8,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        alignSelf: 'center',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: AppColors.textSecondary,
        marginTop: 16,
    },
});
