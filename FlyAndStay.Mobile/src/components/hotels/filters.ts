import { HotelSearchParams } from "@/api/travel";
import { formatMoney } from "@/utils/dates";

export type HotelSort = "popular" | "price_asc" | "price_desc" | "rating" | "distance";
export const HOTEL_SORTS: { value: HotelSort; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Guest rating" },
  { value: "distance", label: "Distance to center" },
];

export type HotelFilters = {
  minPrice: string;
  maxPrice: string;
  minRating: number | null;
  stars: number[];
  amenities: string[];
  maxDistance: number | null;
};

export const emptyHotelFilters: HotelFilters = {
  minPrice: "",
  maxPrice: "",
  minRating: null,
  stars: [],
  amenities: [],
  maxDistance: null,
};

export const RATING_OPTIONS = [3.5, 4, 4.5];
export const DISTANCE_OPTIONS = [1, 3, 5];
export const STAR_OPTIONS = [3, 4, 5];

const num = (text: string) => {
  const n = Number(text.replace(",", "."));
  return text.trim() !== "" && Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function toHotelParams(city: string, guests: number, f: HotelFilters, sort: HotelSort): HotelSearchParams {
  return {
    city,
    guests,
    minPrice: num(f.minPrice),
    maxPrice: num(f.maxPrice),
    minRating: f.minRating ?? undefined,
    stars: f.stars.length ? f.stars.join(",") : undefined,
    amenities: f.amenities.length ? f.amenities.join(",") : undefined,
    maxDistance: f.maxDistance ?? undefined,
    sort,
  };
}

export const priceActive = (f: HotelFilters) => num(f.minPrice) !== undefined || num(f.maxPrice) !== undefined;
export const ratingActive = (f: HotelFilters) => f.minRating !== null || f.stars.length > 0;
export const moreActive = (f: HotelFilters) => f.amenities.length > 0 || f.maxDistance !== null;

export function countHotelFilters(f: HotelFilters): number {
  return (priceActive(f) ? 1 : 0) + (f.minRating !== null ? 1 : 0) + f.stars.length + f.amenities.length + (f.maxDistance !== null ? 1 : 0);
}

export function priceLabel(f: HotelFilters): string {
  const min = num(f.minPrice);
  const max = num(f.maxPrice);
  if (min !== undefined && max !== undefined) return `${formatMoney(min)} – ${formatMoney(max)}`;
  if (min !== undefined) return `From ${formatMoney(min)}`;
  if (max !== undefined) return `Up to ${formatMoney(max)}`;
  return "Price";
}
