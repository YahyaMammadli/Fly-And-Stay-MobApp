import { api } from "./client";
import {
  AircraftModel,

  AirlineBrand,
  Airport,
  Amenity,
  CalendarDay,
  Destination,
  Flight,
  HotelDetails,
  HotelSummary,
} from "./types";

export type FlightSearchParams = {
  from: string;
  to: string;
  date: string;
  airlines?: string;
  stops?: string;
  minPrice?: number;
  maxPrice?: number;
  times?: string;
  baggage?: boolean;
  aircraft?: string;
  sort?: string;
};

export type HotelSearchParams = {
  city: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  stars?: string;
  amenities?: string;
  maxDistance?: number;
  guests?: number;
  sort?: string;
};

export const travelApi = {
  airports: (signal?: AbortSignal) => api.get<Airport[]>("/api/airports", { signal }).then((r) => r.data),
  destinations: (from: string | null, signal?: AbortSignal) =>
    api.get<Destination[]>("/api/destinations", { params: from ? { from } : undefined, signal }).then((r) => r.data),

  airlines: (signal?: AbortSignal) => api.get<AirlineBrand[]>("/api/airlines", { signal }).then((r) => r.data),
  aircraft: (slug: string, signal?: AbortSignal) =>
    api.get<AircraftModel[]>(`/api/airlines/${slug}/aircraft`, { signal }).then((r) => r.data),

  searchFlights: (params: FlightSearchParams, signal?: AbortSignal) =>
    api.get<Flight[]>("/api/flights/search", { params, signal }).then((r) => r.data),
  flightCalendar: (params: { from: string; to: string; start: string; days: number }, signal?: AbortSignal) =>
    api.get<CalendarDay[]>("/api/flights/calendar", { params, signal }).then((r) => r.data),
  flight: (id: number, signal?: AbortSignal) => api.get<Flight>(`/api/flights/${id}`, { signal }).then((r) => r.data),

  searchHotels: (params: HotelSearchParams, signal?: AbortSignal) =>
    api.get<HotelSummary[]>("/api/hotels", { params, signal }).then((r) => r.data),
  amenities: (signal?: AbortSignal) => api.get<Amenity[]>("/api/hotels/amenities", { signal }).then((r) => r.data),
  hotel: (slug: string, signal?: AbortSignal) =>
    api.get<HotelDetails>(`/api/hotels/${slug}`, { signal }).then((r) => r.data),
};
