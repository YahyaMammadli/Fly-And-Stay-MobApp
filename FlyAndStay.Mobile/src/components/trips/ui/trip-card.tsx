import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Booking } from "@/api/types";
import Button from "@/components/shared/ui/button";
import { ThemeColors } from "@/constants/theme";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import { formatLong, formatRange, formatTime, plural } from "@/utils/dates";

type Props = {
  booking: Booking;
  canCancel: boolean;
  cancelling: boolean;
  onCancel: () => void;
};

export default function TripCard({ booking, canCancel, cancelling, onCancel }: Props) {
  const { colors } = useTheme();
  const { t, formatMoney } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [confirming, setConfirming] = useState(false);
  const cancelled = booking.status === "Cancelled";
  const { flight, stay } = booking;

  return (
    <View style={[styles.card, cancelled && { opacity: 0.7 }]}>
      <View style={styles.head}>
        <Text style={styles.reference}>#{booking.reference}</Text>
        <View style={[styles.badge, cancelled && styles.badgeCancelled]}>
          <Text style={[styles.badgeText, cancelled && styles.badgeTextCancelled]}>{booking.status}</Text>
        </View>
      </View>

      {flight && (
        <View style={styles.block}>
          <Ionicons name="paper-plane" size={16} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.main}>
              {flight.from.city} → {flight.to.city}
            </Text>
            <Text style={styles.sub}>
              {formatLong(flight.departAt)} · {formatTime(flight.departAt)} – {formatTime(flight.arriveAt)}
            </Text>
            <Text style={styles.sub}>
              {flight.airline.name} · {plural(booking.passengers, "passenger")}
            </Text>
          </View>
        </View>
      )}

      {stay && (
        <View style={styles.block}>
          <Ionicons name="bed" size={16} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.main}>{stay.hotelName}</Text>
            <Text style={styles.sub}>
              {formatRange(stay.checkIn, stay.checkOut)} · {plural(stay.nights, "night")}
            </Text>
            <Text style={styles.sub}>
              {stay.roomName} · {plural(booking.guests, "guest")}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.foot}>
        <Text style={styles.total}>{formatMoney(booking.total)}</Text>
        {canCancel && !confirming && (
          <Text style={styles.cancel} onPress={() => setConfirming(true)}>
            Cancel booking
          </Text>
        )}
      </View>

      {canCancel && confirming && (
        <View style={styles.confirm}>
          <Text style={styles.confirmText}>{t("Cancel this booking? This can't be undone.")}</Text>
          <View style={styles.confirmButtons}>
            <Button title={t("Keep it")} variant="outline" style={styles.small} onPress={() => setConfirming(false)} />
            <Button title={t("Yes, cancel")} variant="danger" style={styles.small} loading={cancelling} onPress={onCancel} />
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: { borderRadius: 20, padding: 16, backgroundColor: colors.card, gap: 12, boxShadow: colors.shadow },
    head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    reference: { fontSize: 13, fontWeight: "800", color: colors.text },
    badge: { paddingHorizontal: 10, height: 22, borderRadius: 11, backgroundColor: colors.successSoft, justifyContent: "center" },
    badgeCancelled: { backgroundColor: colors.primarySoft },
    badgeText: { fontSize: 11, fontWeight: "700", color: colors.success },
    badgeTextCancelled: { color: colors.muted },
    block: { flexDirection: "row", gap: 10 },
    main: { fontSize: 14, fontWeight: "700", color: colors.text },
    sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
    foot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
    total: { fontSize: 18, fontWeight: "800", color: colors.text },
    cancel: { fontSize: 12, fontWeight: "700", color: colors.error },
    confirm: { backgroundColor: colors.primarySoft, borderRadius: 12, padding: 12, gap: 10 },
    confirmText: { fontSize: 12, color: colors.text },
    confirmButtons: { flexDirection: "row", gap: 10 },
    small: { flex: 1, height: 40 },
  });
