import { useMemo, useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { AirlineBrand } from "@/api/types";
import Button from "@/components/shared/ui/button";
import Chip from "@/components/shared/ui/chip";
import Sheet from "@/components/shared/ui/sheet";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { emptyFlightFilters, FlightFilters, StopsFilter, TIMES_OF_DAY, TimeOfDay } from "../filters";

type Props = {
  airlines: AirlineBrand[];
  value: FlightFilters;
  onApply: (filters: FlightFilters) => void;
  onClose: () => void;
};

const STOP_OPTIONS: { value: StopsFilter; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "direct", label: "Direct" },
  { value: "1stop", label: "1+ stops" },
];

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export default function FlightFiltersSheet({ airlines, value, onApply, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [draft, setDraft] = useState<FlightFilters>(value);

  const set = (patch: Partial<FlightFilters>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <Sheet
      visible
      title="Filter flights"
      onClose={onClose}
      footer={
        <>
          <Button title="Reset" variant="outline" style={{ flex: 1 }} onPress={() => setDraft(emptyFlightFilters)} />
          <Button
            title="Show flights"
            style={{ flex: 2 }}
            onPress={() => {
              onApply(draft);
              onClose();
            }}
          />
        </>
      }
    >
      <View>
        <Text style={styles.label}>Airlines</Text>
        <View style={styles.wrap}>
          {airlines.map((a) => (
            <Chip
              key={a.slug}
              label={a.name}
              active={draft.airlines.includes(a.slug)}
              onPress={() => set({ airlines: toggle(draft.airlines, a.slug) })}
            />
          ))}
        </View>
      </View>

      <View>
        <Text style={styles.label}>Stops</Text>
        <View style={styles.wrap}>
          {STOP_OPTIONS.map((o) => (
            <Chip key={o.value} label={o.label} active={draft.stops === o.value} onPress={() => set({ stops: o.value })} />
          ))}
        </View>
      </View>

      <View>
        <Text style={styles.label}>Price per passenger (USD)</Text>
        <View style={styles.priceRow}>
          <TextInput
            style={styles.input}
            placeholder="Min"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={draft.minPrice}
            onChangeText={(t) => set({ minPrice: t.replace(/[^0-9.]/g, "") })}
          />
          <Text style={styles.dash}>–</Text>
          <TextInput
            style={styles.input}
            placeholder="Max"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={draft.maxPrice}
            onChangeText={(t) => set({ maxPrice: t.replace(/[^0-9.]/g, "") })}
          />
        </View>
      </View>

      <View>
        <Text style={styles.label}>Departure time</Text>
        <View style={styles.wrap}>
          {TIMES_OF_DAY.map((t) => (
            <Chip
              key={t.value}
              label={`${t.label} · ${t.hint.slice(0, 5)}`}
              icon={t.icon}
              active={draft.times.includes(t.value as TimeOfDay)}
              onPress={() => set({ times: toggle(draft.times, t.value as TimeOfDay) })}
            />
          ))}
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchTitle}>Checked bag included</Text>
          <Text style={styles.switchSub}>Hide fares with carry-on only</Text>
        </View>
        <Switch
          value={draft.baggage}
          onValueChange={(baggage) => set({ baggage })}
          trackColor={{ true: colors.primary, false: colors.border }}
        />
      </View>

      {draft.aircraft && (
        <View>
          <Text style={styles.label}>Aircraft</Text>
          <View style={styles.wrap}>
            <Chip label={draft.aircraft.replace(/-/g, " ")} active removable onPress={() => set({ aircraft: null })} />
          </View>
        </View>
      )}
    </Sheet>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    label: { fontSize: 14, fontWeight: "800", color: colors.text, marginBottom: 10 },
    wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    priceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    dash: { color: colors.muted, fontSize: 16 },
    input: {
      flex: 1,
      height: 46,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 14,
      fontSize: 15,
      color: colors.text,
    },
    switchRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    switchTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
    switchSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  });
