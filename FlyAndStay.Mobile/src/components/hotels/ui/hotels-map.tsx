import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { HotelSummary } from "@/api/types";
import TravelMap, { MapMarker } from "@/components/shared/ui/travel-map";
import { ThemeColors } from "@/constants/theme";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import { hasCoords } from "@/utils/maps";
import HotelCard from "./hotel-card";

type Props = {
  hotels: HotelSummary[];
  loading: boolean;
  onOpen: (hotel: HotelSummary) => void;
};

/** Hotels as price tags on a map; tapping a tag shows the hotel card, tapping the card opens the hotel. */
export default function HotelsMap({ hotels, loading, onOpen }: Props) {
  const { colors } = useTheme();
  const { t, formatMoney } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const located = hotels.filter(hasCoords);
  const selected = located.find((h) => h.slug === selectedSlug) ?? null;

  const markers: MapMarker[] = located.map((h) => ({
    id: h.slug,
    latitude: h.latitude,
    longitude: h.longitude,
    kind: "price",
    label: formatMoney(h.pricePerNight),
    active: h.slug === selected?.slug,
  }));

  return (
    <View style={styles.wrap}>
      <TravelMap
        markers={markers}
        style={StyleSheet.absoluteFill}
        focusId={selected?.slug}
        padding={{ bottom: 40 }}
        maxZoom={15}
        onMarkerPress={(slug) => setSelectedSlug(slug)}
        onMapPress={() => setSelectedSlug(null)}
      />

      {loading && (
        <View style={styles.badge}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
      {!loading && located.length === 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t("No hotels found")}</Text>
        </View>
      )}

      {selected ? (
        <View style={styles.card}>
          <HotelCard hotel={selected} onPress={() => onOpen(selected)} />
        </View>
      ) : (
        !loading &&
        located.length > 0 && (
          <View style={styles.hint}>
            <Text style={styles.hintText}>{t("Tap a price to see the hotel")}</Text>
          </View>
        )
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { flex: 1, overflow: "hidden", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
    badge: {
      position: "absolute",
      top: 14,
      alignSelf: "center",
      paddingHorizontal: 14,
      height: 34,
      borderRadius: 17,
      justifyContent: "center",
      backgroundColor: colors.card,
      boxShadow: colors.shadow,
    },
    badgeText: { fontSize: 12, fontWeight: "700", color: colors.text },
    card: { position: "absolute", left: 20, right: 20, bottom: 16 },
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
