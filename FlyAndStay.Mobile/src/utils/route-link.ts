import { Href } from "expo-router";

import { Airport } from "@/api/types";
import { hasCoords, LatLng } from "@/utils/maps";

type HotelPlace = LatLng & { name: string; address?: string };

const normalize = (value: string) => value.trim().toLowerCase();

/** The airport that serves a city (our catalog has one per city). */
export function airportForCity(airports: Airport[], city: string): Airport | null {
  return airports.find((a) => normalize(a.city) === normalize(city) && hasCoords(a)) ?? null;
}

/** Link to the "Getting to your hotel" screen; without an airport it starts from the user's location. */
export function hotelRouteHref(hotel: HotelPlace, from?: Airport | null): Href {
  const params: Record<string, string> = {
    toLat: String(hotel.latitude),
    toLng: String(hotel.longitude),
    toLabel: hotel.name,
  };
  if (hotel.address) params.toAddress = hotel.address;
  if (from && hasCoords(from)) {
    params.fromLat = String(from.latitude);
    params.fromLng = String(from.longitude);
    params.fromLabel = `${from.name} (${from.code})`;
  }
  return { pathname: "/route", params } as Href;
}
