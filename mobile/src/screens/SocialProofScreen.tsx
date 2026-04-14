import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper, Button } from '../components';
import { colors, spacing, borderRadius } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const TESTIMONIALS = [
  {
    name: 'Dave R.',
    role: 'Plumber',
    location: 'Houston',
    quote: 'Got 3 jobs in my first week. Now I just answer the phone.',
    rating: 5,
  },
  {
    name: 'Maria S.',
    role: 'House Cleaner',
    location: 'Austin',
    quote:
      'I used to spend hours on Facebook groups looking for work. Barker does it for me while I clean.',
    rating: 5,
  },
  {
    name: 'Jake T.',
    role: 'HVAC Tech',
    location: 'Dallas',
    quote:
      "Finally, leads that actually want a quote. Not tire-kickers from Angi.",
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <Text style={styles.stars}>
      {'★'.repeat(rating)}
      {'☆'.repeat(5 - rating)}
    </Text>
  );
}

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof TESTIMONIALS)[0];
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {testimonial.name.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{testimonial.name}</Text>
          <Text style={styles.cardRole}>
            {testimonial.role} · {testimonial.location}
          </Text>
        </View>
      </View>
      <StarRating rating={testimonial.rating} />
      <Text style={styles.cardQuote}>"{testimonial.quote}"</Text>
    </View>
  );
}

export function SocialProofScreen({ navigation }: Props) {
  return (
    <ScreenWrapper
      step={4}
      footer={
        <Button title="Continue" onPress={() => navigation.navigate('Solution')} />
      }
    >
      <Text style={styles.headline}>You're not alone.{'\n'}And it's fixable.</Text>
      <Text style={styles.subheadline}>
        2,000+ service pros stopped chasing leads. Here's what they say:
      </Text>

      <View style={styles.testimonials}>
        {TESTIMONIALS.map((testimonial, index) => (
          <TestimonialCard key={index} testimonial={testimonial} />
        ))}
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
  testimonials: {
    gap: 10,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.accent,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardRole: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  stars: {
    fontSize: 14,
    color: colors.accent,
    marginBottom: spacing.sm,
  },
  cardQuote: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
