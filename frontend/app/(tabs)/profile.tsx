import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Pressable,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { getStoredUser, logout } from '@/constants/api';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage } from '@/i18n';

interface SettingsMenuItem {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
    route: string;
}



function getInitials(name: string): string {
    const parts = name.split(' ');
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ProfileScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [user, setUser] = useState<any>(null);

    const isRtl = i18n.language === 'he' || i18n.language === 'ar';

    const settingsItems = [
        { id: 's1', icon: 'person-outline', title: t('profile.edit_profile', 'Edit Profile'), subtitle: t('profile.update_personal', 'Update your personal information'), route: '/edit-profile' },
        { id: 's2', icon: 'location-on', title: t('profile.shipping', 'Shipping Addresses'), subtitle: t('profile.manage_shipping', 'Manage delivery locations'), route: '/shipping-addresses' },
        { id: 's3', icon: 'credit-card', title: t('profile.payment_methods', 'Payment Methods'), subtitle: t('profile.manage_payment', 'Manage cards and payment options'), route: '/payment-methods' },
        { id: 's4', icon: 'notifications-none', title: t('profile.notifications', 'Notifications'), subtitle: t('profile.manage_notifications', 'Manage your alerts and updates'), route: '/notifications-settings' },
        { id: 's5', icon: 'settings', title: t('profile.settings', 'Settings'), subtitle: t('profile.app_preferences', 'App preferences and privacy'), route: '/settings' },
        { id: 's6', icon: 'help-outline', title: t('profile.help_support', 'Help & Support'), subtitle: t('profile.get_help', 'Get help and contact us'), route: '/help-support' },
    ];

    useFocusEffect(
        useCallback(() => {
            loadUser();
        }, [])
    );

    const loadUser = async () => {
        const stored = await getStoredUser();
        if (stored) setUser(stored);
    };

    const handleSignOut = () => {
        Alert.alert(t('profile.sign_out', 'Sign Out'), t('profile.sign_out_confirm', 'Are you sure you want to sign out?'), [
            { text: t('common.cancel', 'Cancel'), style: 'cancel' },
            {
                text: t('profile.sign_out', 'Sign Out'), onPress: async () => {
                    await logout();
                    router.replace('/welcome');
                },
            },
        ]);
    };

    const handleLanguageToggle = () => {
        const current = i18n.language;
        if (current === 'en') changeAppLanguage('he');
        else if (current === 'he') changeAppLanguage('ar');
        else changeAppLanguage('en');
    };

    const userName = user?.name || 'User';
    const userEmail = user?.email || '';
    const memberSinceStr = user?.createdAt ? formatDate(user.createdAt) : 'Mar 2026';
    const memberSince = t('profile.member_since', { date: memberSinceStr, defaultValue: `Member since ${memberSinceStr}` });

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={settingsItems}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerTitleContainer}>
                                <Text style={styles.headerTitle}>{t('profile.title', 'Profile')}</Text>
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

                        {/* User info card */}
                        <View style={styles.userCard}>
                            <View style={styles.avatarContainer}>
                                <Text style={styles.avatarText}>
                                    {getInitials(userName)}
                                </Text>
                            </View>
                            <Text style={styles.userName}>{userName}</Text>
                            <Text style={styles.userEmail}>{userEmail}</Text>
                            <Text style={styles.memberSince}>{memberSince}</Text>
                        </View>
                    </>
                }
                renderItem={({ item }) => (
                    <Pressable
                        style={({ pressed }) => [
                            styles.menuItem,
                            pressed && { backgroundColor: '#F9FAFB' },
                            { flexDirection: isRtl ? 'row-reverse' : 'row' }
                        ]}
                        onPress={() => router.push(item.route as any)}
                    >
                        <View style={[styles.menuIconContainer, { [isRtl ? 'marginLeft' : 'marginEnd']: 14 }]}>
                            <MaterialIcons name={item.icon as any} size={22} color={AppColors.textPrimary} />
                        </View>
                        <View style={[styles.menuTextContainer, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                            <Text style={[styles.menuTitle, { textAlign: isRtl ? 'right' : 'left' }]}>{item.title}</Text>
                            <Text style={[styles.menuSubtitle, { textAlign: isRtl ? 'right' : 'left' }]}>{item.subtitle}</Text>
                        </View>
                        <MaterialIcons name={isRtl ? "chevron-left" : "chevron-right"} size={22} color={AppColors.textMuted} />
                    </Pressable>
                )}
                ListFooterComponent={
                    <Pressable
                        style={({ pressed }) => [
                            styles.signOutButton, 
                            pressed && { opacity: 0.9 },
                            { flexDirection: isRtl ? 'row-reverse' : 'row' }
                        ]}
                        onPress={handleSignOut}
                    >
                        <MaterialIcons name="logout" size={20} color="#EF4444" style={isRtl ? { transform: [{ scaleX: -1 }] } : {}} />
                        <Text style={styles.signOutText}>{t('profile.sign_out', 'Sign Out')}</Text>
                    </Pressable>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    listContent: {
        paddingBottom: 20,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: AppColors.background,
        position: 'relative',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: AppColors.textPrimary,
        textAlign: 'center',
    },
    languageButton: {
        position: 'absolute',
        right: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // User card
    userCard: {
        backgroundColor: AppColors.cardBackground,
        marginHorizontal: 16,
        borderRadius: 18,
        paddingVertical: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 22,
        fontWeight: '800',
        color: AppColors.textPrimary,
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: AppColors.textPrimary,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 15,
        color: AppColors.textSecondary,
        marginBottom: 12,
    },
    memberSince: {
        fontSize: 12,
        color: AppColors.textMuted,
        marginTop: 4,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        overflow: 'hidden',
    },

    // Settings menu items
    menuItem: {
        alignItems: 'center',
        backgroundColor: AppColors.cardBackground,
        marginHorizontal: 16,
        marginBottom: 2,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuTextContainer: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: AppColors.textPrimary,
        marginBottom: 2,
    },
    menuSubtitle: {
        fontSize: 13,
        color: AppColors.textSecondary,
        marginTop: 2,
    },

    // Sign out
    signOutButton: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 20,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EF4444',
    },
});
