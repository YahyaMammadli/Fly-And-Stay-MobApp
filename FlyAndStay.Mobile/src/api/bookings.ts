import { api } from "./client";
import { Booking } from "./types";

export type CreateBookingBody = {
  flightId?: number;
  roomId?: number;
  checkIn?: string;
  checkOut?: string;
  passengers: number;
  guests: number;
};

export const bookingsApi = {
  create: (body: CreateBookingBody) => api.post<Booking>("/api/bookings", body).then((r) => r.data),
  get: (id: string, signal?: AbortSignal) => api.get<Booking>(`/api/bookings/${id}`, { signal }).then((r) => r.data),
  mine: (signal?: AbortSignal) => api.get<Booking[]>("/api/bookings", { signal }).then((r) => r.data),
  cancel: (id: string) => api.post<Booking>(`/api/bookings/${id}/cancel`).then((r) => r.data),
};
