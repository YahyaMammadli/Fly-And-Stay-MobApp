import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HotelDetails } from "@/api/types";
import Button from "@/components/shared/ui/button";
import TravelMap, { MapMarker } from "@/components/shared/ui/travel-map";
import { ThemeColors } from "@/constants/theme";
import { useAirports } from "@/hooks/use-airports";
import { useLocation } from "@/hooks/use-location";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import { distanceKm, estimateDrive, formatKm, formatMinutes, hasCoords, openInMaps } from "@/utils/maps";
import { airportForCity, hotelRouteHref } from "@/utils/route-link";

// "X km from you" only helps when the user is already in the city.
const NEARBY_KM = 100;

type IconName = ComponentProps<typeof Ionicons>["name"];

/** Hotel page "Location" block: mini-map, distances to the airport / the user, and links to the maps app. */
export default function HotelLocation({ hotel }: { hotel: HotelDetails }) {
  const { colors } = useTheme();
  const { t } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const airports = useAirports();
  const { location } = useLocation();

  if (!hasCoords(hotel)) return null;

  const airport = airportForCity(airports, hotel.city);
  const drive = airport ? estimateDrive(airport, hotel) : null;
  const userKm = hasCoords(location) ? distanceKm(location, hotel) : null;
  const userNearby = userKm != null && userKm <= NEARBY_KM;

  const markers: MapMarker[] = [{ id: "hotel", latitude: hotel.latitude, longitude: hotel.longitude, kind: "hotel" }];
  if (userNearby && hasCoords(location)) {
    markers.push({ id: "me", latitude: location.latitude, longitude: location.longitude, kind: "user" });
  }

  const openRoute = () => router.push(hotelRouteHref(hotel, airport));
  const openMaps = () => openInMaps({ latitude: hotel.latitude, longitude: hotel.longitude, label: hotel.name });

  const rows: { icon: IconName; text: string; onPress?: () => void }[] = [
    { icon: "location-outline", text: `${hotel.address} · ${t("{distance} km from center", { distance: hotel.distanceToCenterKm })}` },
  ];
  if (airport && drive) {
    rows.push({
      icon: "airplane-outline",
      text: t("{distance} from {airport} · ≈ {time} by car", {
        distance: formatKm(drive.distanceKm),
        airport: airport.code,
        time: formatMinutes(drive.minutes),
      }),
      onPress: openRoute,
    });
  }
  if (userNearby && userKm != null) {
    rows.push({ icon: "navigate-outline", text: t("{distance} from you", { distance: formatKm(userKm) }) });
  }

  return (
    <View>
      <Text style={styles.section}>{t("Hotel location")}</Text>
      <TravelMap markers={markers} interactive={false} onPress={airport ? openRoute : openMaps} style={styles.map} maxZoom={14} />

      <View style={styles.rows}>
        {rows.map((row) => (
          <Pressable key={row.icon} style={styles.row} onPress={row.onPress} disabled={!row.onPress}>
            <Ionicons name={row.icon} size={16} color={colors.primary} />
            <Text style={styles.rowText}>{row.text}</Text>
            {row.onPress && <Ionicons name="chevron-forward" size={14} color={colors.muted} />}
          </Pressable>
        ))}
      </View>

      <View style={styles.buttons}>
        <Button title={t("Open in Maps")} icon="map-outline" variant="outline" style={styles.button} onPress={openMaps} />
        {airport && (
          <Button title={t("Route from airport")} icon="car-outline" variant="outline" style={styles.button} onPress={openRoute} />
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    section: { fontSize: 17, fontWeight: "800", color: colors.text, marginTop: 24, marginBottom: 12 },
    map: { height: 170, borderRadius: 20 },
    rows: { gap: 10, marginTop: 14 },
    row: { flexDirection: "row", alignItems: "center", gap: 10 },
    rowText: { flex: 1, fontSize: 13, color: colors.text },
    buttons: { flexDirection: "row", gap: 10, marginTop: 14 },
    button: { flex: 1, height: 44 },
  });
