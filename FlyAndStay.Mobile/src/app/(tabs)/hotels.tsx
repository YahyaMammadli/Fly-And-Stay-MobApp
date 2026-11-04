import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { travelApi } from "@/api/travel";
import { HotelSummary } from "@/api/types";
import {
  countHotelFilters,
  emptyHotelFilters,
  HOTEL_SORTS,
  HotelFilters,
  HotelSort,
  moreActive,
  priceActive,
  priceLabel,
  ratingActive,
  toHotelParams,
} from "@/components/hotels/filters";
import HotelCard from "@/components/hotels/ui/hotel-card";
import HotelFiltersSheet, { FilterSection } from "@/components/hotels/ui/hotel-filters";
import HotelsMap from "@/components/hotels/ui/hotels-map";
import Catalog from "@/components/shared/ui/catalog";
import Chip from "@/components/shared/ui/chip";
import ScreenHeader from "@/components/shared/ui/screen-header";
import SortSheet from "@/components/shared/ui/sort-sheet";
import { ThemeColors } from "@/constants/theme";
import { useFetch } from "@/hooks/use-fetch";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import { useTrip } from "@/hooks/use-trip";
import { formatRange } from "@/utils/dates";

const SEARCH_KEYS = ["name", "district"] as const;

export default function HotelsScreen() {
  const { colors } = useTheme();
  const { t, toUsd, formatAmount } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { search } = useTrip();

  const [filters, setFilters] = useState<HotelFilters>(emptyHotelFilters);
  const [sort, setSort] = useState<HotelSort>("popular");
  const [section, setSection] = useState<FilterSection | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");

  const { data: amenities } = useFetch((signal) => travelApi.amenities(signal), []);

  const filtersKey = JSON.stringify(filters);
  const hotels = useFetch(
    (signal) => travelApi.searchHotels(toHotelParams(search.destination, search.guests, filters, sort, toUsd), signal),
    [search.destination, search.guests, filtersKey, sort, toUsd],
  );

  const activeCount = countHotelFilters(filters);
  const sortLabel = t(HOTEL_SORTS.find((s) => s.value === sort)?.label ?? "Sort");

  const openHotel = (hotel: HotelSummary) => router.push({ pathname: "/hotel/[slug]", params: { slug: hotel.slug } });

  const viewToggle = (
    <Pressable style={styles.toggle} onPress={() => setView(view === "list" ? "map" : "list")} hitSlop={6} accessibilityRole="button">
      <Ionicons name={view === "list" ? "map-outline" : "list-outline"} size={16} color={colors.primary} />
      <Text style={styles.toggleText}>{t(view === "list" ? "Map" : "List")}</Text>
    </Pressable>
  );

  const header = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      <Chip label={sortLabel} dropdown onPress={() => setSortOpen(true)} />
      <Chip label={priceLabel(filters, formatAmount, t)} dropdown active={priceActive(filters)} onPress={() => setSection("price")} />
      <Chip
        label={filters.minRating ? t("{rating}+ rating", { rating: filters.minRating }) : t("Rating")}
        dropdown
        active={ratingActive(filters)}
        onPress={() => setSection("rating")}
      />
      <Chip label={t("More")} dropdown active={moreActive(filters)} onPress={() => setSection("more")} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader
        title={search.destination ? t("Hotels in {city}", { city: search.destination }) : t("Hotels")}
        subtitle={`${formatRange(search.checkIn, search.checkOut)} · ${t("1 Room")}, ${t(search.guests === 1 ? "{count} Guest" : "{count} Guests", { count: search.guests })}`}
        right={viewToggle}
      />

      {view === "map" ? (
        <View style={styles.listWrap}>
          <View style={styles.mapChips}>{header}</View>
          <HotelsMap hotels={hotels.data ?? []} loading={hotels.loading} onOpen={openHotel} />
        </View>
      ) : (
        <View style={styles.listWrap}>
          <Catalog
            data={hotels.data ?? []}
            loading={hotels.loading}
            error={hotels.error}
            onRetry={hotels.reload}
            refreshing={hotels.loading && !!hotels.data}
            onRefresh={hotels.reload}
            header={header}
            searchKeys={[...SEARCH_KEYS]}
            searchPlaceholder={search.destination ? t("Search in {city}", { city: search.destination }) : t("Search hotels")}
            keyExtractor={(h) => h.slug}
            contentContainerStyle={styles.list}
            emptyTitle={t("No hotels found")}
            emptyText={t("Try another destination, or remove some filters.")}
            emptyAction={activeCount ? { label: t("Clear filters"), onPress: () => setFilters(emptyHotelFilters) } : undefined}
            renderItem={({ item }) => <HotelCard hotel={item} onPress={() => openHotel(item)} />}
          />
        </View>
      )}

      {section && (
        <HotelFiltersSheet
          section={section}
          amenities={amenities ?? []}
          value={filters}
          onApply={setFilters}
          onClose={() => setSection(null)}
        />
      )}
      <SortSheet visible={sortOpen} options={HOTEL_SORTS} value={sort} onSelect={setSort} onClose={() => setSortOpen(false)} />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    listWrap: { flex: 1 },
    list: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 24 },
    chipRow: { gap: 8, paddingBottom: 14 },
    mapChips: { paddingHorizontal: 20, paddingTop: 6 },
    toggle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primarySoft,
    },
    toggleText: { fontSize: 12, fontWeight: "700", color: colors.primary },
  });
