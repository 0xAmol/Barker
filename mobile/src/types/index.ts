// Onboarding state types

export type ServiceType =
  | 'plumbing'
  | 'hvac'
  | 'electrical'
  | 'cleaning'
  | 'landscaping'
  | 'painting'
  | 'locksmith'
  | 'photography'
  | 'detailing'
  | 'personal_training'
  | 'handyman'
  | 'other';

export type PainPoint =
  | 'no_time'
  | 'bad_leads'
  | 'no_social_media'
  | 'inconsistent'
  | 'competitors'
  | 'hate_referrals'
  | 'ads_confusing';

export interface OnboardingState {
  // Screen 2: Service type
  serviceType: ServiceType | null;

  // Screen 3: Pain points
  painPoints: PainPoint[];

  // Screen 6: Location
  locations: string[];

  // Screen 8: Demo results
  businessAnalysis: BusinessAnalysis | null;

  // Screen 10: Account
  phone: string;
  name: string;
  email: string;
}

export interface BusinessAnalysis {
  businessName: string;
  services: string[];
  serviceArea: string[];
  brandVoice: string;
  reviews: { text: string; author: string; rating: number }[];
  facebookGroups: { name: string; members: string }[];
  quotePageUrl: string;
  sampleReply: string;
}

export interface ServiceOption {
  id: ServiceType;
  label: string;
  emoji: string;
}

export interface PainPointOption {
  id: PainPoint;
  label: string;
}

export const SERVICE_OPTIONS: ServiceOption[] = [
  { id: 'plumbing', label: 'Plumbing', emoji: '🔧' },
  { id: 'hvac', label: 'HVAC & Air Conditioning', emoji: '❄️' },
  { id: 'electrical', label: 'Electrical', emoji: '⚡' },
  { id: 'cleaning', label: 'House Cleaning', emoji: '🧹' },
  { id: 'landscaping', label: 'Landscaping & Lawn Care', emoji: '🌳' },
  { id: 'painting', label: 'Painting', emoji: '🎨' },
  { id: 'locksmith', label: 'Locksmith', emoji: '🔐' },
  { id: 'photography', label: 'Photography', emoji: '📸' },
  { id: 'detailing', label: 'Mobile Detailing', emoji: '🚗' },
  { id: 'personal_training', label: 'Personal Training', emoji: '🏋️' },
  { id: 'handyman', label: 'General Handyman', emoji: '🏠' },
  { id: 'other', label: 'Other', emoji: '➕' },
];

export const PAIN_POINT_OPTIONS: PainPointOption[] = [
  { id: 'no_time', label: "I don't have time to market — I'm busy doing the actual work" },
  { id: 'bad_leads', label: "I've paid for leads that never pick up the phone" },
  { id: 'no_social_media', label: "I don't know how to use social media for my business" },
  { id: 'inconsistent', label: "My work is inconsistent — some weeks are packed, others are dead" },
  { id: 'competitors', label: "Competitors with worse reviews show up before me online" },
  { id: 'hate_referrals', label: "I hate asking people for referrals" },
  { id: 'ads_confusing', label: "I've tried ads but couldn't figure out what works" },
];
