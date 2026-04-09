import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing } from '../constants/theme';

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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  selected: {
    backgroundColor: colors.accentSubtle,
    borderColor: colors.accent,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.accent,
  },
});
