import { Ionicons } from "@expo/vector-icons";
import { ComponentType, Ref, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { WebView, WebViewMessageEvent, WebViewProps } from "react-native-webview";

import { MAP_STYLES, MAPLIBRE_VERSION } from "@/constants/maps";
import { ThemeColors } from "@/constants/theme";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";

export type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  /** hotel / airport: round pins; user: blue dot; price: a pill with `label` (price tags on the hotels and explore maps). */
  kind: "hotel" | "airport" | "user" | "price";
  label?: string;
  active?: boolean;
  muted?: boolean;
};

export type MapLine = {
  id: string;
  /** [latitude, longitude] pairs */
  points: [number, number][];
  /** route: solid road line; arc: dashed flight path */
  kind: "route" | "arc";
};

type Props = {
  markers: MapMarker[];
  lines?: MapLine[];
  /** false: a static preview that doesn't steal scroll gestures (use onPress to open something bigger). */
  interactive?: boolean;
  onPress?: () => void;
  onMarkerPress?: (id: string) => void;
  onMapPress?: () => void;
  /** Pans to this marker without changing the zoom (e.g. the selected hotel). */
  focusId?: string | null;
  /** Extra space kept free around the markers when fitting, e.g. under a bottom card. */
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
  maxZoom?: number;
  style?: StyleProp<ViewStyle>;
};

// The package's class typings default their generic to `undefined`, which collapses the props to `never`.
type WebViewHandle = { injectJavaScript: (script: string) => void };
const MapWebView = WebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebViewHandle> }>;

const PLANE =
  '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>';
const BED =
  '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg>';
const PIN_PATH = "M17 42.5S3 27 3 17a14 14 0 0 1 28 0c0 10-14 25.5-14 25.5z";

const CDN = `https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/${MAPLIBRE_VERSION}`;

