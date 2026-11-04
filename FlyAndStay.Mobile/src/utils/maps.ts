import axios from "axios";
import { Linking, Platform } from "react-native";

import { ROUTING_URL } from "@/constants/maps";

export type LatLng = { latitude: number; longitude: number };
export type Place = LatLng & { label: string };

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export const hasCoords = (p: Partial<LatLng> | null | undefined): p is LatLng =>
  !!p && typeof p.latitude === "number" && typeof p.longitude === "number" && (p.latitude !== 0 || p.longitude !== 0);

/** Straight-line distance between two points, in kilometres. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Points along the great circle between two airports, so a flight path is drawn the way planes actually fly. */
export function greatCircle(a: LatLng, b: LatLng, segments = 64): [number, number][] {
  const lat1 = toRad(a.latitude);
  const lng1 = toRad(a.longitude);
  const lat2 = toRad(b.latitude);
  const lng2 = toRad(b.longitude);
  const d = distanceKm(a, b) / EARTH_RADIUS_KM;
  if (d === 0) return [[a.latitude, a.longitude]];

  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    points.push([toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))]);
  }
  return points;
}

export type DriveEstimate = { distanceKm: number; minutes: number; exact: boolean };

/** Rough car time when no routing service is reachable: roads are ~30% longer than the straight line. */
export function estimateDrive(a: LatLng, b: LatLng): DriveEstimate {
  const road = distanceKm(a, b) * 1.3;
  const speed = road > 15 ? 60 : 30;
  return { distanceKm: road, minutes: Math.round((road / speed) * 60 + 5), exact: false };
}

export type DrivingRoute = DriveEstimate & { path: [number, number][] };

type OsrmResponse = {
  code: string;
  routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
};

/** Real road route with distance and car time; falls back to a straight line and an estimate when offline. */
export async function fetchDrivingRoute(a: LatLng, b: LatLng, signal?: AbortSignal): Promise<DrivingRoute> {
  try {
    const { data } = await axios.get<OsrmResponse>(
      `${ROUTING_URL}/${a.longitude},${a.latitude};${b.longitude},${b.latitude}`,
      { params: { overview: "full", geometries: "geojson" }, timeout: 10000, signal },
    );
    const route = data.routes?.[0];
    if (data.code === "Ok" && route) {
      return {
        distanceKm: route.distance / 1000,
        minutes: Math.max(1, Math.round(route.duration / 60)),
        exact: true,
        path: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      };
    }
  } catch (e) {
    if (signal?.aborted) throw e;
  }
  return { ...estimateDrive(a, b), path: [[a.latitude, a.longitude], [b.latitude, b.longitude]] };
}

export function formatKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString("en-US")} km`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

const googleSearchUrl = (p: Place) => `https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`;

/** Shows the place in the phone's maps app (Google Maps / Apple Maps), or in the browser as a fallback. */
export function openInMaps(p: Place) {
  const label = encodeURIComponent(p.label);
  const url = Platform.select({
    ios: `maps:0,0?q=${label}&ll=${p.latitude},${p.longitude}`,
    android: `geo:${p.latitude},${p.longitude}?q=${p.latitude},${p.longitude}(${label})`,
    default: googleSearchUrl(p),
  });
  Linking.openURL(url).catch(() => Linking.openURL(googleSearchUrl(p)).catch(() => {}));
}

export type TravelMode = "driving" | "transit";

/** Turn-by-turn directions in the maps app. Without `from` the maps app starts from the current location. */
export function openDirections(to: Place, from?: Place | null, mode: TravelMode = "driving") {
  const origin = from ? `&origin=${from.latitude},${from.longitude}` : "";
  const google = `https://www.google.com/maps/dir/?api=1${origin}&destination=${to.latitude},${to.longitude}&travelmode=${mode}`;

  if (Platform.OS === "ios") {
    const saddr = from ? `saddr=${from.latitude},${from.longitude}&` : "";
    const apple = `http://maps.apple.com/?${saddr}daddr=${to.latitude},${to.longitude}&dirflg=${mode === "transit" ? "r" : "d"}`;
    Linking.openURL(apple).catch(() => Linking.openURL(google).catch(() => {}));
    return;
  }
  Linking.openURL(google).catch(() => {});
}
