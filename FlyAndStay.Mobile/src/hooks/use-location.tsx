import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Location from "expo-location";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { LOCATION_KEY, LOCATION_PROMPTED_KEY } from "@/constants/storage";

export type LocationStatus = "unknown" | "granted" | "denied";

export type UserLocation = { countryCode: string | null; country: string | null; city: string | null };

type LocationContextValue = {
  status: LocationStatus;
  location: UserLocation | null;
  busy: boolean;
  /** Asks for permission (when the OS still allows asking) and refreshes the location. */
  requestLocation: () => Promise<void>;
  /** Asks once per install; later launches refresh silently when access was granted. */
  requestOnce: () => Promise<void>;
};

const LocationContext = createContext<LocationContextValue | null>(null);

// Used when the device has no geocoder (e.g. emulators or phones without Google services).
const FALLBACK_GEOCODER_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

type FallbackPlace = { countryCode?: string; countryName?: string; city?: string; locality?: string };

async function reverseGeocode(latitude: number, longitude: number): Promise<UserLocation | null> {
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (place?.isoCountryCode) {
      return { countryCode: place.isoCountryCode, country: place.country, city: place.city ?? place.subregion };
    }
  } catch {
    // Fall through to the web geocoder.
  }

  const { data } = await axios.get<FallbackPlace>(FALLBACK_GEOCODER_URL, {
    params: { latitude, longitude, localityLanguage: "en" },
    timeout: 10000,
  });
  if (!data.countryCode) return null;
  return { countryCode: data.countryCode, country: data.countryName ?? null, city: data.city || data.locality || null };
}

/**
 * City-level accuracy is enough. A fresh fix can make Android show its "Location Accuracy" dialog,
 * so it is only taken when the user asks for the location; silent refreshes use the last known position.
 */
async function readLocation(allowFreshFix: boolean): Promise<UserLocation | null> {
  let position = null;
  if (allowFreshFix) {
    position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }).catch(() => null);
  }
  position ??= await Location.getLastKnownPositionAsync();
  if (!position) return null;

  return reverseGeocode(position.coords.latitude, position.coords.longitude);
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<LocationStatus>("unknown");
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (prompt: boolean) => {
    setBusy(true);
    try {
      let permission = await Location.getForegroundPermissionsAsync();
      if (!permission.granted && prompt && permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (!permission.granted) {
        setStatus(permission.status === "undetermined" ? "unknown" : "denied");
        setLocation(null);
        await AsyncStorage.removeItem(LOCATION_KEY);
        return;
      }

      setStatus("granted");
      const next = await readLocation(prompt);
      if (next) {
        setLocation(next);
        await AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(next));
      }
    } catch {
      // No GPS fix or the geocoder is unavailable: keep the last known value.
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const permission = await Location.getForegroundPermissionsAsync().catch(() => null);
      if (!permission?.granted) {
        if (permission?.status === "denied") setStatus("denied");
        await AsyncStorage.removeItem(LOCATION_KEY);
        return;
      }

      setStatus("granted");
      const cached = await AsyncStorage.getItem(LOCATION_KEY);
      if (cached) setLocation(JSON.parse(cached) as UserLocation);
      void load(false);
    })();
  }, [load]);

  const requestLocation = useCallback(() => load(true), [load]);

  const requestOnce = useCallback(async () => {
    if (await AsyncStorage.getItem(LOCATION_PROMPTED_KEY)) return;
    await AsyncStorage.setItem(LOCATION_PROMPTED_KEY, "1");
    await load(true);
  }, [load]);

  const value = useMemo<LocationContextValue>(
    () => ({ status, location, busy, requestLocation, requestOnce }),
    [status, location, busy, requestLocation, requestOnce],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used inside <LocationProvider>");
  return ctx;
}
