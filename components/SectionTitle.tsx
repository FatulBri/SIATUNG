import { StyleSheet, Text, View } from 'react-native';

import { useAppPreferences } from '../constants/preferences';
import { spacing, typography } from '../constants/theme';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({ title, subtitle }: SectionTitleProps) {
  const { theme } = useAppPreferences();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.primary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: theme.muted }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.title,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: typography.body,
    lineHeight: 22,
  },
});
