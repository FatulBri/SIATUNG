import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../constants/theme';
import { Card } from './Card';

type TimelineItem = {
  level: string;
  schoolName: string;
  years: string;
  description: string;
};

type TimelineProps = {
  items: TimelineItem[];
};

export function Timeline({ items }: TimelineProps) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <View key={`${item.level}-${item.years}`} style={styles.row}>
            <View style={styles.markerColumn}>
              <View style={styles.dot} />
              {!isLast ? <View style={styles.line} /> : null}
            </View>

            <Card style={styles.itemCard}>
              <Text style={styles.level}>{item.level}</Text>
              <Text style={styles.school}>{item.schoolName}</Text>
              <Text style={styles.years}>{item.years}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </Card>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  markerColumn: {
    alignItems: 'center',
    marginRight: spacing.md,
    paddingTop: spacing.md,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.primaryLight,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
  },
  itemCard: {
    flex: 1,
    marginBottom: spacing.sm,
  },
  level: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  school: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  years: {
    color: colors.muted,
    fontSize: typography.body,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  description: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
});
