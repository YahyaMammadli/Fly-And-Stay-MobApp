import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HotelSummary } from "@/api/types";
import { ThemeColors } from "@/constants/theme";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import HotelCover from "./hotel-cover";

type Props = { hotel: HotelSummary; onPress: () => void };

export const AMENITY_ICONS: Record<string, ComponentProps<typeof Ionicons>["name"]> = {
  wifi: "wifi",
  pool: "water",
  gym: "barbell",
  restaurant: "restaurant",
  parking: "car",
  spa: "flower",
  breakfast: "cafe",
  shuttle: "bus",
};

export default function HotelCard({ hotel, onPress }: Props) {
  const { colors } = useTheme();
  const { t, formatMoney } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]} onPress={onPress}>
      <HotelCover imageUrl={hotel.imageUrl} color={hotel.coverColor} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {hotel.name}
        </Text>
        <View style={styles.ratingRow}>
          <Text style={styles.stars}>{"★".repeat(hotel.stars)}</Text>
          <Text style={styles.rating}>{hotel.rating.toFixed(1)}</Text>
          <Text style={styles.reviews}>({hotel.reviewCount.toLocaleString("en-US")} reviews)</Text>
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={12} color={colors.error} />
          <Text style={styles.location} numberOfLines={1}>
            {hotel.district}, {hotel.distanceToCenterKm} km from center
          </Text>
        </View>
        <View style={styles.amenities}>
          {hotel.amenities.slice(0, 4).map((code) => (
            <Ionicons key={code} name={AMENITY_ICONS[code] ?? "checkmark"} size={13} color={colors.muted} />
          ))}
        </View>
        <View style={styles.bottom}>
          <Text style={styles.price}>
            {formatMoney(hotel.pricePerNight)}
            <Text style={styles.night}>{t(" /night")}</Text>
          </Text>
          <View style={styles.view}>
            <Text style={styles.viewText}>{t("View details")}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      gap: 12,
      borderRadius: 20,
      padding: 10,
      backgroundColor: colors.card,
      boxShadow: colors.shadow,
    },
    image: { width: 104, borderRadius: 14, minHeight: 128 },
    body: { flex: 1 },
    name: { fontSize: 14, fontWeight: "800", color: colors.text },
    ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
    stars: { color: colors.star, fontSize: 11 },
    rating: { fontSize: 11, fontWeight: "700", color: colors.text },
    reviews: { fontSize: 10, color: colors.muted },
    locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
    location: { fontSize: 11, color: colors.muted, flexShrink: 1 },
    amenities: { flexDirection: "row", gap: 8, marginTop: 6 },
    bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 8 },
    price: { fontSize: 17, fontWeight: "800", color: colors.text },
    night: { fontSize: 10, fontWeight: "400", color: colors.muted },
    view: { height: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: colors.primary, justifyContent: "center" },
    viewText: { color: colors.white, fontSize: 11, fontWeight: "700" },
  });