function buildHtml(colors: ThemeColors, isDark: boolean, interactive: boolean, language: string) {
  const hotelFill = colors.primary;
  const airportFill = isDark ? "#F2F5FA" : "#0F1B33";
  const airportIcon = isDark ? "#0F1B33" : "#FFFFFF";
  const pinStroke = isDark ? "#0B1220" : "#FFFFFF";
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="${CDN}/maplibre-gl.min.css">
<style>
  html, body, #map { margin: 0; height: 100%; background: ${colors.background}; }
  body { -webkit-tap-highlight-color: transparent; font-family: -apple-system, Roboto, sans-serif; }
  .maplibregl-ctrl-attrib { font-size: 9px; background: ${isDark ? "rgba(11,18,32,0.7)" : "rgba(255,255,255,0.75)"} !important; }
  .maplibregl-ctrl-attrib a, .maplibregl-ctrl-attrib-inner { color: ${colors.muted} !important; }
  .maplibregl-ctrl-bottom-right .maplibregl-ctrl { margin: 0; }
  /* MapLibre positions markers absolutely; their own styles must not override "position". */
  .pin { width: 34px; height: 44px; cursor: pointer; filter: drop-shadow(0 3px 4px rgba(0,0,0,0.3)); }
  .pin svg.shape { position: absolute; left: 0; top: 0; }
  .pin .icon { position: absolute; left: 9px; top: 8px; width: 16px; height: 16px; }
  .tag { position: absolute; top: 46px; left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 11px; font-weight: 800;
         color: ${colors.text}; text-shadow: 0 0 3px ${colors.background}, 0 0 3px ${colors.background}, 0 0 3px ${colors.background}; }
  .pill { padding: 5px 9px; border-radius: 14px; white-space: nowrap; font-size: 12px; font-weight: 800; cursor: pointer;
          background: ${colors.card}; color: ${colors.text}; box-shadow: 0 3px 10px rgba(0,0,0,0.22); border: 1px solid ${colors.border}; }
  .pill:after { content: ""; position: absolute; left: 50%; bottom: -5px; margin-left: -5px; border: 5px solid transparent; border-bottom: 0; border-top-color: ${colors.card}; }
  .pill.active { background: ${colors.primary}; color: #FFFFFF; border-color: ${colors.primary}; transform: scale(1.12); }
  .pill.active:after { border-top-color: ${colors.primary}; }
  .pill.muted { color: ${colors.muted}; font-weight: 600; }
  .user { width: 16px; height: 16px; border-radius: 8px; background: #1A73E8; border: 3px solid #FFFFFF; box-shadow: 0 0 0 6px rgba(26,115,232,0.25); }
</style>
</head><body><div id="map"></div>
<script>
  function post(msg) { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(msg)); }
  window.onerror = function () { post({ type: "error" }); };
</script>
<script src="${CDN}/maplibre-gl.min.js" onerror="post({ type: 'error' })"></script>
<script>
  var LANG = ${JSON.stringify(language)};
  var map;
  try {
    map = new maplibregl.Map({
      container: "map",
      style: ${JSON.stringify(isDark ? MAP_STYLES.dark : MAP_STYLES.light)},
      center: [20, 30], zoom: 1.5,
      interactive: ${interactive},
      dragRotate: false, pitchWithRotate: false, touchPitch: false,
      attributionControl: { compact: false },
      fadeDuration: 0,
    });
    if (${interactive}) map.touchZoomRotate.disableRotation();
  } catch (e) {
    // No WebGL or no network for the library.
    post({ type: "error" });
  }

  // Show place names in the app language where OpenStreetMap has them (name:ru, name:az, ...).
  function localizeLabels() {
    map.getStyle().layers.forEach(function (layer) {
      var field = layer.layout && layer.layout["text-field"];
      if (field && JSON.stringify(field).indexOf('"name') >= 0) {
        map.setLayoutProperty(layer.id, "text-field", ["coalesce", ["get", "name:" + LANG], ["get", "name_en"], ["get", "name"]]);
      }
    });
  }

  var markers = [];
  var byId = {};
  var lastFit = "";

  function esc(s) { return String(s || "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function markerElement(m) {
    var el = document.createElement("div");
    if (m.kind === "user") {
      el.className = "user";
    } else if (m.kind === "price") {
      el.className = "pill" + (m.active ? " active" : "") + (m.muted ? " muted" : "");
      el.textContent = m.label || "";
    } else {
      var airport = m.kind === "airport";
      el.className = "pin";
      el.style.color = airport ? "${airportIcon}" : "${pinStroke}";
      el.innerHTML =
        '<svg class="shape" width="34" height="44" viewBox="0 0 34 44"><path d="${PIN_PATH}" fill="' + (airport ? "${airportFill}" : "${hotelFill}") +
        '" stroke="${pinStroke}" stroke-width="2"/></svg><div class="icon">' + (airport ? '${PLANE}' : '${BED}') + "</div>" +
        (m.label ? '<div class="tag">' + esc(m.label) + "</div>" : "");
    }
    // Selected first, then priced tags, then the rest, so cheap fares are never hidden under "no flights" tags.
    el.style.zIndex = m.active ? 4 : m.kind === "user" ? 3 : m.muted ? 1 : 2;
    el.addEventListener("click", function (e) { e.stopPropagation(); post({ type: "marker", id: m.id }); });
    return el;
  }

  window.__setData = function (data) {
    markers.forEach(function (mk) { mk.remove(); });
    markers = [];
    byId = {};

    data.markers.forEach(function (m) {
      var mk = new maplibregl.Marker({
        element: markerElement(m),
        anchor: m.kind === "user" ? "center" : "bottom",
        offset: m.kind === "price" ? [0, -5] : [0, 0],
      }).setLngLat([m.longitude, m.latitude]).addTo(map);
      markers.push(mk);
      byId[m.id] = mk;
    });

    map.getSource("lines").setData({
      type: "FeatureCollection",
      features: (data.lines || []).map(function (l) {
        return { type: "Feature", properties: { kind: l.kind },
          geometry: { type: "LineString", coordinates: l.points.map(function (p) { return [p[1], p[0]]; }) } };
      }),
    });

    var pts = data.markers.map(function (m) { return [m.latitude, m.longitude]; });
    (data.lines || []).forEach(function (l) { pts = pts.concat(l.points); });
    var key = JSON.stringify(pts.map(function (p) { return [p[0].toFixed(4), p[1].toFixed(4)]; }));
    if (pts.length && key !== lastFit) {
      lastFit = key;
      var maxZoom = data.maxZoom || 15;
      if (pts.length === 1) {
        map.jumpTo({ center: [pts[0][1], pts[0][0]], zoom: Math.min(maxZoom, 15) });
      } else {
        var bounds = new maplibregl.LngLatBounds();
        pts.forEach(function (p) { bounds.extend([p[1], p[0]]); });
        var pad = data.padding || {};
        map.fitBounds(bounds, {
          padding: { top: (pad.top || 0) + 50, bottom: (pad.bottom || 0) + 24, left: (pad.left || 0) + 40, right: (pad.right || 0) + 40 },
          maxZoom: maxZoom, animate: false,
        });
      }
    }
    if (data.focusId && byId[data.focusId]) map.easeTo({ center: byId[data.focusId].getLngLat(), duration: 300 });
  };

  if (map) {
    map.on("click", function () { post({ type: "map" }); });
    map.on("load", function () {
      localizeLabels();
      map.addSource("lines", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({ id: "route", type: "line", source: "lines", filter: ["==", ["get", "kind"], "route"],
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "${colors.primary}", "line-width": 5, "line-opacity": 0.85 } });
      map.addLayer({ id: "arc", type: "line", source: "lines", filter: ["==", ["get", "kind"], "arc"],
        layout: { "line-cap": "round" },
        paint: { "line-color": "${colors.primary}", "line-width": 2.5, "line-dasharray": [2, 2.5] } });
      post({ type: "ready" });
    });
  }
</script>
</body></html>`;
}

/**
 * Map view: MapLibre GL (open-source WebGL renderer) with OpenFreeMap vector tiles in a WebView.
 * No API keys, works on Android, iOS and in Expo Go, follows the app theme and language.
 */
export default function TravelMap({
  markers,
  lines,
  interactive = true,
  onPress,
  onMarkerPress,
  onMapPress,
  focusId,
  padding,
  maxZoom,
  style,
}: Props) {
  const { colors, isDark } = useTheme();
  const { t, language } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const webView = useRef<WebViewHandle>(null);
  const html = useMemo(() => buildHtml(colors, isDark, interactive, language), [colors, isDark, interactive, language]);
  // Keyed by page: a new theme rebuilds the page, which has to report ready again.
  const [readyPage, setReadyPage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const ready = readyPage === html;
  const payload = JSON.stringify({ markers, lines: lines ?? [], focusId: focusId ?? null, padding: padding ?? {}, maxZoom });

  useEffect(() => {
    if (ready) webView.current?.injectJavaScript(`window.__setData(${payload}); true;`);
  }, [ready, payload]);

  const onMessage = (e: WebViewMessageEvent) => {
    let msg: { type: string; id?: string };
    try {
      msg = JSON.parse(e.nativeEvent.data);
    } catch {
      return;
    }
    if (msg.type === "ready") setReadyPage(html);
    else if (msg.type === "error") setFailed(true);
    else if (msg.type === "marker" && msg.id) onMarkerPress?.(msg.id);
    else if (msg.type === "map") onMapPress?.();
  };

  return (
    <View style={[styles.wrap, style]}>
      {failed ? (
        <View style={styles.fallback}>
          <Ionicons name="map-outline" size={28} color={colors.muted} />
          <Text style={styles.fallbackText}>{t("The map needs an internet connection.")}</Text>
        </View>
      ) : (
        <View style={StyleSheet.absoluteFill} pointerEvents={interactive ? "auto" : "none"}>
          <MapWebView
            ref={webView}
            source={{ html, baseUrl: "https://flyandstay.app/" }}
            originWhitelist={["*"]}
            onMessage={onMessage}
            onError={() => setFailed(true)}
            scrollEnabled={false}
            overScrollMode="never"
            bounces={false}
            setSupportMultipleWindows={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            style={[styles.web, { opacity: ready ? 1 : 0 }]}
          />
          {!ready && (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
        </View>
      )}
      {!interactive && onPress && <Pressable style={StyleSheet.absoluteFill} onPress={onPress} />}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { overflow: "hidden", backgroundColor: colors.primarySoft },
    web: { flex: 1, backgroundColor: colors.background },
    loading: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" },
    fallback: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 16 },
    fallbackText: { fontSize: 12, color: colors.muted, textAlign: "center" },
  });
