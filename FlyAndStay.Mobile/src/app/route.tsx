import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/shared/ui/button";
import ScreenHeader from "@/components/shared/ui/screen-header";
import TravelMap, { MapLine, MapMarker } from "@/components/shared/ui/travel-map";
import { ThemeColors } from "@/constants/theme";
import { useLocation } from "@/hooks/use-location";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import { distanceKm, DrivingRoute, fetchDrivingRoute, formatKm, formatMinutes, hasCoords, openDirections, Place } from "@/utils/maps";

// The user's own position is only a sensible start when they are already near the hotel.
const NEARBY_KM = 300;

type Params = {
  toLat: string;
  toLng: string;
  toLabel: string;
  toAddress?: string;
  fromLat?: string;
  fromLng?: string;
  fromLabel?: string;
};

/** Airport (or the user's position) → hotel: the road route, car time, and hand-off to the maps app. */
export default function RouteScreen() {
  const { colors } = useTheme();
  const { t } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const params = useLocalSearchParams<Params>();
  const { location } = useLocation();

  const to: Place = { latitude: Number(params.toLat), longitude: Number(params.toLng), label: params.toLabel };

  let from: (Place & { kind: "airport" | "user" }) | null = null;
  if (params.fromLat && params.fromLng) {
    from = { latitude: Number(params.fromLat), longitude: Number(params.fromLng), label: params.fromLabel ?? "", kind: "airport" };
  } else if (hasCoords(location) && distanceKm(location, to) <= NEARBY_KM) {
    from = { latitude: location.latitude, longitude: location.longitude, label: t("Your location"), kind: "user" };
  }

  const routeKey = from ? `${from.latitude},${from.longitude}>${to.latitude},${to.longitude}` : "";
  const [result, setResult] = useState<{ key: string; route: DrivingRoute } | null>(null);
  const route = result?.key === routeKey ? result.route : null;

  useEffect(() => {
    if (!from) return;
    const controller = new AbortController();
    fetchDrivingRoute(from, to, controller.signal)
      .then((next) => setResult({ key: routeKey, route: next }))
      .catch(() => {});
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);

  const markers: MapMarker[] = [{ id: "to", latitude: to.latitude, longitude: to.longitude, kind: "hotel" }];
  if (from) {
    markers.push(
      from.kind === "user"
        ? { id: "from", latitude: from.latitude, longitude: from.longitude, kind: "user" }
        : {
            id: "from",
            latitude: from.latitude,
            longitude: from.longitude,
            kind: "airport",
            // "Heydar Aliyev Intl (GYD)" → "GYD": the full name is in the panel below, the map only needs the code.
            label: /\(([A-Z]{3})\)$/.exec(from.label)?.[1] ?? from.label,
          },
    );
  }
  const lines: MapLine[] = route ? [{ id: "route", points: route.path, kind: route.exact ? "route" : "arc" }] : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScreenHeader title={t("Getting to your hotel")} subtitle={to.label} />

      <TravelMap markers={markers} lines={lines} style={styles.map} maxZoom={16} />

      <View style={styles.panel}>
        <View style={styles.stops}>
          <View style={styles.rail}>
            <View style={[styles.dot, { backgroundColor: colors.text }]} />
            <View style={styles.railLine} />
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
          </View>
          <View style={{ flex: 1, gap: 14 }}>
            <View>
              <Text style={styles.label}>{t("From")}</Text>
              <Text style={styles.value} numberOfLines={1}>
                {from ? from.label : t("Your current location")}
              </Text>
            </View>
            <View>
              <Text style={styles.label}>{t("To")}</Text>
              <Text style={styles.value} numberOfLines={1}>
                {to.label}
              </Text>
              {!!params.toAddress && <Text style={styles.address}>{params.toAddress}</Text>}
            </View>
          </View>
        </View>

        {from && (
          <View style={styles.stats}>
            <Ionicons name="car-outline" size={20} color={colors.primary} />
            {!route ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.statsText}>
                {route.exact ? "" : "≈ "}
                {formatMinutes(route.minutes)} · {formatKm(route.distanceKm)}
                <Text style={styles.statsHint}>
                  {"  "}
                  {route.exact ? t("by car, without traffic") : t("estimate")}
                </Text>
              </Text>
            )}
          </View>
        )}

        <View style={styles.buttons}>
          <Button
            title={t("Directions")}
            icon="navigate"
            style={styles.button}
            onPress={() => openDirections(to, from?.kind === "airport" ? from : null, "driving")}
          />
          <Button
            title={t("Public transport")}
            icon="bus-outline"
            variant="outline"
            style={styles.button}
            onPress={() => openDirections(to, from?.kind === "airport" ? from : null, "transit")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    map: { flex: 1 },
    panel: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      marginTop: -20,
      padding: 20,
      gap: 16,
      boxShadow: colors.shadowUp,
    },
    stops: { flexDirection: "row", gap: 14 },
    rail: { alignItems: "center", paddingTop: 18, paddingBottom: 18 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    railLine: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 4 },
    label: { fontSize: 11, color: colors.muted },
    value: { fontSize: 15, fontWeight: "700", color: colors.text, marginTop: 1 },
    address: { fontSize: 12, color: colors.muted, marginTop: 1 },
    stats: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.primarySoft, borderRadius: 14, padding: 12 },
    statsText: { flex: 1, fontSize: 15, fontWeight: "800", color: colors.text },
    statsHint: { fontSize: 12, fontWeight: "400", color: colors.muted },
    buttons: { flexDirection: "row", gap: 10 },
    button: { flex: 1 },
  });
