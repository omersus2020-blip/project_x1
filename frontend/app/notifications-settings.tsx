import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Pressable, Switch, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface NotificationSetting {
    id: string; icon: string; title: string; subtitle: string;
}

export default function NotificationsSettingsScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [settings, setSettings] = useState<Record<string, boolean>>({
        push: true, email: true, deals: true, price: true, group: true, promo: false,
    });

    const isRtl = i18n.language === 'he' || i18n.language === 'ar';
    const alignStyle: any = { textAlign: isRtl ? 'right' : 'left' };
    const rowStyle: any = { flexDirection: isRtl ? 'row-reverse' : 'row' };
    const alignFlexStyle: any = { alignItems: isRtl ? 'flex-end' : 'flex-start' };

    const NOTIFICATION_SETTINGS: NotificationSetting[] = [
        { id: 'push', icon: 'notifications-active', title: t('notifications.push', 'Push Notifications'), subtitle: t('notifications.push_d', 'Get notified about deals on your device') },
        { id: 'email', icon: 'email', title: t('notifications.email', 'Email Notifications'), subtitle: t('notifications.email_d', 'Receive deal updates via email') },
        { id: 'deals', icon: 'local-offer', title: t('notifications.deals', 'New Deals'), subtitle: t('notifications.deals_d', 'Be the first to know about new group deals') },
        { id: 'price', icon: 'trending-down', title: t('notifications.price', 'Price Drops'), subtitle: t('notifications.price_d', 'Get alerted when prices drop on your deals') },
        { id: 'group', icon: 'group', title: t('notifications.group', 'Group Updates'), subtitle: t('notifications.group_d', 'Know when someone joins your group deal') },
        { id: 'promo', icon: 'campaign', title: t('notifications.promo', 'Promotions'), subtitle: t('notifications.promo_d', 'Special offers and promotions') },
    ];

    const toggleSetting = (id: string) => {
        setSettings((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={AppColors.textPrimary} />
                    </Pressable>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.title}>{t('notifications.title', 'Notifications')}</Text>
                        <Text style={styles.subtitle}>{t('notifications.subtitle', 'Manage your alerts and updates')}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    {NOTIFICATION_SETTINGS.map((item, index) => (
                        <View key={item.id} style={[styles.settingRow, rowStyle, index === NOTIFICATION_SETTINGS.length - 1 && { borderBottomWidth: 0 }]}>
                            <View style={styles.iconContainer}>
                                <MaterialIcons name={item.icon as any} size={22} color={settings[item.id] ? AppColors.priceGreen : AppColors.textMuted} />
                            </View>
                            <View style={[styles.textContainer, alignFlexStyle]}>
                                <Text style={[styles.settingTitle, alignStyle]}>{item.title}</Text>
                                <Text style={[styles.settingSubtitle, alignStyle]}>{item.subtitle}</Text>
                            </View>
                            <Switch
                                value={settings[item.id]}
                                onValueChange={() => toggleSetting(item.id)}
                                trackColor={{ false: '#E5E7EB', true: '#BBF7D0' }}
                                thumbColor={settings[item.id] ? AppColors.priceGreen : '#9CA3AF'}
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    scrollContent: { paddingBottom: 40 },
    header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: AppColors.background },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '800', color: AppColors.textPrimary, textAlign: 'center' },
    subtitle: { fontSize: 15, color: AppColors.textSecondary, marginTop: 4, textAlign: 'center' },
    section: { backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: AppColors.cardBorder },
    settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 14 },
    iconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    textContainer: { flex: 1 },
    settingTitle: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary },
    settingSubtitle: { fontSize: 12, color: AppColors.textSecondary, marginTop: 2 },
});
