import { ComponentProps } from "react";
import { Ionicons } from "@expo/vector-icons";

import { FlightSearchParams } from "@/api/travel";
import { AirlineBrand } from "@/api/types";

export type FlightSort = "price_asc" | "price_desc" | "departure" | "duration";
export const FLIGHT_SORTS: { value: FlightSort; label: string }[] = [
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "departure", label: "Earliest departure" },
  { value: "duration", label: "Shortest duration" },
];

export type TimeOfDay = "night" | "morning" | "afternoon" | "evening";
export const TIMES_OF_DAY: { value: TimeOfDay; label: string; hint: string; icon: ComponentProps<typeof Ionicons>["name"] }[] = [
  { value: "night", label: "Night", hint: "00:00 – 04:59", icon: "moon-outline" },
  { value: "morning", label: "Morning", hint: "05:00 – 11:59", icon: "partly-sunny-outline" },
  { value: "afternoon", label: "Afternoon", hint: "12:00 – 17:59", icon: "sunny-outline" },
  { value: "evening", label: "Evening", hint: "18:00 – 23:59", icon: "cloudy-night-outline" },
];

export type StopsFilter = "any" | "direct" | "1stop";

export type FlightFilters = {
  airlines: string[];
  stops: StopsFilter;
  minPrice: string;
  maxPrice: string;
  times: TimeOfDay[];
  baggage: boolean;
  aircraft: string | null;
};

export const emptyFlightFilters: FlightFilters = {
  airlines: [],
  stops: "any",
  minPrice: "",
  maxPrice: "",
  times: [],
  baggage: false,
  aircraft: null,
};

const num = (text: string) => {
  const n = Number(text.replace(",", "."));
  return text.trim() !== "" && Number.isFinite(n) && n >= 0 ? n : undefined;
};

export function toFlightParams(
  base: { from: string; to: string; date: string },
  f: FlightFilters,
  sort: FlightSort,
  toUsd: (amount: number) => number,
): FlightSearchParams {
  const min = num(f.minPrice);
  const max = num(f.maxPrice);
  return {
    ...base,
    airlines: f.airlines.length ? f.airlines.join(",") : undefined,
    stops: f.stops === "any" ? undefined : f.stops,
    minPrice: min === undefined ? undefined : Math.floor(toUsd(min)),
    maxPrice: max === undefined ? undefined : Math.ceil(toUsd(max)),
    times: f.times.length ? f.times.join(",") : undefined,
    baggage: f.baggage ? true : undefined,
    aircraft: f.aircraft ?? undefined,
    sort,
  };
}

export type FilterChip = { key: string; label: string; remove: (f: FlightFilters) => FlightFilters };

export function activeFlightChips(
  f: FlightFilters,
  airlines: AirlineBrand[],
  formatAmount: (amount: number) => string,
  t: (key: string, vars?: Record<string, string | number>) => string,
): FilterChip[] {
  const chips: FilterChip[] = [];

  f.airlines.forEach((slug) =>
    chips.push({
      key: `airline-${slug}`,
      label: airlines.find((a) => a.slug === slug)?.name ?? slug,
      remove: (cur) => ({ ...cur, airlines: cur.airlines.filter((s) => s !== slug) }),
    }),
  );

  if (f.stops !== "any")
    chips.push({
      key: "stops",
      label: t(f.stops === "direct" ? "Direct only" : "1+ stops"),
      remove: (cur) => ({ ...cur, stops: "any" }),
    });

  const min = num(f.minPrice);
  const max = num(f.maxPrice);
  if (min !== undefined || max !== undefined) {
    const label =
      min !== undefined && max !== undefined
        ? `${formatAmount(min)} – ${formatAmount(max)}`
        : min !== undefined
          ? t("From {price}", { price: formatAmount(min) })
          : t("Up to {price}", { price: formatAmount(max!) });
    chips.push({ key: "price", label, remove: (cur) => ({ ...cur, minPrice: "", maxPrice: "" }) });
  }

  f.times.forEach((time) =>
    chips.push({
      key: `time-${time}`,
      label: t(TIMES_OF_DAY.find((x) => x.value === time)?.label ?? time),
      remove: (cur) => ({ ...cur, times: cur.times.filter((x) => x !== time) }),
    }),
  );

  if (f.baggage) chips.push({ key: "bag", label: t("Checked bag"), remove: (cur) => ({ ...cur, baggage: false }) });

  if (f.aircraft)
    chips.push({
      key: "aircraft",
      label: `${t("Aircraft")}: ${f.aircraft.replace(/-/g, " ")}`,
      remove: (cur) => ({ ...cur, aircraft: null }),
    });

  return chips;
}
