import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useAppPreferences } from '../constants/preferences';
import { lightColors, radius, shadows, spacing } from '../constants/theme';

type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export function Card({ children, style }: CardProps) {
  const { isDark, theme } = useAppPreferences();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? lightColors.surface : theme.surface,
          borderColor: isDark ? '#334155' : theme.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    ...shadows.card,
  },
});
