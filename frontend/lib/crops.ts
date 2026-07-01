// Canonical crop registry - mirrors backend app/crops.py.
// Recommendation/rotation = 22 real crops; yield = 9 real crops.

export interface CropDef {
  slug: string;
  display: string;
  yieldAvailable: boolean;
  rotationAvailable: boolean;
}

// 22 recommendation / rotation crops (real dataset labels).
const RECO_CROPS = [
  "rice", "maize", "cotton", "jute", "chickpea", "lentil", "mungbean",
  "blackgram", "kidneybeans", "mothbeans", "pigeonpeas", "watermelon",
  "muskmelon", "banana", "papaya", "pomegranate", "mango", "grapes",
  "apple", "orange", "coconut", "coffee",
];

// 9 crops with real FAO/OWID yield data (canonical slugs).
const YIELD_CROPS = new Set([
  "wheat", "rice", "maize", "potato", "soybean", "sorghum",
  "sweet_potato", "sugarcane", "barley",
]);

const DISPLAY_OVERRIDES: Record<string, string> = {
  sweet_potato: "Sweet Potato",
  blackgram: "Black Gram",
  kidneybeans: "Kidney Beans",
  mothbeans: "Moth Beans",
  pigeonpeas: "Pigeon Peas",
};

export function displayName(slug: string): string {
  if (DISPLAY_OVERRIDES[slug]) return DISPLAY_OVERRIDES[slug];
  return slug
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function makeCrop(slug: string): CropDef {
  return {
    slug,
    display: displayName(slug),
    yieldAvailable: YIELD_CROPS.has(slug),
    rotationAvailable: RECO_CROPS.includes(slug),
  };
}

// All crops the UI may surface (22 recommendation + yield-only extras).
const YIELD_ONLY = [...YIELD_CROPS].filter((c) => !RECO_CROPS.includes(c));
export const ALL_CROPS: CropDef[] = [
  ...RECO_CROPS.map(makeCrop),
  ...YIELD_ONLY.map(makeCrop),
];

export const RECOMMENDATION_CROPS: CropDef[] = RECO_CROPS.map(makeCrop);
export const YIELD_AVAILABLE_CROPS: CropDef[] = ALL_CROPS.filter(
  (c) => c.yieldAvailable,
);
export const ROTATION_CROPS: CropDef[] = RECOMMENDATION_CROPS;

export function getCrop(slug: string): CropDef | undefined {
  return ALL_CROPS.find((c) => c.slug === slug);
}

export function supportsYield(slug: string): boolean {
  return YIELD_CROPS.has(slug);
}
