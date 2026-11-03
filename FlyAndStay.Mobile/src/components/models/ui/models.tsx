import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { travelApi } from "@/api/travel";
import { AirlineBrand } from "@/api/types";
import Catalog from "@/components/shared/ui/catalog";
import { ThemeColors } from "@/constants/theme";
import { useFetch } from "@/hooks/use-fetch";
import { useTheme } from "@/hooks/use-theme";
import Button from "@/components/shared/ui/button";

type Props = {

  selectedSlug: string | null;
  brand: AirlineBrand | null;
};

export default function Models({ selectedSlug, brand }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  const { data, loading, error, reload } = useFetch(
    (signal) => travelApi.aircraft(selectedSlug as string, signal),
    [selectedSlug],
    selectedSlug !== null,
  );

  const header = brand ? (
    <Text style={styles.title}>
      {brand.name} fleet · {brand.modelsCount} {brand.modelsCount === 1 ? "type" : "types"}
    </Text>
  ) : null;

  return (
    <Catalog
      data={selectedSlug ? (data ?? []) : []}
      loading={loading}
      error={error}
      onRetry={reload}
      header={header}
      keyExtractor={(m) => m.slug}
      contentContainerStyle={styles.list}
      emptyTitle="Choose an airline"
      emptyText="Tap an airline above to see its aircraft."
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.icon}>
              <Ionicons name="airplane" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.maker}>
                {item.manufacturer} · {item.fleetCount} in fleet
              </Text>
            </View>
          </View>

          <View style={styles.stats}>
            <Stat label="Seats" value={String(item.seats)} />
            <Stat label="Range" value={`${item.rangeKm.toLocaleString("en-US")} km`} />
            <Stat label="Cruise" value={`${item.cruiseSpeedKmh} km/h`} />
          </View>

          <Button
            title={item.upcomingFlights > 0 ? `Find flights (${item.upcomingFlights})` : "No upcoming flights"}
            variant="outline"
            disabled={item.upcomingFlights === 0}
            style={styles.findButton}
            onPress={() =>
              router.navigate({
                pathname: "/flights",
                params: { airline: selectedSlug ?? "", aircraft: item.slug },
              })
            }
          />
        </View>
      )}
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
    title: { fontSize: 16, fontWeight: "800", color: colors.text, marginBottom: 12 },
    card: { borderRadius: 20, padding: 16, backgroundColor: colors.card, gap: 14, boxShadow: colors.shadow },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
    icon: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    name: { fontSize: 15, fontWeight: "800", color: colors.text },
    maker: { fontSize: 12, color: colors.muted, marginTop: 2 },
    stats: { flexDirection: "row", backgroundColor: colors.primarySoft, borderRadius: 12, paddingVertical: 10 },
    stat: { flex: 1, alignItems: "center" },
    statValue: { fontSize: 13, fontWeight: "800", color: colors.text },
    statLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
    findButton: { height: 44 },
  });
