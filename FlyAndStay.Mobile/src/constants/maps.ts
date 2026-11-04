/**
 * Map providers. Everything here is free and keyless; each value can be swapped for a self-hosted or paid
 * provider through EXPO_PUBLIC_* variables (in `.env`) without touching the code.
 */

/** MapLibre GL JS, the open-source WebGL map renderer, loaded from cdnjs inside the map WebView. */
export const MAPLIBRE_VERSION = "5.6.0";

/**
 * OpenFreeMap vector styles (https://openfreemap.org): free, no API key, no request limits,
 * commercial use allowed. Map data © OpenStreetMap contributors, tiles from OpenMapTiles.
 */
export const MAP_STYLES = {
  light: process.env.EXPO_PUBLIC_MAP_STYLE_LIGHT ?? "https://tiles.openfreemap.org/styles/liberty",
  dark: process.env.EXPO_PUBLIC_MAP_STYLE_DARK ?? "https://tiles.openfreemap.org/styles/dark",
};

/**
 * OSRM-compatible routing endpoint for the airport → hotel route. The default public OSRM server is meant for
 * light use; point this at a self-hosted OSRM in production. Without it the app falls back to an estimate,
 * and turn-by-turn directions always come from the phone's maps app.
 */
export const ROUTING_URL = process.env.EXPO_PUBLIC_ROUTING_URL ?? "https://router.project-osrm.org/route/v1/driving";
