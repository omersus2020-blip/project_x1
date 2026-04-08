import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../i18n';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { Pressable, I18nManager, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const CustomHeaderBack = () => (
    <View style={{ 
      marginLeft: I18nManager.isRTL ? 0 : 4, 
      marginRight: I18nManager.isRTL ? 4 : 0, 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <Pressable 
        onPress={() => router.back()} 
        style={({ pressed }) => ({
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: pressed ? 'rgba(0,0,0,0.05)' : 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
        })}
      >
        <MaterialIcons 
          name={I18nManager.isRTL ? "chevron-right" : "chevron-left"} 
          size={32} 
          color={AppColors.textPrimary} 
        />
      </Pressable>
    </View>
  );

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="otp-verify" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="shipping-addresses" options={{ headerShown: false }} />
        <Stack.Screen name="payment-methods" options={{ headerShown: false }} />
        <Stack.Screen name="notifications-settings" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="help-support" options={{ headerShown: false }} />
        <Stack.Screen 
          name="notifications" 
          options={{ 
            title: 'Inbox', 
            headerTitleStyle: { fontWeight: '700' },
            headerLeft: () => <CustomHeaderBack />,
          }} 
        />
        <Stack.Screen
          name="tender-details"
          options={{
            title: 'Deal Details',
            headerTitleStyle: { fontWeight: '700' },
            headerLeft: () => <CustomHeaderBack />,
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
