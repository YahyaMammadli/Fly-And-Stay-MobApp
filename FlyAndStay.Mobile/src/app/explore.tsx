import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { travelApi } from "@/api/travel";
import { Airport, Destination } from "@/api/types";
import AirportPicker from "@/components/home/ui/airport-picker";
import Button from "@/components/shared/ui/button";
import ScreenHeader from "@/components/shared/ui/screen-header";
import TravelMap, { MapLine, MapMarker } from "@/components/shared/ui/travel-map";
import { ThemeColors } from "@/constants/theme";
import { useAirports } from "@/hooks/use-airports";
import { useFetch } from "@/hooks/use-fetch";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import { useTrip } from "@/hooks/use-trip";
import { distanceKm, formatKm, greatCircle, hasCoords } from "@/utils/maps";

// The API quotes prices from Baku when no origin is chosen.
const DEFAULT_ORIGIN = "GYD";

/** "Where can I fly?": every destination on a map with the cheapest fare from the chosen origin. */
export default function ExploreScreen() {
  const { colors } = useTheme();
  const { t, formatMoney } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const airports = useAirports();
  const { search, updateSearch } = useTrip();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const origin: Airport | null = search.from ?? airports.find((a) => a.code === DEFAULT_ORIGIN) ?? null;
  const originCode = origin?.code ?? null;
  const { data } = useFetch((signal) => travelApi.destinations(originCode, signal), [originCode]);

  const destinations = (data ?? []).filter(hasCoords);
  const selected = destinations.find((d) => d.airportCode === selectedCode) ?? null;

  const markers: MapMarker[] = destinations.map((d) => ({
    id: d.airportCode,
    latitude: d.latitude,
    longitude: d.longitude,
    kind: "price",
    label: d.fromPrice != null ? `${d.city} · ${formatMoney(d.fromPrice)}` : d.city,
    active: d.airportCode === selected?.airportCode,
    muted: d.fromPrice == null,
  }));
  if (origin && hasCoords(origin)) {
    markers.push({ id: "origin", latitude: origin.latitude, longitude: origin.longitude, kind: "airport", label: origin.code });
  }
  const lines: MapLine[] =
    origin && hasCoords(origin) && selected ? [{ id: "arc", kind: "arc", points: greatCircle(origin, selected) }] : [];

  const toAirport = (d: Destination): Airport => ({
    code: d.airportCode,
    city: d.city,
    country: d.country,
    name: d.airportName,
    latitude: d.latitude,
    longitude: d.longitude,
  });

  const findFlights = (d: Destination) => {
    updateSearch({ from: origin, to: toAirport(d) });
    router.navigate("/flights");
  };

  const findHotels = (d: Destination) => {
    updateSearch({ destination: d.city });
    router.navigate("/hotels");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScreenHeader
        title={t("Explore")}
        subtitle={origin ? t("Prices from {city}", { city: origin.city }) : undefined}
        right={
          <Pressable style={styles.origin} onPress={() => setPickerOpen(true)} hitSlop={6}>
            <Ionicons name="airplane" size={14} color={colors.primary} />
            <Text style={styles.originText}>{origin?.code ?? t("From")}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.primary} />
          </Pressable>
        }
      />

      <View style={styles.mapWrap}>
        <TravelMap
          markers={markers}
          lines={lines}
          style={StyleSheet.absoluteFill}
          padding={{ bottom: 60 }}
          maxZoom={6}
          onMarkerPress={(code) => code !== "origin" && setSelectedCode(code)}
          onMapPress={() => setSelectedCode(null)}
        />

        {selected ? (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={[styles.cover, { backgroundColor: selected.color }]}>
                <Ionicons name={selected.icon as ComponentProps<typeof Ionicons>["name"]} size={26} color="rgba(255,255,255,0.9)" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.city}>{selected.city}</Text>
                <Text style={styles.sub} numberOfLines={1}>
                  {selected.country} · {selected.airportName}
                </Text>
                {origin && hasCoords(origin) && (
                  <Text style={styles.sub}>{t("{distance} from {city}", { distance: formatKm(distanceKm(origin, selected)), city: origin.city })}</Text>
                )}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.priceLabel}>{t("From")}</Text>
                <Text style={styles.price}>{selected.fromPrice != null ? formatMoney(selected.fromPrice) : "—"}</Text>
              </View>
            </View>
            <View style={styles.buttons}>
              <Button
                title={t("Find flights")}
                icon="airplane"
                style={styles.button}
                disabled={selected.fromPrice == null}
                onPress={() => findFlights(selected)}
              />
              <Button title={t("Hotels")} icon="bed-outline" variant="outline" style={styles.button} onPress={() => findHotels(selected)} />
            </View>
          </View>
        ) : (
          <View style={styles.hint}>
            <Text style={styles.hintText}>{t("Tap a city to see the cheapest fare")}</Text>
          </View>
        )}
      </View>

      <AirportPicker
        visible={pickerOpen}
        title={t("Flying from")}
        onSelect={(airport) => {
          updateSearch({ from: airport });
          setSelectedCode(null);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    origin: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primarySoft,
    },
    originText: { fontSize: 13, fontWeight: "800", color: colors.primary },
    mapWrap: { flex: 1, overflow: "hidden", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    card: {
      position: "absolute",
      left: 20,
      right: 20,
      bottom: 16,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 14,
      gap: 12,
      boxShadow: colors.shadowStrong,
    },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
    cover: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    city: { fontSize: 16, fontWeight: "800", color: colors.text },
    sub: { fontSize: 12, color: colors.muted, marginTop: 1 },
    priceLabel: { fontSize: 11, color: colors.muted },
    price: { fontSize: 18, fontWeight: "800", color: colors.text },
    buttons: { flexDirection: "row", gap: 10 },
    button: { flex: 1, height: 44 },
    hint: {
      position: "absolute",
      bottom: 16,
      alignSelf: "center",
      paddingHorizontal: 14,
      height: 34,
      borderRadius: 17,
      justifyContent: "center",
      backgroundColor: colors.card,
      boxShadow: colors.shadow,
    },
    hintText: { fontSize: 12, fontWeight: "600", color: colors.muted },
  });
