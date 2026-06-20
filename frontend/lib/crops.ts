// Canonical crop registry — mirrors backend app/crops.py.
// Drives cross-tool chaining and the 15-vs-7 yield mismatch handling.

export interface CropDef {
  slug: string;
  display: string;
  yieldAvailable: boolean;
  rotationAvailable: boolean;
}

// 15 recommendation / rotation crops.
const RECO_CROPS = [
  "wheat", "rice", "maize", "cotton", "sugarcane", "chickpea", "lentil",
  "mungbean", "blackgram", "mustard", "sunflower", "potato", "sorghum",
  "millet", "barley",
];

// 7 crops with FAO yield data (canonical slugs).
const YIELD_CROPS = new Set([
  "maize", "wheat", "rice", "potato", "sorghum", "soybean", "sweet_potato",
]);

const DISPLAY_OVERRIDES: Record<string, string> = {
  sweet_potato: "Sweet Potato",
  blackgram: "Black Gram",
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

// All crops the UI may surface (15 + the two yield-only extras).
export const ALL_CROPS: CropDef[] = [
  ...RECO_CROPS.map(makeCrop),
  makeCrop("soybean"),
  makeCrop("sweet_potato"),
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
