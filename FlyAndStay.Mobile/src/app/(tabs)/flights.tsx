import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { travelApi } from "@/api/travel";
import { CalendarDay } from "@/api/types";
import DateStrip from "@/components/flights/ui/date-strip";
import FlightCard from "@/components/flights/ui/flight-card";
import FlightFiltersSheet from "@/components/flights/ui/flight-filters";
import {
  activeFlightChips,
  emptyFlightFilters,
  FLIGHT_SORTS,
  FlightFilters,
  FlightSort,
  toFlightParams,
} from "@/components/flights/filters";
import CalendarModal from "@/components/shared/ui/calendar-modal";
import Catalog from "@/components/shared/ui/catalog";
import Chip from "@/components/shared/ui/chip";
import ScreenHeader from "@/components/shared/ui/screen-header";
import SortSheet from "@/components/shared/ui/sort-sheet";
import { ThemeColors } from "@/constants/theme";
import { useFetch } from "@/hooks/use-fetch";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import { useTrip } from "@/hooks/use-trip";
import { addDays, formatShort, todayISO } from "@/utils/dates";

const STRIP_DAYS = 7;

export default function FlightsScreen() {
  const { colors } = useTheme();
  const { t, toUsd, formatAmount } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { search, updateSearch } = useTrip();
  const params = useLocalSearchParams<{ airline?: string; aircraft?: string }>();

  const [filters, setFilters] = useState<FlightFilters>(emptyFlightFilters);
  const [sort, setSort] = useState<FlightSort>("price_asc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (!params.airline && !params.aircraft) return;
    setFilters({
      ...emptyFlightFilters,
      airlines: params.airline ? [params.airline] : [],
      aircraft: params.aircraft || null,
    });
    router.setParams({ airline: "", aircraft: "" });
  }, [params.airline, params.aircraft, router]);

  const today = todayISO();
  const stripStart = useMemo(() => {
    const wanted = addDays(search.departDate, -3);
    return wanted < today ? today : wanted;
  }, [search.departDate, today]);

  const { data: airlines } = useFetch((signal) => travelApi.airlines(signal), []);

  const fromCode = search.from?.code ?? "";
  const toCode = search.to?.code ?? "";
  const routeReady = !!fromCode && !!toCode;

  const calendar = useFetch(
    (signal) => travelApi.flightCalendar({ from: fromCode, to: toCode, start: stripStart, days: STRIP_DAYS }, signal),
    [fromCode, toCode, stripStart],
    routeReady,
  );

  const filtersKey = JSON.stringify(filters);
  const flights = useFetch(
    (signal) =>
      travelApi.searchFlights(
        toFlightParams({ from: fromCode, to: toCode, date: search.departDate }, filters, sort, toUsd),
        signal,
      ),
    [fromCode, toCode, search.departDate, filtersKey, sort, toUsd],
    routeReady,
  );

  const days: CalendarDay[] =
    (routeReady ? calendar.data : null) ??
    Array.from({ length: STRIP_DAYS }, (_, i) => ({ date: addDays(stripStart, i), minPrice: null }));

  const chips = activeFlightChips(filters, airlines ?? [], formatAmount, t);
  const sortLabel = t(FLIGHT_SORTS.find((s) => s.value === sort)?.label ?? "Sort");

  const header = (
    <View>
      <View style={styles.toolbar}>
        <Chip
          label={chips.length ? `${t("Filter")} (${chips.length})` : t("Filter")}
          icon="options-outline"
          active={chips.length > 0}
          onPress={() => setFiltersOpen(true)}
        />
        <Chip label={sortLabel} icon="swap-vertical" dropdown onPress={() => setSortOpen(true)} />
      </View>
      {chips.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {chips.map((chip) => (
            <Chip key={chip.key} label={chip.label} active removable onPress={() => setFilters(chip.remove(filters))} />
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader
        title={routeReady ? `${search.from!.city} → ${search.to!.city}` : t("Flights")}
        subtitle={`${formatShort(search.departDate)} · ${t(search.passengers === 1 ? "{count} Passenger" : "{count} Passengers", { count: search.passengers })}`}
        right={
          <Pressable style={styles.calendarButton} onPress={() => setCalendarOpen(true)} hitSlop={8}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </Pressable>
        }
      />

      <DateStrip days={days} selected={search.departDate} onSelect={(date) => updateSearch({ departDate: date })} />

      <View style={styles.listWrap}>
        <Catalog
          data={routeReady ? (flights.data ?? []) : []}
          loading={routeReady && flights.loading}
          error={routeReady ? flights.error : null}
          onRetry={flights.reload}
          refreshing={flights.loading && !!flights.data}
          onRefresh={flights.reload}
          header={header}
          keyExtractor={(f) => String(f.id)}
          contentContainerStyle={styles.list}
          emptyTitle={routeReady ? t("No flights found") : t("Where are you flying?")}
          emptyText={routeReady ? t("Try another date, or remove some filters.") : t("Choose where you fly from and to.")}
          emptyAction={
            !routeReady
              ? { label: t("Choose route"), onPress: () => router.navigate("/home") }
              : chips.length
                ? { label: t("Clear filters"), onPress: () => setFilters(emptyFlightFilters) }
                : undefined
          }
          renderItem={({ item }) => (
            <FlightCard
              flight={item}
              onSelect={() => router.push({ pathname: "/flight/[id]", params: { id: String(item.id) } })}
            />
          )}
        />
      </View>

      {filtersOpen && (
        <FlightFiltersSheet
          airlines={airlines ?? []}
          value={filters}
          onApply={setFilters}
          onClose={() => setFiltersOpen(false)}
        />
      )}
      <SortSheet visible={sortOpen} options={FLIGHT_SORTS} value={sort} onSelect={setSort} onClose={() => setSortOpen(false)} />
      {calendarOpen && (
        <CalendarModal
          visible
          title={t("Departure date")}
          value={search.departDate}
          minDate={today}
          onSelect={(date) => updateSearch({ departDate: date })}
          onClose={() => setCalendarOpen(false)}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    calendarButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    listWrap: { flex: 1 },
    list: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24 },
    toolbar: { flexDirection: "row", gap: 8, marginBottom: 10 },
    chipRow: { gap: 8, paddingBottom: 12 },
  });
