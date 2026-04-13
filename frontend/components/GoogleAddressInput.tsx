import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Alert } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlaceDetail } from 'react-native-google-places-autocomplete';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface AddressDetails {
    street: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
    fullText: string;
}

interface Props {
    onSelect: (details: AddressDetails) => void;
    placeholder: string;
    zIndex?: number;
}

// Ensure you have EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in your .env
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function GoogleAddressInput({ onSelect, placeholder, zIndex = 1000 }: Props) {
    const { i18n } = useTranslation();
    const isRtl = i18n.language === 'he' || i18n.language === 'ar';
    const [focused, setFocused] = useState(false);
    const [sessionToken, setSessionToken] = useState<string>('');

    // Generate a simple session token
    const generateSessionToken = () => {
        // Quick simple random string generator since we don't need strict UUID
        const rand = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        setSessionToken(rand);
    };

    useEffect(() => {
        generateSessionToken();
    }, []);

    const alignStyle: any = { textAlign: isRtl ? 'right' : 'left' };
    const rowStyle: any = { flexDirection: isRtl ? 'row-reverse' : 'row' };

    return (
        <View style={{ zIndex, width: '100%', elevation: focused ? 10 : 0 }}>
            <View style={[styles.inputWrapper, rowStyle, focused && styles.inputWrapperFocused]}>
                <MaterialIcons name="search" size={20} color={focused ? AppColors.ctaButton : AppColors.textMuted} />
                <View style={styles.autocompleteContainer}>
                    <GooglePlacesAutocomplete
                        placeholder={placeholder}
                        onPress={(data, details: GooglePlaceDetail | null) => {
                            if (details) {
                                let country = '';
                                let city = '';
                                let street = data.structured_formatting?.main_text || '';

                                // Extract components
                                details.address_components?.forEach(component => {
                                    if (component.types.includes('country')) {
                                        country = component.long_name;
                                    }
                                    if (component.types.includes('locality')) {
                                        city = component.long_name;
                                    } else if (!city && component.types.includes('administrative_area_level_2')) {
                                        city = component.long_name; // fallback for some areas
                                    }
                                });

                                onSelect({
                                    street: street,
                                    city: city,
                                    country: country,
                                    lat: details.geometry?.location?.lat || 0,
                                    lng: details.geometry?.location?.lng || 0,
                                    fullText: data.description
                                });

                                // Regenerate token after a successful selection to start a new session
                                generateSessionToken();
                            }
                            setFocused(false);
                        }}
                        query={{
                            key: GOOGLE_API_KEY,
                            language: i18n.language,
                            // To restrict globally to Israel, uncomment the line below:
                            // components: 'country:il',
                            sessiontoken: sessionToken,
                        }}
                        onFail={(error) => {
                            console.error(error);
                            Alert.alert('Google API Error', String(error) + '\nCheck if Billing is enabled and API Key is valid.');
                        }}
                        fetchDetails={true}
                        styles={{
                            container: { flex: 1 },
                            textInputContainer: {
                                backgroundColor: 'transparent',
                                borderTopWidth: 0,
                                borderBottomWidth: 0,
                            },
                            textInput: {
                                marginLeft: 0,
                                marginRight: 0,
                                height: 40,
                                color: AppColors.textPrimary,
                                fontSize: 15,
                                backgroundColor: 'transparent',
                                ...alignStyle,
                                ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
                            },
                            predefinedPlacesDescription: {
                                color: AppColors.textPrimary,
                            },
                            poweredContainer: {
                                display: 'none', // Standard practice for cleaner UI if permitted
                            },
                            row: {
                                ...rowStyle,
                                padding: 14,
                                backgroundColor: '#FFFFFF',
                            },
                            description: {
                                color: AppColors.textPrimary,
                                fontSize: 15,
                                ...alignStyle,
                            },
                            listView: {
                                display: focused ? 'flex' : 'none',
                                position: 'absolute',
                                top: 40,
                                left: 0,
                                right: 0,
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: AppColors.cardBorder,
                                marginTop: 8,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.1,
                                shadowRadius: 10,
                                elevation: 6,
                            },
                            separator: {
                                backgroundColor: '#F3F4F6',
                            }
                        }}
                        textInputProps={{
                            placeholderTextColor: AppColors.textMuted,
                            onFocus: () => setFocused(true),
                            onBlur: () => {
                                setTimeout(() => setFocused(false), 200);
                            },
                        }}
                        enablePoweredByContainer={false}
                        keyboardShouldPersistTaps="handled"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    inputWrapper: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 4 : 0,
        gap: 8,
        minHeight: 52,
    },
    inputWrapperFocused: {
        borderColor: AppColors.ctaButton,
    },
    autocompleteContainer: {
        flex: 1,
        justifyContent: 'center',
    }
});
