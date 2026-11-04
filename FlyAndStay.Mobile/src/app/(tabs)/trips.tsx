import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { bookingsApi } from "@/api/bookings";
import { getErrorMessage } from "@/api/client";
import { Booking } from "@/api/types";
import Catalog from "@/components/shared/ui/catalog";
import Chip from "@/components/shared/ui/chip";
import TripCard from "@/components/trips/ui/trip-card";
import { ThemeColors } from "@/constants/theme";
import { useFetch } from "@/hooks/use-fetch";
import { usePreferences } from "@/hooks/use-preferences";
import { usePush } from "@/hooks/use-push";
import { useTheme } from "@/hooks/use-theme";
import { todayISO } from "@/utils/dates";

type Tab = "upcoming" | "past" | "cancelled";
const TABS: { value: Tab; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
];

function tabOf(b: Booking, today: string): Tab {
  if (b.status === "Cancelled") return "cancelled";
  return b.endDate < today ? "past" : "upcoming";
}

export default function TripsScreen() {
  const { colors } = useTheme();
  const { t } = usePreferences();
  const { syncReminders } = usePush();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const { data, loading, error, reload } = useFetch((signal) => bookingsApi.mine(signal), []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const today = todayISO();
  const all = data ?? [];
  const items = all.filter((b) => tabOf(b, today) === tab);

  const cancel = async (id: string) => {
    setActionError("");
    setCancellingId(id);
    try {
      await bookingsApi.cancel(id);
      reload();
      void syncReminders();
    } catch (e) {
      setActionError(getErrorMessage(e, t("Could not cancel the booking.")));
    } finally {
      setCancellingId(null);
    }
  };

  const header = (
    <View>
      <View style={styles.tabs}>
        {TABS.map((item) => (
          <Chip
            key={item.value}
            label={`${t(item.label)} (${all.filter((b) => tabOf(b, today) === item.value).length})`}
            active={tab === item.value}
            onPress={() => setTab(item.value)}
          />
        ))}
      </View>
      {!!actionError && <Text style={styles.error}>{actionError}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.title}>{t("My Trips")}</Text>
      <Catalog
        data={items}
        loading={loading}
        error={error}
        onRetry={reload}
        refreshing={loading && !!data}
        onRefresh={reload}
        header={header}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        emptyTitle={t(tab === "upcoming" ? "No upcoming trips" : tab === "past" ? "No past trips" : "No cancelled bookings")}
        emptyText={t(tab === "upcoming" ? "Book a flight or a hotel and it will show up here." : "Nothing here yet.")}
        renderItem={({ item }) => (
          <TripCard
            booking={item}
            canCancel={tab === "upcoming"}
            showRoute={tab === "upcoming"}
            cancelling={cancellingId === item.id}
            onCancel={() => cancel(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    title: { fontSize: 24, fontWeight: "800", color: colors.text, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
    list: { paddingHorizontal: 20, paddingBottom: 24 },
    tabs: { flexDirection: "row", gap: 8, marginBottom: 14, flexWrap: "wrap" },
    error: { color: colors.error, fontSize: 13, marginBottom: 10 },
  });
