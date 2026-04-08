import React, { useState } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, Pressable, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AppColors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface FAQItem {
    id: string; question: string; answer: string;
}

export default function HelpSupportScreen() {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const isRtl = i18n.language === 'he' || i18n.language === 'ar';
    const alignStyle: any = { textAlign: isRtl ? 'right' : 'left' };
    const rowStyle: any = { flexDirection: isRtl ? 'row-reverse' : 'row' };
    const alignFlexStyle: any = { alignItems: isRtl ? 'flex-end' : 'flex-start' };

    const FAQ_DATA: FAQItem[] = [
        { id: '1', question: t('help.q1', 'What is Group Deals?'), answer: t('help.a1', 'Group Deals is a platform where buyers join together to unlock bigger discounts.') },
        { id: '2', question: t('help.q2', 'How do group deals work?'), answer: t('help.a2', 'Browse available deals, join one you like, and wait for enough people to join.') },
        { id: '3', question: t('help.q3', 'Is my payment secure?'), answer: t('help.a3', 'Yes! We use industry-standard encryption to protect all payment data.') },
        { id: '4', question: t('help.q4', 'Can I cancel my participation?'), answer: t('help.a4', 'You can leave a group deal before it reaches its target.') },
        { id: '5', question: t('help.q5', 'How do I get my refund?'), answer: t('help.a5', 'If a deal doesn\'t reach its target by the deadline, you are automatically refunded.') },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialIcons name="arrow-back" size={24} color={AppColors.textPrimary} />
                    </Pressable>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={styles.title}>{t('help.title', 'Help & Support')}</Text>
                        <Text style={styles.subtitle}>{t('help.subtitle', 'Get help and contact us')}</Text>
                    </View>
                </View>

                {/* Contact Card */}
                <View style={[styles.contactCard, alignFlexStyle]}>
                    <MaterialIcons name="support-agent" size={36} color={AppColors.priceGreen} />
                    <Text style={[styles.contactTitle, alignStyle]}>{t('help.need_help', 'Need help?')}</Text>
                    <Text style={[styles.contactSubtitle, alignStyle]}>{t('help.support_team', 'Our support team is here for you')}</Text>
                    <View style={[styles.contactRow, rowStyle]}>
                        <MaterialIcons name="email" size={18} color={AppColors.textSecondary} />
                        <Text style={[styles.contactInfo, alignStyle]}>support@groupdeals.com</Text>
                    </View>
                    <View style={[styles.contactRow, rowStyle]}>
                        <MaterialIcons name="phone" size={18} color={AppColors.textSecondary} />
                        <Text style={[styles.contactInfo, alignStyle]}>+972-50-123-4567</Text>
                    </View>
                </View>

                {/* FAQ Section */}
                <Text style={[styles.faqHeader, alignStyle]}>{t('help.faq', 'Frequently Asked Questions')}</Text>
                <View style={styles.faqSection}>
                    {FAQ_DATA.map((item, index) => (
                        <Pressable
                            key={item.id}
                            style={[styles.faqItem, index === FAQ_DATA.length - 1 && { borderBottomWidth: 0 }]}
                            onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        >
                            <View style={[styles.faqQuestion, rowStyle]}>
                                <Text style={[styles.faqQuestionText, alignStyle, isRtl ? { marginLeft: 8 } : { marginRight: 8 }]}>{item.question}</Text>
                                <MaterialIcons
                                    name={expandedId === item.id ? 'expand-less' : 'expand-more'}
                                    size={24}
                                    color={AppColors.textMuted}
                                />
                            </View>
                            {expandedId === item.id && (
                                <Text style={[styles.faqAnswer, alignStyle]}>{item.answer}</Text>
                            )}
                        </Pressable>
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
    contactCard: { backgroundColor: '#FFF', marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: AppColors.cardBorder, gap: 6 },
    contactTitle: { fontSize: 20, fontWeight: '800', color: AppColors.textPrimary, marginTop: 4 },
    contactSubtitle: { fontSize: 14, color: AppColors.textSecondary },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    contactInfo: { fontSize: 14, color: AppColors.textPrimary, fontWeight: '500' },
    faqHeader: { fontSize: 17, fontWeight: '700', color: AppColors.textPrimary, marginHorizontal: 24, marginTop: 24, marginBottom: 8 },
    faqSection: { backgroundColor: '#FFF', marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: AppColors.cardBorder },
    faqItem: { paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    faqQuestionText: { fontSize: 15, fontWeight: '600', color: AppColors.textPrimary, flex: 1 },
    faqAnswer: { fontSize: 14, color: AppColors.textSecondary, lineHeight: 20, marginTop: 10 },
});
