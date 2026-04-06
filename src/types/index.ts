// Core domain types for Barker

export interface Agent {
  id: string;
  created_at: string;
  owner_name: string;
  owner_phone: string;
  owner_email?: string;
  business_name: string;
  business_url?: string;
  services: string[];
  service_area: string[];
  reviews_summary?: string;
  brand_voice: BrandVoice;
  pricing_tier?: "budget" | "mid" | "premium";
  status: "active" | "paused" | "setup";
  mode: "autopilot" | "approval" | "manual";
  wallet_address?: string;
  wallet_balance: number;
  credit_balance: number;
  total_leads: number;
  total_revenue: number;
  total_spent: number;
}

export interface BrandVoice {
  tone?: string; // "friendly and professional", "casual and local", etc.
  personality?: string;
  key_phrases?: string[];
  avoid?: string[];
  sample_posts?: string[];
}

export interface Lead {
  id: string;
  agent_id: string;
  created_at: string;
  name: string;
  phone?: string;
  email?: string;
  service_needed?: string;
  location?: string;
  urgency?: "today" | "this_week" | "this_month" | "flexible";
  notes?: string;
  source_platform?: string;
  source_post_url?: string;
  status: "new" | "contacted" | "won" | "lost" | "no_answer";
  revenue?: number;
  lead_cost?: number;
  billed: boolean;
}

export interface ContentItem {
  id: string;
  agent_id: string;
  platform: "x" | "facebook" | "instagram" | "tiktok" | "nextdoor";
  content_type: "post" | "reply" | "thread" | "reel" | "story" | "carousel" | "ad";
  body: string;
  media_urls: string[];
  hashtags: string[];
  referral_url?: string;
  reply_to_url?: string;
  reply_to_text?: string;
  status: "draft" | "queued" | "posted" | "failed" | "rejected";
  scheduled_for?: string;
  posted_at?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  is_paid: boolean;
  ad_spend: number;
}

export interface DemandSignal {
  id: string;
  agent_id: string;
  found_at: string;
  platform: string;
  post_url: string;
  post_text: string;
  author_handle?: string;
  location_hint?: string;
  relevance_score: number;
  intent: "seeking_service" | "asking_recommendation" | "complaining" | "general_discussion";
  status: "new" | "engaged" | "skipped" | "converted";
}

export interface Transaction {
  id: string;
  agent_id: string;
  created_at: string;
  type:
    | "credit_purchase"
    | "lead_charge"
    | "ad_spend"
    | "wallet_fund"
    | "wallet_withdraw"
    | "referral_earned"
    | "referral_paid"
    | "platform_fee";
  amount: number;
  direction: "inflow" | "outflow";
  currency: "USD" | "USDC";
  solana_tx_sig?: string;
  lead_id?: string;
  content_id?: string;
  description?: string;
}

export interface QuotePage {
  id: string;
  agent_id: string;
  slug: string;
  headline?: string;
  subheadline?: string;
  services_list: string[];
  review_highlights: ReviewHighlight[];
  cta_text: string;
  phone_display?: string;
  active: boolean;
}

export interface ReviewHighlight {
  text: string;
  author?: string;
  rating: number;
}

// Google Business Profile (scraped)
export interface BusinessProfile {
  name: string;
  category?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  review_count?: number;
  reviews: GoogleReview[];
  services: string[];
  hours?: Record<string, string>;
  photos: string[];
  service_area: string[];
}

export interface GoogleReview {
  text: string;
  rating: number;
  author: string;
  date?: string;
}

// Lead pricing by category
export const LEAD_PRICING: Record<string, number> = {
  plumbing: 15,
  hvac: 20,
  roofing: 30,
  electrical: 15,
  cleaning: 8,
  landscaping: 10,
  painting: 12,
  pest_control: 10,
  locksmith: 12,
  photography: 12,
  mobile_detailing: 8,
  personal_training: 10,
  real_estate: 25,
  general: 12,
};
