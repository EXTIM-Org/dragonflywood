import locationsData from "@/data/tapin-locations.json";
import ratesData from "@/data/tapin-pishtaz-rates.json";

export interface ProvinceInfo {
  id: number;
  title: string;
  cities: Record<string, string>;
}

export interface CityInfo {
  id: string;
  title: string;
}

export interface ShippingCalculationParams {
  subtotalPrice: number; // in Tomans
  totalWeightGrams?: number;
  province?: string | number | null;
  city?: string | number | null;
  boxSize?: number; // 1 to 10, default 1
  freeShippingEnabled?: boolean;
  freeShippingThreshold?: number;
}

export interface ShippingCalculationResult {
  shippingCost: number; // in Tomans
  isFree: boolean;
  weightGrams: number;
  weightIndex: number;
  vicinity: "in" | "beside" | "out";
  provinceId: number;
  provinceTitle: string;
  cityId?: string;
  cityTitle?: string;
  baseCostTomans: number;
  insuranceTomans: number;
  taxTomans: number;
}

// Origin: Shiraz, Fars
export const ORIGIN_PROVINCE_ID = 5;
export const ORIGIN_CITY_ID = 71;

// Neighboring provinces to Fars (5)
export const BESIDE_PROVINCES = [6, 25, 21, 23, 28, 22]; // Isfahan, Yazd, Bushehr, Hormozgan, Kohgiluyeh, Kerman

// Major cities with Tapin tariff adjustments
const SPECIAL_CITIES_15 = [61, 51, 41, 481];
const SPECIAL_CITIES_20 = [1, 31, 71, 81, 91]; // Tehran, Karaj, Shiraz, Tabriz, Mashhad
const SPECIAL_PROVINCES_5 = [5, 6, 7, 9, 22, 25, 26, 30];
const SPECIAL_ISLAND_CITIES = [79351, 7951, 75461, 79551, 7941, 79591, 79781];

export const DEFAULT_ITEM_WEIGHT_GRAMS = 2000; // 2 kg default if unspecified

const locations = locationsData as Record<string, { title: string; cities: Record<string, string> }>;
const rates = ratesData as Record<string, Record<string, { in: number; beside: number; out: number }>>;

/**
 * Clean and normalize Persian text for resilient matching
 */
export function normalizePersianText(str: string): string {
  if (!str) return "";
  return str
    .trim()
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/^(استان|شهرستان|شهر)\s+/g, "")
    .replace(/\s+(مرکزی|اصلی)$/g, "")
    .replace(/[‌\s]+/g, " ")
    .trim();
}

/**
 * Get all 31 Iranian provinces
 */
export function getProvinceList(): Array<{ id: number; title: string }> {
  return Object.entries(locations).map(([id, data]) => ({
    id: Number(id),
    title: data.title,
  })).sort((a, b) => a.title.localeCompare(b.title, "fa"));
}

/**
 * Get cities for a given province
 */
export function getCitiesByProvince(provinceIdOrName: number | string): CityInfo[] {
  const prov = findProvince(provinceIdOrName);
  if (!prov || !prov.cities) return [];
  return Object.entries(prov.cities).map(([id, title]) => ({
    id,
    title,
  })).sort((a, b) => a.title.localeCompare(b.title, "fa"));
}

/**
 * Look up province by ID or name
 */
export function findProvince(input?: string | number | null): ProvinceInfo | null {
  if (input === undefined || input === null || input === "") return null;

  if (typeof input === "number" || /^\d+$/.test(String(input).trim())) {
    const idStr = String(input).trim();
    if (locations[idStr]) {
      return { id: Number(idStr), title: locations[idStr].title, cities: locations[idStr].cities };
    }
  }

  const clean = normalizePersianText(String(input));
  if (!clean) return null;

  for (const [id, data] of Object.entries(locations)) {
    const provClean = normalizePersianText(data.title);
    if (provClean === clean || provClean.includes(clean) || clean.includes(provClean)) {
      return { id: Number(id), title: data.title, cities: data.cities };
    }
  }

  return null;
}

/**
 * Look up city within a province by ID or name
 */
export function findCity(provinceId: number, cityInput?: string | number | null): CityInfo | null {
  if (!cityInput || !locations[String(provinceId)]) return null;

  const cities = locations[String(provinceId)].cities;
  const inputStr = String(cityInput).trim();

  if (cities[inputStr]) {
    return { id: inputStr, title: cities[inputStr] };
  }

  const clean = normalizePersianText(inputStr);
  for (const [cid, ctitle] of Object.entries(cities)) {
    const cityClean = normalizePersianText(ctitle);
    if (cityClean === clean || cityClean.includes(clean) || clean.includes(cityClean)) {
      return { id: cid, title: ctitle };
    }
  }

  return null;
}

/**
 * Calculate the exact Tapin Pishtaz postage rate from Shiraz, Fars
 */
