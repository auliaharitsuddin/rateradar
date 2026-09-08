import type { Hotel } from "./types";

/**
 * Deterministic 32-bit string hash. Every synthetic price in this app derives from
 * it, so the same query always yields the same numbers — server and client render
 * identically (no hydration mismatch) and charts do not jitter between refreshes.
 */
export function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // fmix32 finaliser. FNV-1a on its own avalanches poorly on the final byte:
  // sequential seeds ("…-07-28", "…-07-29") came out ~1/256 apart, which made
  // every daily price series almost flat and hid real rate movement.
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  h ^= h >>> 16;
  return h >>> 0;
}

/** Deterministic float in [0,1) derived from a seed string. */
export function rand(seed: string): number {
  return hash(seed) / 4294967296;
}

/** Deterministic integer in [min,max]. */
export function randInt(seed: string, min: number, max: number): number {
  return min + Math.floor(rand(seed) * (max - min + 1));
}

export const CITIES = [
  { slug: "bali", name: "Bali", label: "Bali", properties: 21784 },
  { slug: "jakarta", name: "Jakarta", label: "Jakarta", properties: 10141 },
  { slug: "bandung", name: "Bandung", label: "Bandung", properties: 4820 },
  { slug: "yogyakarta", name: "Yogyakarta", label: "Yogyakarta", properties: 3967 },
] as const;

export type CitySlug = (typeof CITIES)[number]["slug"];

interface HotelSeed {
  name: string;
  area: string;
  stars: number;
  rating: number;
  reviews: number;
  base: number;
  amenities: string[];
}

const AMENITY_POOL = [
  ["Pool", "Free WiFi", "Breakfast", "Spa"],
  ["Pool", "Free WiFi", "Gym", "Airport shuttle"],
  ["Free WiFi", "Breakfast", "Parking"],
  ["Pool", "Beachfront", "Free WiFi", "Bar"],
  ["Free WiFi", "Gym", "Business centre", "Parking"],
  ["Pool", "Free WiFi", "Family rooms", "Breakfast"],
];

