import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ComponentProps, useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { travelApi } from "@/api/travel";
import Button from "@/components/shared/ui/button";
import ScreenHeader from "@/components/shared/ui/screen-header";
import { ThemeColors } from "@/constants/theme";
import { useFetch } from "@/hooks/use-fetch";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import { useTrip } from "@/hooks/use-trip";
import { formatDuration, formatLong, formatTime } from "@/utils/dates";

type IconName = ComponentProps<typeof Ionicons>["name"];

export default function FlightDetailsScreen() {
  const { colors } = useTheme();
  const { t, formatMoney } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { search, setFlight } = useTrip();

  const { data: flight, loading, error, reload } = useFetch((signal) => travelApi.flight(Number(id), signal), [id]);

  const passengers = search.passengers;

  const proceed = () => {
    if (!flight) return;
    setFlight(flight);
    router.push("/booking/summary");
  };

  const info: { icon: IconName; label: string; value: string }[] = flight
    ? [
        { icon: "airplane-outline", label: "Aircraft", value: flight.aircraft },
        { icon: "bag-handle-outline", label: "Baggage", value: flight.baggage },
        { icon: "restaurant-outline", label: "Meal", value: flight.mealIncluded ? "Included" : "Not included" },
        { icon: "refresh-outline", label: "Cancellation", value: flight.cancellation },
      ]
    : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScreenHeader title={t("Flight Details")} fallbackHref="/flights" />

      {loading && !flight ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error || !flight ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={36} color={colors.muted} />
          <Text style={styles.errorText}>{error ?? "Flight not found."}</Text>
          <Button title={t("Try again")} variant="outline" onPress={reload} style={{ marginTop: 12 }} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.airlineRow}>
              <View style={[styles.logo, { backgroundColor: flight.airline.color }]}>
                <Ionicons name="airplane" size={16} color={colors.white} />
              </View>
              <View>
                <Text style={styles.airlineName}>{flight.airline.name}</Text>
                <Text style={styles.flightNo}>
                  {flight.flightNumber.slice(0, 2)} {flight.flightNumber.slice(2)} · {formatLong(flight.departAt)}
                </Text>
              </View>
            </View>

            <View style={styles.routeRow}>
              <Text style={styles.bigTime}>{formatTime(flight.departAt)}</Text>
              <View style={styles.routeMiddle}>
                <Text style={styles.duration}>{formatDuration(flight.durationMinutes)}</Text>
                <View style={styles.line}>
                  <View style={styles.dot} />
                  <View style={styles.dash} />
                  <Ionicons name="airplane" size={14} color={colors.primary} />
                  <View style={styles.dash} />
                  <View style={styles.dot} />
                </View>
                <Text style={styles.duration}>{flight.stops === 0 ? "Direct" : `1 stop · ${flight.via}`}</Text>
              </View>
              <Text style={styles.bigTime}>{formatTime(flight.arriveAt)}</Text>
            </View>
            <View style={styles.routeRow}>
              <View>
                <Text style={styles.code}>{flight.from.code}</Text>
                <Text style={styles.city}>{flight.from.city}</Text>
                <Text style={styles.airport}>{flight.from.name}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.code}>{flight.to.code}</Text>
                <Text style={styles.city}>{flight.to.city}</Text>
                <Text style={styles.airport}>{flight.to.name}</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              {info.map((row) => (
                <View key={row.label} style={styles.infoRow}>
                  <Ionicons name={row.icon} size={18} color={colors.muted} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>{row.label}</Text>
                    <Text style={styles.infoValue}>{row.value}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.section}>{t("Price Summary")}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t("Base fare")}</Text>
              <Text style={styles.priceValue}>{formatMoney(flight.fare)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t("Taxes & fees")}</Text>
              <Text style={styles.priceValue}>{formatMoney(flight.taxes)}</Text>
            </View>
            {passengers > 1 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t("Passengers")}</Text>
                <Text style={styles.priceValue}>× {passengers}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.total}>{t("Total price")}</Text>
              <Text style={styles.total}>{formatMoney(flight.price * passengers)}</Text>
            </View>
            <Text style={styles.hint}>
              {t("{price} per passenger", { price: formatMoney(flight.price) })} ·{" "}
              {t(passengers === 1 ? "{count} Passenger" : "{count} Passengers", { count: passengers })}
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <Button title={t("Continue")} onPress={proceed} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
    errorText: { color: colors.muted, textAlign: "center" },
    content: { paddingHorizontal: 20, paddingBottom: 24 },
    airlineRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4, marginBottom: 20 },
    logo: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    airlineName: { fontSize: 15, fontWeight: "800", color: colors.text },
    flightNo: { fontSize: 12, color: colors.muted, marginTop: 2 },
    routeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    bigTime: { fontSize: 28, fontWeight: "800", color: colors.text },
    routeMiddle: { flex: 1, alignItems: "center", paddingHorizontal: 10 },
    duration: { fontSize: 11, color: colors.muted },
    line: { flexDirection: "row", alignItems: "center", width: "100%", marginVertical: 4 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
    dash: { flex: 1, height: 1, backgroundColor: colors.border },
    code: { fontSize: 14, fontWeight: "800", color: colors.text, marginTop: 6 },
    city: { fontSize: 12, color: colors.text },
    airport: { fontSize: 11, color: colors.muted },
    infoBox: { backgroundColor: colors.primarySoft, borderRadius: 16, padding: 14, gap: 14, marginTop: 24 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    infoLabel: { fontSize: 11, color: colors.muted },
    infoValue: { fontSize: 13, fontWeight: "600", color: colors.text, marginTop: 1 },
    section: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 28, marginBottom: 12 },
    priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    priceLabel: { fontSize: 13, color: colors.muted },
    priceValue: { fontSize: 13, fontWeight: "700", color: colors.text },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
    total: { fontSize: 16, fontWeight: "800", color: colors.text },
    hint: { fontSize: 11, color: colors.muted, marginTop: 2 },
    footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  });
