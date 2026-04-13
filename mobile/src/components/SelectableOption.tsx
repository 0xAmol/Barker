import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors, fontSize, borderRadius, spacing } from '../constants/theme';

interface SelectableOptionProps {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
  multiSelect?: boolean;
}

export function SelectableOption({
  label,
  emoji,
  selected,
  onPress,
  multiSelect = false,
}: SelectableOptionProps) {
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
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  selected: {
    backgroundColor: colors.accentDim,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.separator,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '700',
  },
  emoji: {
    fontSize: 22,
    marginRight: spacing.md,
  },
  label: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.accent,
  },
  selectedIndicator: {
    fontSize: fontSize.body,
    color: colors.accent,
    fontWeight: '600',
  },
});
