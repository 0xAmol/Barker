import React, { ReactNode } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';
import { ProgressBar } from './ProgressBar';

interface ScreenWrapperProps {
  children: ReactNode;
  step: number;
  showProgress?: boolean;
  scrollable?: boolean;
  footer?: ReactNode;
}

export function ScreenWrapper({
  children,
  step,
  showProgress = true,
  scrollable = false,
  footer,
}: ScreenWrapperProps) {
  const content = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {showProgress && <ProgressBar currentStep={step} />}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {content}
        {footer && (
          <SafeAreaView edges={['bottom']} style={styles.footer}>
            {footer}
          </SafeAreaView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: 32,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
});