export function calculateTapinShippingCost(params: ShippingCalculationParams): ShippingCalculationResult {
  const {
    subtotalPrice,
    totalWeightGrams,
    province,
    city,
    boxSize = 1,
    freeShippingEnabled = true,
    freeShippingThreshold = 2000000,
  } = params;

  // 1. Resolve Province and City
  const matchedProv = findProvince(province);
  const toProvinceId = matchedProv ? matchedProv.id : 1; // Default to Tehran if unspecified
  const provinceTitle = matchedProv ? matchedProv.title : "سایر استان‌ها";

  let toCityIdNum = 0;
  let cityTitle: string | undefined = undefined;
  if (matchedProv && city) {
    const matchedCity = findCity(matchedProv.id, city);
    if (matchedCity) {
      toCityIdNum = Number(matchedCity.id) || 0;
      cityTitle = matchedCity.title;
    }
  }

  // 2. Check Free Shipping threshold
  if (freeShippingEnabled && subtotalPrice >= freeShippingThreshold) {
    return {
      shippingCost: 0,
      isFree: true,
      weightGrams: totalWeightGrams || DEFAULT_ITEM_WEIGHT_GRAMS,
      weightIndex: 1000,
      vicinity: toProvinceId === ORIGIN_PROVINCE_ID ? "in" : BESIDE_PROVINCES.includes(toProvinceId) ? "beside" : "out",
      provinceId: toProvinceId,
      provinceTitle,
      cityId: toCityIdNum ? String(toCityIdNum) : undefined,
      cityTitle,
      baseCostTomans: 0,
      insuranceTomans: 0,
      taxTomans: 0,
    };
  }

  // 3. Weight index (step of 1000g, min 1000, max 30000)
  const weight = Math.max(1, totalWeightGrams || DEFAULT_ITEM_WEIGHT_GRAMS);
  const weightIndex = Math.min(30000, Math.max(1000, Math.ceil(weight / 1000) * 1000));

  // 4. Determine vicinity relative to Shiraz (Fars: 5)
  let vicinity: "in" | "beside" | "out" = "out";
  if (toProvinceId === ORIGIN_PROVINCE_ID) {
    vicinity = "in";
  } else if (BESIDE_PROVINCES.includes(toProvinceId)) {
    vicinity = "beside";
  } else {
    vicinity = "out";
  }

  // 5. Look up base cost in Rials
  const clampedBoxSize = Math.max(1, Math.min(10, boxSize));
  const weightStr = String(weightIndex);
  const boxStr = String(clampedBoxSize);

  let baseCostRials = 700000;
  if (rates[weightStr] && rates[weightStr][boxStr]) {
    baseCostRials = rates[weightStr][boxStr][vicinity];
  } else if (rates[weightStr] && rates[weightStr]["1"]) {
    baseCostRials = rates[weightStr]["1"][vicinity];
  }

  // 6. City / Province Multipliers
  if (SPECIAL_CITIES_15.includes(toCityIdNum)) {
    baseCostRials *= 1.15;
  } else if (SPECIAL_CITIES_20.includes(toCityIdNum)) {
    baseCostRials *= 1.20;
  }

  if (SPECIAL_PROVINCES_5.includes(toProvinceId)) {
    baseCostRials *= 1.05;
  }

  if (SPECIAL_ISLAND_CITIES.includes(toCityIdNum)) {
    baseCostRials += 255000 * (weightIndex / 1000);
  }

  let totalRials = baseCostRials;

  // 7. Insurance Calculation (in Rials)
  const orderPriceRials = subtotalPrice * 10;
  let insuranceRials = 100000; // 10,000 Tomans default
  if (orderPriceRials > 100000000) {
    let insRate = 0.002;
    if (orderPriceRials >= 2000000000) insRate = 0.004;
    else if (orderPriceRials >= 1000000000) insRate = 0.0035;
    else if (orderPriceRials >= 500000000) insRate = 0.003;
    else if (orderPriceRials >= 300000000) insRate = 0.0025;

    insuranceRials = orderPriceRials * insRate + 135000;
  }
  totalRials += insuranceRials;

  // 8. Legal VAT Tax (10%)
  const taxRials = totalRials * 0.1;
  totalRials += taxRials;

  // 9. Convert to Tomans and round up to next 1,000 Tomans
  const finalTomans = Math.ceil(totalRials / 10000) * 1000;

  return {
    shippingCost: finalTomans,
    isFree: false,
    weightGrams: weight,
    weightIndex,
    vicinity,
    provinceId: toProvinceId,
    provinceTitle,
    cityId: toCityIdNum ? String(toCityIdNum) : undefined,
    cityTitle,
    baseCostTomans: Math.round(baseCostRials / 10),
    insuranceTomans: Math.round(insuranceRials / 10),
    taxTomans: Math.round(taxRials / 10),
  };
}
