import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { travelApi } from "@/api/travel";
import { Room } from "@/api/types";
import HotelCover from "@/components/hotels/ui/hotel-cover";
import { AMENITY_ICONS } from "@/components/hotels/ui/hotel-card";
import Button from "@/components/shared/ui/button";
import ScreenHeader from "@/components/shared/ui/screen-header";
import { ThemeColors } from "@/constants/theme";
import { useFetch } from "@/hooks/use-fetch";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import { useTrip } from "@/hooks/use-trip";
import { diffDays, formatRange, plural } from "@/utils/dates";

const TABS = [
  { type: "Standard", label: "Standard Room" },
  { type: "Deluxe", label: "Deluxe Room" },
  { type: "Suite", label: "Suite" },
];

export default function HotelDetailsScreen() {
  const { colors } = useTheme();
  const { t, formatMoney } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { search, setStay } = useTrip();
  const [tab, setTab] = useState("Standard");

  const { data: hotel, loading, error, reload } = useFetch((signal) => travelApi.hotel(slug, signal), [slug]);

  const nights = Math.max(1, diffDays(search.checkIn, search.checkOut));
  const rooms = hotel?.rooms.filter((r) => r.type === tab) ?? [];

  const select = (room: Room) => {
    if (!hotel) return;
    setStay(hotel, room);
    router.push("/booking/summary");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title={hotel?.name ?? "Hotel"} fallbackHref="/hotels" />

      {loading && !hotel ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error || !hotel ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={36} color={colors.muted} />
          <Text style={styles.muted}>{error ?? "Hotel not found."}</Text>
          <Button title={t("Try again")} variant="outline" onPress={reload} style={{ marginTop: 12 }} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <HotelCover imageUrl={hotel.imageUrl} color={hotel.coverColor} style={styles.cover} iconSize={56} />

          <Text style={styles.name}>{hotel.name}</Text>
          <View style={styles.row}>
            <Text style={styles.stars}>{"★".repeat(hotel.stars)}</Text>
            <Text style={styles.rating}>{hotel.rating.toFixed(1)}</Text>
            <Text style={styles.muted}>({hotel.reviewCount.toLocaleString("en-US")} reviews)</Text>
          </View>
          <View style={[styles.row, { marginTop: 6 }]}>
            <Ionicons name="location" size={14} color={colors.error} />
            <Text style={styles.muted}>
              {hotel.district}, {hotel.city} · {hotel.distanceToCenterKm} km from center
            </Text>
          </View>

          <View style={styles.amenities}>
            {hotel.amenities.map((a) => (
              <View key={a.code} style={styles.amenity}>
                <Ionicons name={AMENITY_ICONS[a.code] ?? "checkmark"} size={16} color={colors.primary} />
                <Text style={styles.amenityText}>{a.name}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.description}>{hotel.description}</Text>

          <Text style={styles.section}>{t("Room options")}</Text>
          <Text style={styles.stay}>
            {formatRange(search.checkIn, search.checkOut)} · {plural(nights, "night")} · {plural(search.guests, "guest")}
          </Text>

          <View style={styles.tabs}>
            {TABS.map((t) => {
              const active = tab === t.type;
              return (
                <Pressable key={t.type} style={[styles.tab, active && styles.tabActive]} onPress={() => setTab(t.type)}>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {rooms.map((room) => {
            const fits = room.maxGuests >= search.guests;
            return (
              <View key={room.id} style={styles.room}>
                <View style={[styles.roomIcon, { backgroundColor: hotel.coverColor }]}>
                  <Ionicons name="bed" size={26} color="rgba(255,255,255,0.9)" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.muted}>
                    {room.maxGuests} guests · {room.beds}
                  </Text>
                  <View style={styles.roomBottom}>
                    <View>
                      <Text style={styles.price}>
                        {formatMoney(room.pricePerNight)}
                        <Text style={styles.night}>{t(" /night")}</Text>
                      </Text>
                      <Text style={styles.night}>{formatMoney(room.pricePerNight * nights)} total</Text>
                    </View>
                    <Pressable
                      style={[styles.select, !fits && { opacity: 0.4 }]}
                      disabled={!fits}
                      onPress={() => select(room)}
                    >
                      <Text style={styles.selectText}>{fits ? "Select" : `Max ${room.maxGuests}`}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
    muted: { fontSize: 12, color: colors.muted },
    content: { paddingHorizontal: 20, paddingBottom: 32 },
    cover: { height: 210, borderRadius: 28, marginBottom: 18 },
    name: { fontSize: 22, fontWeight: "800", color: colors.text },
    row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
    stars: { color: colors.star, fontSize: 13 },
    rating: { fontSize: 13, fontWeight: "700", color: colors.text },
    amenities: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    amenity: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.primarySoft, paddingHorizontal: 12, height: 32, borderRadius: 16 },
    amenityText: { fontSize: 12, fontWeight: "600", color: colors.text },
    description: { fontSize: 13, lineHeight: 20, color: colors.muted, marginTop: 14 },
    section: { fontSize: 17, fontWeight: "800", color: colors.text, marginTop: 24 },
    stay: { fontSize: 12, color: colors.muted, marginTop: 4, marginBottom: 12 },
    tabs: { flexDirection: "row", gap: 8, marginBottom: 14 },
    tab: { paddingHorizontal: 14, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.border, justifyContent: "center" },
    tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    tabText: { fontSize: 12, fontWeight: "700", color: colors.text },
    tabTextActive: { color: colors.white },
    room: { flexDirection: "row", gap: 12, borderRadius: 20, padding: 12, marginBottom: 12, backgroundColor: colors.card, boxShadow: colors.shadow },
    roomIcon: { width: 72, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    roomName: { fontSize: 14, fontWeight: "800", color: colors.text, marginBottom: 2 },
    roomBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 10 },
    price: { fontSize: 18, fontWeight: "800", color: colors.text },
    night: { fontSize: 10, fontWeight: "400", color: colors.muted },
    select: { height: 32, paddingHorizontal: 20, borderRadius: 16, backgroundColor: colors.primary, justifyContent: "center" },
    selectText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  });
