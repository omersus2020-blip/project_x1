import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, Platform, Pressable, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';

interface Props {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    icon: any;
    alignStyle: any;
    rowStyle: any;
    type: 'country' | 'city' | 'street' | 'label';
    zIndex: number;
    importantForAutofill?: "auto" | "no" | "noExcludeDescendants" | "yes" | "yesExcludeDescendants";
}

const CITIES_ISRAEL = [
    "Jerusalem", "Tel Aviv", "Haifa", "Rishon LeZion", "Petah Tikva", "Ashdod", 
    "Netanya", "Bnei Brak", "Beersheba", "Holon", "Rehovot", "Bat Yam", 
    "Ramat Gan", "Ashkelon", "Herzliya"
];

const COUNTRIES = [
    "Israel", "United States", "United Kingdom", "Canada", "Australia", 
    "France", "Germany", "Italy", "Spain"
];

const STREETS_MOCK = [
    "Herzl", "Dizengoff", "Rothschild", "Ben Yehuda", "Ibn Gabirol", 
    "King George", "Weizmann", "Arlozorov", "Allenby", "Bialik",
    "Jabotinsky", "Sokolov"
];

export default function AutocompleteInput({ value, onChangeText, placeholder, icon, alignStyle, rowStyle, type, zIndex, importantForAutofill }: Props) {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Filter suggestions based on type
    let suggestions: string[] = [];
    if (value && focused && value.length > 0) {
        let list: string[] = [];
        if (type === 'city') list = CITIES_ISRAEL;
        else if (type === 'country') list = COUNTRIES;
        else if (type === 'street') list = STREETS_MOCK;

        if (list.length > 0) {
            suggestions = list.filter(
                item => item.toLowerCase().startsWith(value.toLowerCase()) && item.toLowerCase() !== value.toLowerCase()
            );
        }
    }

    return (
        <View style={{ zIndex: focused ? 1000 : zIndex, elevation: focused ? 10 : 0, width: '100%' }}>
            <Pressable 
                style={[styles.modalInput, rowStyle, focused && styles.modalInputFocused]}
                onPress={() => inputRef.current?.focus()}
            >
                <MaterialIcons name={icon} size={18} color={focused ? AppColors.ctaButton : AppColors.textMuted} />
                <TextInput
                    ref={inputRef}
                    style={[styles.modalInputText, alignStyle, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                    placeholder={placeholder}
                    placeholderTextColor={AppColors.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                        setTimeout(() => setFocused(false), 200);
                    }}
                    autoComplete={Platform.OS === 'android' ? 'off' : 'name'}
                    importantForAutofill="noExcludeDescendants"
                    textContentType="none"
                    autoCorrect={false}
                />
            </Pressable>
            
            {suggestions.length > 0 && (
                <View style={styles.dropdown}>
                    <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={{ maxHeight: 150 }}>
                        {suggestions.map((sugg, index) => (
                            <Pressable 
                                key={sugg} 
                                style={[
                                    styles.suggestionItem, 
                                    rowStyle,
                                    index === suggestions.length - 1 && { borderBottomWidth: 0 }
                                ]}
                                onPress={() => {
                                    onChangeText(sugg);
                                    setFocused(false); // Manually hide dropdown
                                }}
                            >
                                <Text style={[styles.suggestionText, alignStyle]}>{sugg}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    modalInput: { 
        alignItems: 'center', 
        backgroundColor: '#FFFFFF', 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: AppColors.cardBorder, 
        paddingHorizontal: 12, 
        paddingVertical: Platform.OS === 'ios' ? 12 : 4,
        gap: 8,
        minHeight: 52,
    },
    modalInputFocused: {
        borderColor: AppColors.ctaButton,
        backgroundColor: '#FFFFFF',
    },
    modalInputText: { 
        flex: 1, 
        fontSize: 15, 
        color: AppColors.textPrimary,
        height: '100%',
        minHeight: 40,
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: AppColors.cardBorder,
        borderRadius: 12,
        marginTop: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 6, // High elevation for Android zIndex overlap
        maxHeight: 150,
        overflow: 'hidden',
    },
    suggestionItem: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    suggestionText: {
        fontSize: 15,
        color: AppColors.textPrimary,
    }
});
