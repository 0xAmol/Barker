import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, fontSize, borderRadius, spacing } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string;
}

export function Input({ label, helperText, error, style, ...props }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.footnote,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  helperText: {
    fontSize: fontSize.footnote,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.footnote,
    color: colors.error,
    marginTop: spacing.sm,
  },
});
