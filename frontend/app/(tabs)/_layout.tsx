import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 4,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'מכרזים באוויר',
                    tabBarIcon: ({ color }) => <MaterialIcons name="local-offer" size={26} color={color} />,
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'חיפוש',
                    tabBarIcon: ({ color }) => <MaterialIcons name="search" size={26} color={color} />,
                }}
            />
            <Tabs.Screen
                name="current"
                options={{
                    title: 'ההזמנות שלי',
                    tabBarIcon: ({ color }) => <MaterialIcons name="shopping-bag" size={26} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'פרופיל',
                    tabBarIcon: ({ color }) => <MaterialIcons name="person" size={26} color={color} />,
                }}
            />
        </Tabs>
    );
}
