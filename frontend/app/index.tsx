import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getStoredToken } from '@/constants/api';
import { AppColors } from '@/constants/theme';

export default function EntryScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await getStoredToken();
            if (token) {
                // User is logged in, go to tabs
                router.replace('/(tabs)');
            } else {
                // No token, show welcome
                router.replace('/welcome');
            }
        } catch {
            router.replace('/welcome');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={AppColors.textPrimary} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppColors.background,
    },
});
