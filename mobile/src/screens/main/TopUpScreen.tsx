import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';
import { MOCK_CREDIT_BALANCE } from '../../data/mockData';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

interface PackageOption {
  id: string;
  amount: number;
  description: string;
  isPopular?: boolean;
}

const PACKAGES: PackageOption[] = [
  { id: 'pkg1', amount: 50, description: 'Good for 3-5 leads' },
  { id: 'pkg2', amount: 100, description: 'Good for 6-10 leads', isPopular: true },
  { id: 'pkg3', amount: 250, description: 'Good for 15-20 leads' },
];

export function TopUpScreen({ navigation }: Props) {
  const [selectedPackage, setSelectedPackage] = useState<string>('pkg2');
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
    setSelectedPackage('');
  };

  const getSelectedAmount = (): number => {
    if (isCustom && customAmount) {
      return parseFloat(customAmount) || 0;
    }
    const pkg = PACKAGES.find(p => p.id === selectedPackage);
    return pkg?.amount || 0;
  };

  const handleContinue = () => {
    const amount = getSelectedAmount();
    if (amount > 0) {
      navigation.navigate('Payment', { amount });
    }
  };

  const canContinue = getSelectedAmount() >= 10;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>{'‹'}</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Top up lead credits</Text>
            <Text style={styles.subtitle}>
              Credits auto-charge when Barker captures a new lead. $15-30 per lead depending on service.
            </Text>
          </View>

          {/* Current Balance */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Current balance</Text>
            <Text style={styles.balanceAmount}>${MOCK_CREDIT_BALANCE.toFixed(2)}</Text>
            <Text style={styles.balanceSubtext}>available</Text>
          </View>

          {/* Package Options */}
          <View style={styles.packagesSection}>
            <Text style={styles.sectionLabel}>Select amount</Text>

            {PACKAGES.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.packageCard,
                  selectedPackage === pkg.id && styles.packageCardSelected,
                  pkg.isPopular && styles.packageCardPopular,
                ]}
                onPress={() => handleSelectPackage(pkg.id)}
                activeOpacity={0.7}
              >
                {pkg.isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                  </View>
                )}
                <View style={styles.packageContent}>
                  <View style={styles.packageLeft}>
                    <View style={[
                      styles.radioOuter,
                      selectedPackage === pkg.id && styles.radioOuterSelected,
                    ]}>
                      {selectedPackage === pkg.id && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.packageAmount}>${pkg.amount}</Text>
                  </View>
                  <Text style={styles.packageDescription}>{pkg.description}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {/* Custom Amount */}
            <View style={[
              styles.customCard,
              isCustom && styles.packageCardSelected,
            ]}>
              <TouchableOpacity
                style={styles.customRow}
                onPress={handleCustomFocus}
                activeOpacity={0.7}
              >
                <View style={styles.packageLeft}>
                  <View style={[
                    styles.radioOuter,
                    isCustom && styles.radioOuterSelected,
                  ]}>
                    {isCustom && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.packageAmount}>Custom</Text>
                </View>
              </TouchableOpacity>
              {isCustom && (
                <View style={styles.customInputRow}>
                  <Text style={styles.dollarSign}>$</Text>
                  <TextInput
                    style={styles.customInput}
                    value={customAmount}
                    onChangeText={setCustomAmount}
                    placeholder="0"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                    autoFocus
                  />
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!canContinue}
            activeOpacity={0.8}
          >
            <Text style={[styles.continueButtonText, !canContinue && styles.continueButtonTextDisabled]}>
              Continue to payment
            </Text>
          </TouchableOpacity>
          <Text style={styles.finePrint}>
            Credits never expire. No subscriptions. Pause anytime.
          </Text>
        </View>
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
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  backButton: {
    marginLeft: -spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.sm,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 32,
    color: colors.accent,
    fontWeight: '300',
  },
  title: {
    fontSize: fontSize.headline,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  balanceCard: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  balanceLabel: {
    fontSize: fontSize.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: -1,
  },
  balanceSubtext: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  packagesSection: {
    paddingHorizontal: spacing.screen,
  },
  sectionLabel: {
    fontSize: fontSize.footnote,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  packageCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  packageCardSelected: {
    borderColor: colors.accent,
  },
  packageCardPopular: {
    borderColor: colors.accent,
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: spacing.lg,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
    letterSpacing: 0.5,
  },
  packageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioOuterSelected: {
    borderColor: colors.accent,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  packageAmount: {
    fontSize: fontSize.title,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  packageDescription: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
  },
  customCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingLeft: 38,
  },
  dollarSign: {
    fontSize: fontSize.title,
    color: colors.textTertiary,
    marginRight: spacing.xs,
  },
  customInput: {
    fontSize: fontSize.title,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    padding: 0,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  continueButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.sm,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.backgroundCard,
  },
  continueButtonText: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.background,
  },
  continueButtonTextDisabled: {
    color: colors.textTertiary,
  },
  finePrint: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
