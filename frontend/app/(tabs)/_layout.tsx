import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from 'react-i18next';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const { t } = useTranslation();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                tabBarInactiveTintColor: '#9CA3AF',
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 8,
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#F3F4F6',
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 2,
                },
            }}>

            <Tabs.Screen
                name="current"
                options={{
                    title: t('tabs.purchases', 'My Purchases'),
                    tabBarIcon: ({ color }) => <MaterialIcons name="shopping-cart" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: t('tabs.home', 'Home'),
                    tabBarIcon: ({ color }) => <MaterialIcons name="home" size={26} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: t('tabs.profile', 'Profile'),
                    tabBarIcon: ({ color }) => <MaterialIcons name="person-outline" size={26} color={color} />,
                }}
            />
        </Tabs>
    );
}
