import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps, ReactNode, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { bookingsApi } from "@/api/bookings";
import { getErrorMessage } from "@/api/client";
import Button from "@/components/shared/ui/button";
import ScreenHeader from "@/components/shared/ui/screen-header";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useTrip } from "@/hooks/use-trip";
import { diffDays, formatLong, formatMoney, formatRange, formatTime, plural } from "@/utils/dates";

type IconName = ComponentProps<typeof Ionicons>["name"];

function SummaryCard({
  icon,
  title,
  lines,
  price,
  onChange,
  changeLabel = "Change",
}: {
  icon: IconName;
  title: string;
  lines: ReactNode[];
  price: string;
  onChange: () => void;
  changeLabel?: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Ionicons name={icon} size={18} color={colors.text} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {lines.map((line, i) => (
        <Text key={i} style={i === 0 ? styles.lineMain : styles.line}>
          {line}
        </Text>
      ))}
      <View style={styles.cardFoot}>
        <Text style={styles.cardPrice}>{price}</Text>
        <Pressable onPress={onChange} hitSlop={8}>
          <Text style={styles.change}>{changeLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function AddCard({ icon, title, text, onPress }: { icon: IconName; title: string; text: string; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable style={styles.addCard} onPress={onPress}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={styles.addTitle}>{title}</Text>
        <Text style={styles.line}>{text}</Text>
      </View>
      <Ionicons name="add-circle" size={24} color={colors.primary} />
    </Pressable>
  );
}

export default function BookingSummaryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { search, draft, setFlight, setStay, resetDraft } = useTrip();
  const { flight, hotel, room } = draft;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const nights = Math.max(1, diffDays(search.checkIn, search.checkOut));
  const flightTotal = flight ? flight.price * search.passengers : 0;
  const hotelTotal = room ? room.pricePerNight * nights : 0;
  const total = flightTotal + hotelTotal;
  const hasItems = !!flight || (!!hotel && !!room);

  const confirm = async () => {
    setError("");
    setSubmitting(true);
    try {

      const booking = await bookingsApi.create({
        flightId: flight?.id,
        roomId: room?.id,
        checkIn: room ? search.checkIn : undefined,
        checkOut: room ? search.checkOut : undefined,
        passengers: search.passengers,
        guests: search.guests,
      });
      resetDraft();
      router.replace({
        pathname: "/booking/confirmed",
        params: { reference: booking.reference, total: String(booking.total) },
      });
    } catch (e) {
      setError(getErrorMessage(e, "Could not complete the booking. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScreenHeader title="Booking Summary" fallbackHref="/flights" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {flight ? (
          <SummaryCard
            icon="paper-plane"
            title="Flight"
            lines={[
              `${flight.from.city} (${flight.from.code}) → ${flight.to.city} (${flight.to.code})`,
              `${formatLong(flight.departAt)} · ${formatTime(flight.departAt)} – ${formatTime(flight.arriveAt)}`,
              `${flight.airline.name} (${flight.flightNumber.slice(0, 2)} ${flight.flightNumber.slice(2)})`,
              `${plural(search.passengers, "Passenger")} · Economy`,
            ]}
            price={formatMoney(flightTotal)}
            onChange={() => {
              setFlight(null);
              router.navigate("/flights");
            }}
          />
        ) : (
          <AddCard
            icon="paper-plane-outline"
            title="Add a flight"
            text={`${search.from.city} → ${search.to.city}`}
            onPress={() => router.navigate("/flights")}
          />
        )}

        {hotel && room ? (
          <SummaryCard
            icon="bed"
            title="Hotel"
            lines={[
              hotel.name,
              `${formatRange(search.checkIn, search.checkOut)} · ${plural(nights, "night")}`,
              `${room.name} · 1 Room, ${plural(search.guests, "Guest")}`,
            ]}
            price={formatMoney(hotelTotal)}
            onChange={() => {
              setStay(null, null);
              router.navigate("/hotels");
            }}
          />
        ) : (
          <AddCard
            icon="bed-outline"
            title="Add a hotel"
            text={`Stay in ${flight?.to.city ?? search.destination}`}
            onPress={() => router.navigate("/hotels")}
          />
        )}

        {hasItems && (
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total Price</Text>
              <Text style={styles.line}>Includes taxes &amp; fees</Text>
            </View>
            <Text style={styles.total}>{formatMoney(total)}</Text>
          </View>
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Confirm Booking" onPress={confirm} loading={submitting} disabled={!hasItems} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 20, paddingBottom: 20, gap: 14 },
    card: { borderRadius: 20, padding: 16, backgroundColor: colors.card, boxShadow: colors.shadow },
    cardHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    cardTitle: { fontSize: 14, fontWeight: "800", color: colors.text },
    lineMain: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 2 },
    line: { fontSize: 11, color: colors.muted, marginTop: 2 },
    cardFoot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
    cardPrice: { fontSize: 20, fontWeight: "800", color: colors.text },
    change: { fontSize: 12, fontWeight: "700", color: colors.primary },
    addCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1.5,
      borderStyle: "dashed",
      borderColor: colors.primary,
      borderRadius: 16,
      padding: 14,
    },
    addTitle: { fontSize: 14, fontWeight: "800", color: colors.text },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    totalLabel: { fontSize: 15, fontWeight: "800", color: colors.text },
    total: { fontSize: 24, fontWeight: "800", color: colors.text },
    error: { color: colors.error, fontSize: 13, textAlign: "center" },
    footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  });
