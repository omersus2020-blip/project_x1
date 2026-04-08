/**
 * Color system matching Figma "Group Deals" design.
 * Clean white/black/green palette with modern LTR layout.
 */

import { Platform } from 'react-native';

const tintColorLight = '#000000';
const tintColorDark = '#FFFFFF';

export const Colors = {
  light: {
    text: '#1A1A1A',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
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

/** App-specific brand colors – Figma design tokens */
export const AppColors = {
  // Core
  black: '#1A1A1A',
  white: '#FFFFFF',
  background: '#FFFFFF',
  backgroundGray: '#F5F5F5',

  // Green for prices/positive
  priceGreen: '#16A34A',
  priceGreenLight: '#DCFCE7',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // Cards
  cardBackground: '#FFFFFF',
  cardBorder: '#E5E7EB',
  cardShadow: 'rgba(0, 0, 0, 0.06)',

  // Buttons
  ctaButton: '#1A1A1A',
  ctaButtonText: '#FFFFFF',

  // Category chips
  chipActive: '#1A1A1A',
  chipActiveText: '#FFFFFF',
  chipInactive: '#FFFFFF',
  chipInactiveText: '#4B5563',
  chipBorder: '#E5E7EB',

  // Badges
  discountBadge: '#16A34A',
  discountBadgeText: '#FFFFFF',
  categoryBadge: '#F3F4F6',
  categoryBadgeText: '#374151',

  // Progress bar
  progressBg: '#E5E7EB',
  progressFill: '#1A1A1A',

  // Tab bar
  tabActive: '#000000',
  tabInactive: '#9CA3AF',

  // Legacy aliases (for backward compatibility)
  primaryBlue: '#1A1A1A',
  primaryBlueLight: '#374151',
  savingsGreen: '#16A34A',
  accentOrange: '#F97316',
  sectionTitle: '#1A1A1A',
  subtitleText: '#6B7280',
  divider: '#E5E7EB',
  badgeBg: '#F3F4F6',
  badgeText: '#374151',
  countdownText: '#6B7280',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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
