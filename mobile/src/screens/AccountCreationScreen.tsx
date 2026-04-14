import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper, Button, Input } from '../components';
import { useOnboarding } from '../context/OnboardingContext';
import { colors, spacing } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export function AccountCreationScreen({ navigation }: Props) {
  const { state, setAccountInfo } = useOnboarding();
  const [phone, setPhone] = useState(state.phone);
  const [name, setName] = useState(state.name);
  const [email, setEmail] = useState(state.email);
  const [errors, setErrors] = useState<{ phone?: string; name?: string }>({});

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const validateAndContinue = () => {
    const newErrors: { phone?: string; name?: string } = {};

    // Validate phone (should have 10 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Please enter your name';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save to context
    setAccountInfo({ phone, name, email });

    // Navigate to paywall
    navigation.navigate('Paywall');
  };

  const isValid = phone.replace(/\D/g, '').length >= 10 && name.trim().length > 0;

  return (
    <ScreenWrapper
      step={10}
      footer={
        <View>
          <Button
            title="Create My Free Account"
            onPress={validateAndContinue}
            disabled={!isValid}
          />
          <Button
            title="Already have an account? Log in"
            variant="ghost"
            onPress={() => {}}
            style={styles.loginButton}
          />
        </View>
      }
    >
      <Text style={styles.headline}>Where should we text your leads?</Text>
      <Text style={styles.subheadline}>
        When someone requests a quote, you'll get an SMS with their name, number,
        and what they need.
      </Text>

      <View style={styles.form}>
        <Input
          label="Your phone number *"
          placeholder="(555) 555-5555"
          value={phone}
          onChangeText={handlePhoneChange}
          keyboardType="phone-pad"
          error={errors.phone}
        />

        <Input
          label="Your name *"
          placeholder="Dave Johnson"
          value={name}
          onChangeText={handleNameChange}
          autoCapitalize="words"
          error={errors.name}
        />

        <Input
          label="Email (optional)"
          placeholder="dave@johnsonplumbing.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          helperText="For receipts and account recovery"
        />
      </View>

      <View style={styles.privacyNote}>
        <Text style={styles.privacyIcon}>🔒</Text>
        <Text style={styles.privacyText}>
          We only text you about leads. No spam, no marketing.
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subheadline: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  form: {
    marginTop: spacing.sm,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  privacyIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
});
