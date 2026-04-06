import * as cheerio from "cheerio";
import type { BusinessProfile, GoogleReview } from "@/types";

// Scrape a Google Business profile from its URL
// In production, use Google Places API (place details + reviews)
// For hackathon MVP, we combine Places API with scraping
export async function ingestBusiness(
  googleBusinessUrl: string
): Promise<BusinessProfile> {
  // Extract place ID from URL if present
  const placeId = extractPlaceId(googleBusinessUrl);

  if (placeId && process.env.GOOGLE_PLACES_API_KEY) {
    return fetchFromPlacesAPI(placeId);
  }

  // Fallback: scrape the page
  return scrapeGoogleBusiness(googleBusinessUrl);
}

function extractPlaceId(url: string): string | null {
  // URLs like: https://maps.google.com/maps/place/...
  // or: https://www.google.com/maps/place/Dave's+Plumbing/@29.7,-95.3,...
  const match = url.match(/place_id[=:]([A-Za-z0-9_-]+)/);
  if (match) return match[1];

  // Try to extract from the data parameter
  const dataMatch = url.match(/!1s(0x[a-f0-9]+:[a-f0-9]+)/);
  if (dataMatch) return dataMatch[1];

  return null;
}

async function fetchFromPlacesAPI(
  placeId: string
): Promise<BusinessProfile> {
  const key = process.env.GOOGLE_PLACES_API_KEY!;

  // Place Details
  const detailsRes = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,types,reviews,photos,opening_hours&key=${key}`
  );
  const details = await detailsRes.json();
  const place = details.result;

  const reviews: GoogleReview[] = (place.reviews || []).map((r: any) => ({
    text: r.text,
    rating: r.rating,
    author: r.author_name,
    date: r.relative_time_description,
  }));

  // Infer services from category and reviews
  const services = inferServicesFromReviews(reviews, place.types || []);
  const serviceArea = inferServiceArea(place.formatted_address);

  return {
    name: place.name,
    category: place.types?.[0]?.replace(/_/g, " "),
    address: place.formatted_address,
    phone: place.formatted_phone_number,
    website: place.website,
    rating: place.rating,
    review_count: place.user_ratings_total,
    reviews,
    services,
    hours: place.opening_hours?.weekday_text?.reduce(
      (acc: Record<string, string>, line: string) => {
        const [day, hours] = line.split(": ");
        acc[day] = hours;
        return acc;
      },
      {}
    ),
    photos: (place.photos || [])
      .slice(0, 5)
      .map(
        (p: any) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${key}`
      ),
    service_area: serviceArea,
  };
}

async function scrapeGoogleBusiness(
  url: string
): Promise<BusinessProfile> {
  // Minimal fallback scraper for when we don't have a Places API key
  // In reality, Google blocks scraping, so this is for demo/dev only
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  });
  const html = await res.text();
  const $ = cheerio.load(html);

  return {
    name: $('meta[property="og:title"]').attr("content") || "Unknown Business",
    category: undefined,
    address: undefined,
    phone: undefined,
    website: undefined,
    rating: undefined,
    review_count: undefined,
    reviews: [],
    services: [],
    hours: undefined,
    photos: [],
    service_area: [],
  };
}

function inferServicesFromReviews(
  reviews: GoogleReview[],
  types: string[]
): string[] {
  // Common service keywords to look for in reviews
  const allText = reviews.map((r) => r.text.toLowerCase()).join(" ");
  const serviceKeywords: Record<string, string[]> = {
    plumbing: ["pipe", "leak", "drain", "faucet", "toilet", "water heater", "sewer", "plumb"],
    hvac: ["ac", "heating", "furnace", "air condition", "hvac", "duct", "thermostat"],
    electrical: ["wiring", "outlet", "circuit", "electrical", "panel", "light"],
    roofing: ["roof", "shingle", "gutter", "leak repair"],
    cleaning: ["clean", "maid", "janitorial", "housekeep", "deep clean"],
    landscaping: ["lawn", "landscape", "mow", "tree", "garden", "yard"],
    painting: ["paint", "stain", "wall", "exterior paint", "interior paint"],
    pest_control: ["pest", "termite", "bug", "rodent", "exterminator"],
  };

  const found: string[] = [];
  for (const [service, keywords] of Object.entries(serviceKeywords)) {
    if (keywords.some((kw) => allText.includes(kw))) {
      found.push(service);
    }
  }

  // Also use Google place types
  for (const type of types) {
    const normalized = type.replace(/_/g, " ");
    if (!found.includes(normalized)) {
      found.push(normalized);
    }
  }

  return found.length > 0 ? found : ["general services"];
}

function inferServiceArea(address?: string): string[] {
  if (!address) return [];
  // Extract city and state from address
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    return [parts[parts.length - 2]]; // Usually city, state
  }
  return [address];
}
