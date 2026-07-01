import type { Lang } from "./translations";

// Localized crop names by canonical slug. English falls back to lib/crops displayName.
const CROP_NAMES: Record<string, { ur: string; hi: string }> = {
  rice: { ur: "چاول", hi: "चावल" },
  maize: { ur: "مکئی", hi: "मक्का" },
  cotton: { ur: "کپاس", hi: "कपास" },
  jute: { ur: "پٹسن", hi: "जूट" },
  chickpea: { ur: "چنا", hi: "चना" },
  lentil: { ur: "مسور", hi: "मसूर" },
  mungbean: { ur: "مونگ", hi: "मूँग" },
  blackgram: { ur: "ماش", hi: "उड़द" },
  kidneybeans: { ur: "لوبیا", hi: "राजमा" },
  mothbeans: { ur: "مٹھ", hi: "मोठ" },
  pigeonpeas: { ur: "ارہر", hi: "अरहर" },
  watermelon: { ur: "تربوز", hi: "तरबूज़" },
  muskmelon: { ur: "خربوزہ", hi: "खरबूजा" },
  banana: { ur: "کیلا", hi: "केला" },
  papaya: { ur: "پپیتا", hi: "पपीता" },
  pomegranate: { ur: "انار", hi: "अनार" },
  mango: { ur: "آم", hi: "आम" },
  grapes: { ur: "انگور", hi: "अंगूर" },
  apple: { ur: "سیب", hi: "सेब" },
  orange: { ur: "مالٹا", hi: "संतरा" },
  coconut: { ur: "ناریل", hi: "नारियल" },
  coffee: { ur: "کافی", hi: "कॉफ़ी" },
  wheat: { ur: "گندم", hi: "गेहूँ" },
  potato: { ur: "آلو", hi: "आलू" },
  soybean: { ur: "سویابین", hi: "सोयाबीन" },
  sorghum: { ur: "جوار", hi: "ज्वार" },
  sweet_potato: { ur: "شکرقندی", hi: "शकरकंद" },
  sugarcane: { ur: "گنا", hi: "गन्ना" },
  barley: { ur: "جو", hi: "जौ" },
  rapeseed: { ur: "سرسوں", hi: "सरसों" },
  beans: { ur: "پھلیاں", hi: "फलियाँ" },
  peas: { ur: "مٹر", hi: "मटर" },
  tomato: { ur: "ٹماٹر", hi: "टमाटर" },
};

export function localizedCrop(slug: string, lang: Lang, fallback: string): string {
  if (lang === "en") return fallback;
  return CROP_NAMES[slug]?.[lang] ?? fallback;
}
