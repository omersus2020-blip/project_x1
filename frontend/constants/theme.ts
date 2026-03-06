/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#1E3A8A';
const tintColorDark = '#93C5FD';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F8F9FA',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

/** App-specific brand colors */
export const AppColors = {
  primaryBlue: '#1E3A8A',
  primaryBlueLight: '#3B82F6',
  headerGradientStart: '#1E3A8A',
  headerGradientEnd: '#2563EB',
  accentOrange: '#F97316',
  accentOrangeLight: '#FB923C',
  savingsGreen: '#16A34A',
  savingsGreenLight: '#4ADE80',
  cardBackground: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  cardBorder: '#E5E7EB',
  savingsBannerBg: '#1E3A8A',
  savingsBannerText: '#FFFFFF',
  priceText: '#1E3A8A',
  countdownText: '#6B7280',
  ctaButton: '#2563EB',
  ctaButtonText: '#FFFFFF',
  sectionTitle: '#1F2937',
  subtitleText: '#6B7280',
  divider: '#E5E7EB',
  badgeBg: '#DBEAFE',
  badgeText: '#1E40AF',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