const SEEDS: Record<CitySlug, HotelSeed[]> = {
  bali: [
    { name: "Stark Boutique Hotel and Spa", area: "Kuta, Badung", stars: 3, rating: 8.1, reviews: 3200, base: 398000, amenities: AMENITY_POOL[0] },
    { name: "Sense Sunset Seminyak", area: "Seminyak, Badung", stars: 4, rating: 8.3, reviews: 7100, base: 612000, amenities: AMENITY_POOL[3] },
    { name: "Ubud Green Valley Resort", area: "Ubud, Gianyar", stars: 4, rating: 8.9, reviews: 2450, base: 845000, amenities: AMENITY_POOL[0] },
    { name: "Nusa Dua Beach Villas", area: "Nusa Dua, Badung", stars: 5, rating: 9.1, reviews: 5320, base: 1780000, amenities: AMENITY_POOL[3] },
    { name: "Canggu Surf Lodge", area: "Canggu, Badung", stars: 3, rating: 8.4, reviews: 1890, base: 452000, amenities: AMENITY_POOL[2] },
    { name: "Sanur Heritage Inn", area: "Sanur, Denpasar", stars: 3, rating: 7.9, reviews: 1120, base: 336000, amenities: AMENITY_POOL[2] },
    { name: "Jimbaran Cliff Retreat", area: "Jimbaran, Badung", stars: 5, rating: 9.3, reviews: 4180, base: 2240000, amenities: AMENITY_POOL[1] },
    { name: "Legian Palm Residence", area: "Legian, Badung", stars: 4, rating: 8.0, reviews: 2760, base: 578000, amenities: AMENITY_POOL[5] },
  ],
  jakarta: [
    { name: "Sudirman Grand Tower", area: "Sudirman, Jakarta Selatan", stars: 5, rating: 8.7, reviews: 6420, base: 1120000, amenities: AMENITY_POOL[4] },
    { name: "Kemang Urban Suites", area: "Kemang, Jakarta Selatan", stars: 4, rating: 8.2, reviews: 3310, base: 685000, amenities: AMENITY_POOL[1] },
    { name: "Menteng Colonial Hotel", area: "Menteng, Jakarta Pusat", stars: 4, rating: 8.5, reviews: 2180, base: 742000, amenities: AMENITY_POOL[2] },
    { name: "Thamrin Business Inn", area: "Thamrin, Jakarta Pusat", stars: 3, rating: 7.8, reviews: 4090, base: 448000, amenities: AMENITY_POOL[4] },
    { name: "PIK Waterfront Hotel", area: "Penjaringan, Jakarta Utara", stars: 4, rating: 8.4, reviews: 1970, base: 796000, amenities: AMENITY_POOL[5] },
    { name: "Cengkareng Transit Lodge", area: "Cengkareng, Jakarta Barat", stars: 3, rating: 7.6, reviews: 5610, base: 372000, amenities: AMENITY_POOL[1] },
    { name: "Senayan Executive Residence", area: "Senayan, Jakarta Pusat", stars: 5, rating: 9.0, reviews: 3840, base: 1560000, amenities: AMENITY_POOL[4] },
    { name: "Cikini Boutique Stay", area: "Cikini, Jakarta Pusat", stars: 3, rating: 8.1, reviews: 1230, base: 415000, amenities: AMENITY_POOL[2] },
  ],
  bandung: [
    { name: "Dago Highland Resort", area: "Dago, Bandung Utara", stars: 4, rating: 8.6, reviews: 2940, base: 638000, amenities: AMENITY_POOL[0] },
    { name: "Braga Heritage House", area: "Braga, Bandung Wetan", stars: 3, rating: 8.3, reviews: 1760, base: 392000, amenities: AMENITY_POOL[2] },
    { name: "Lembang Pine Villas", area: "Lembang, Bandung Barat", stars: 4, rating: 8.8, reviews: 3520, base: 824000, amenities: AMENITY_POOL[5] },
    { name: "Riau Street Suites", area: "Riau, Bandung Wetan", stars: 3, rating: 7.9, reviews: 2110, base: 358000, amenities: AMENITY_POOL[2] },
    { name: "Setiabudi Park Hotel", area: "Setiabudi, Bandung Utara", stars: 4, rating: 8.1, reviews: 1480, base: 546000, amenities: AMENITY_POOL[1] },
    { name: "Pasteur Grand Inn", area: "Pasteur, Sukajadi", stars: 3, rating: 7.7, reviews: 3280, base: 318000, amenities: AMENITY_POOL[4] },
    { name: "Ciumbuleuit Sky Residence", area: "Ciumbuleuit, Cidadap", stars: 5, rating: 9.0, reviews: 1920, base: 1290000, amenities: AMENITY_POOL[0] },
    { name: "Buah Batu Family Lodge", area: "Buah Batu, Bandung Kidul", stars: 3, rating: 8.0, reviews: 980, base: 288000, amenities: AMENITY_POOL[5] },
  ],
  yogyakarta: [
    { name: "Malioboro Grand Heritage", area: "Malioboro, Gedongtengen", stars: 4, rating: 8.7, reviews: 5180, base: 592000, amenities: AMENITY_POOL[2] },
    { name: "Prawirotaman Art Hotel", area: "Prawirotaman, Mergangsan", stars: 3, rating: 8.4, reviews: 2640, base: 386000, amenities: AMENITY_POOL[0] },
    { name: "Sleman Garden Resort", area: "Sleman, Yogyakarta", stars: 4, rating: 8.5, reviews: 1830, base: 668000, amenities: AMENITY_POOL[5] },
    { name: "Kraton Royal Residence", area: "Kraton, Yogyakarta", stars: 5, rating: 9.2, reviews: 2270, base: 1420000, amenities: AMENITY_POOL[0] },
    { name: "Kaliurang Hillside Inn", area: "Kaliurang, Sleman", stars: 3, rating: 8.2, reviews: 1410, base: 342000, amenities: AMENITY_POOL[2] },
    { name: "Tugu Station Hotel", area: "Tugu, Jetis", stars: 3, rating: 7.8, reviews: 3960, base: 306000, amenities: AMENITY_POOL[4] },
    { name: "Parangtritis Beach Lodge", area: "Parangtritis, Bantul", stars: 4, rating: 8.3, reviews: 1150, base: 512000, amenities: AMENITY_POOL[3] },
    { name: "Condongcatur Business Suites", area: "Condongcatur, Sleman", stars: 4, rating: 8.0, reviews: 2050, base: 474000, amenities: AMENITY_POOL[1] },
  ],
};

const CITY_CENTRE: Record<CitySlug, [number, number]> = {
  bali: [-8.6705, 115.2126],
  jakarta: [-6.2088, 106.8456],
  bandung: [-6.9175, 107.6191],
  yogyakarta: [-7.7956, 110.3695],
};

function buildHotels(): Hotel[] {
  const out: Hotel[] = [];
  for (const city of CITIES) {
    const seeds = SEEDS[city.slug];
    const [clat, clng] = CITY_CENTRE[city.slug];
    seeds.forEach((s, i) => {
      const id = `${city.slug}-${i + 1}`;
      out.push({
        id,
        name: s.name,
        city: city.name,
        area: s.area,
        stars: s.stars,
        rating: s.rating,
        reviews: s.reviews,
        lat: clat + (rand(`${id}-lat`) - 0.5) * 0.14,
        lng: clng + (rand(`${id}-lng`) - 0.5) * 0.14,
        image: `hotel-${(hash(id) % 6) + 1}`,
        amenities: s.amenities,
      });
    });
  }
  return out;
}

export const HOTELS: Hotel[] = buildHotels();

export const BASE_RATE: Record<string, number> = Object.fromEntries(
  CITIES.flatMap((c) => SEEDS[c.slug].map((s, i) => [`${c.slug}-${i + 1}`, s.base])),
);

export function hotelsByCity(citySlug: string): Hotel[] {
  const city = CITIES.find((c) => c.slug === citySlug);
  if (!city) return [];
  return HOTELS.filter((h) => h.city === city.name);
}

export function findHotel(id: string): Hotel | undefined {
  return HOTELS.find((h) => h.id === id);
}
