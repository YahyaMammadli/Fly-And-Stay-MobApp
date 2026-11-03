import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { travelApi } from "@/api/travel";
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
import Catalog from "@/components/shared/ui/catalog";
import Chip from "@/components/shared/ui/chip";
import ScreenHeader from "@/components/shared/ui/screen-header";
import SortSheet from "@/components/shared/ui/sort-sheet";
import { ThemeColors } from "@/constants/theme";
import { useFetch } from "@/hooks/use-fetch";
import { useTheme } from "@/hooks/use-theme";
import { useTrip } from "@/hooks/use-trip";
import { formatRange, plural } from "@/utils/dates";

const SEARCH_KEYS = ["name", "district"] as const;

export default function HotelsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { search } = useTrip();

  const [filters, setFilters] = useState<HotelFilters>(emptyHotelFilters);
  const [sort, setSort] = useState<HotelSort>("popular");
  const [section, setSection] = useState<FilterSection | null>(null);
  const [sortOpen, setSortOpen] = useState(false);

  const { data: amenities } = useFetch((signal) => travelApi.amenities(signal), []);

  const filtersKey = JSON.stringify(filters);
  const hotels = useFetch(
    (signal) => travelApi.searchHotels(toHotelParams(search.destination, search.guests, filters, sort), signal),
    [search.destination, search.guests, filtersKey, sort],
  );

  const activeCount = countHotelFilters(filters);
  const sortLabel = HOTEL_SORTS.find((s) => s.value === sort)?.label ?? "Sort";

  const header = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
      <Chip label={sortLabel} dropdown onPress={() => setSortOpen(true)} />
      <Chip label={priceLabel(filters)} dropdown active={priceActive(filters)} onPress={() => setSection("price")} />
      <Chip
        label={filters.minRating ? `${filters.minRating}+ rating` : "Rating"}
        dropdown
        active={ratingActive(filters)}
        onPress={() => setSection("rating")}
      />
      <Chip label="More" dropdown active={moreActive(filters)} onPress={() => setSection("more")} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader
        title={`Hotels in ${search.destination}`}
        subtitle={`${formatRange(search.checkIn, search.checkOut)} · 1 Room, ${plural(search.guests, "Guest")}`}
      />

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
          searchPlaceholder={`Search in ${search.destination}`}
          keyExtractor={(h) => h.slug}
          contentContainerStyle={styles.list}
          emptyTitle="No hotels found"
          emptyText="Try another destination, or remove some filters."
          emptyAction={activeCount ? { label: "Clear filters", onPress: () => setFilters(emptyHotelFilters) } : undefined}
          renderItem={({ item }) => (
            <HotelCard hotel={item} onPress={() => router.push({ pathname: "/hotel/[slug]", params: { slug: item.slug } })} />
          )}
        />
      </View>

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
  });
