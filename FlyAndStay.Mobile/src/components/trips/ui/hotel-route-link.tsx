import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";

import { Booking } from "@/api/types";
import { ThemeColors } from "@/constants/theme";
import { useAirports } from "@/hooks/use-airports";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import { estimateDrive, formatKm, formatMinutes, hasCoords } from "@/utils/maps";
import { airportForCity, hotelRouteHref } from "@/utils/route-link";

type Props = { booking: Booking; style?: StyleProp<ViewStyle> };

/** "Getting to your hotel" shortcut for a booking with a stay: airport → hotel distance, car time, route screen. */
export default function HotelRouteLink({ booking, style }: Props) {
  const { colors } = useTheme();
  const { t } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const airports = useAirports();
  const { flight, stay } = booking;

  if (!stay || !hasCoords(stay)) return null;

  // Prefer the airport the booked flight lands at; otherwise the airport of the hotel's city.
  const arrival = flight && hasCoords(flight.to) && flight.to.city === stay.city ? flight.to : null;
  const airport = arrival ?? airportForCity(airports, stay.city);
  const drive = airport ? estimateDrive(airport, stay) : null;

  const open = () =>
    router.push(
      hotelRouteHref({ name: stay.hotelName, address: stay.address, latitude: stay.latitude, longitude: stay.longitude }, airport),
    );

  return (
    <Pressable style={({ pressed }) => [styles.route, pressed && { opacity: 0.8 }, style]} onPress={open}>
      <View style={styles.icon}>
        <Ionicons name="navigate" size={16} color={colors.white} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{t("Getting to your hotel")}</Text>
        <Text style={styles.sub}>
          {airport && drive
            ? t("{distance} from {airport} · ≈ {time} by car", {
                distance: formatKm(drive.distanceKm),
                airport: airport.code,
                time: formatMinutes(drive.minutes),
              })
            : t("Directions from your location")}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    route: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.primarySoft, borderRadius: 14, padding: 12 },
    icon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 14, fontWeight: "700", color: colors.text },
    sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  });
