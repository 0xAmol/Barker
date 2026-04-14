import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors, fontSize, borderRadius, spacing } from '../constants/theme';

interface SelectableOptionProps {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
  multiSelect?: boolean;
  compact?: boolean;
}

export function SelectableOption({
  label,
  emoji,
  selected,
  onPress,
  multiSelect = false,
  compact = false,
}: SelectableOptionProps) {
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, selected && styles.compactSelected]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {emoji && <Text style={styles.compactEmoji}>{emoji}</Text>}
        <Text style={[styles.compactLabel, selected && styles.labelSelected]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {multiSelect && (
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      )}
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {!multiSelect && selected && <Text style={styles.selectedIndicator}>✓</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    marginBottom: 8,
  },
  selected: {
    backgroundColor: colors.accentDim,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.separator,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.background,
    fontSize: 11,
    fontWeight: '700',
  },
  emoji: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.accent,
  },
  selectedIndicator: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
  },
  compactSelected: {
    backgroundColor: colors.accentDim,
  },
  compactEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  compactLabel: {
    fontSize: 13,
    color: colors.textPrimary,
  },
});
