import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Airport } from "@/api/types";
import CalendarModal from "@/components/shared/ui/calendar-modal";
import Stepper from "@/components/shared/ui/stepper";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Search, useTrip } from "@/hooks/use-trip";
import { addDays, formatLong, plural, todayISO } from "@/utils/dates";
import AirportPicker from "./airport-picker";

type Mode = "flights" | "hotels";
type Picker = "from" | "to" | "city" | null;
type DateField = "departDate" | "returnDate" | "checkIn" | "checkOut" | null;

function Cell({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable style={styles.cell} onPress={onPress}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={styles.cellValue} numberOfLines={1}>
        {value}
      </Text>
    </Pressable>
  );
}

export default function SearchCard() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { search, updateSearch } = useTrip();

  const [mode, setMode] = useState<Mode>("flights");
  const [picker, setPicker] = useState<Picker>(null);
  const [dateField, setDateField] = useState<DateField>(null);
  const [error, setError] = useState("");

  const today = todayISO();

  const dateConfig = useMemo(() => {
    switch (dateField) {
      case "departDate":
        return { title: "Departure date", value: search.departDate, min: today };
      case "returnDate":
        return { title: "Return date", value: search.returnDate, min: addDays(search.departDate, 1) };
      case "checkIn":
        return { title: "Check-in date", value: search.checkIn, min: today };
      case "checkOut":
        return { title: "Check-out date", value: search.checkOut, min: addDays(search.checkIn, 1) };
      default:
        return null;
    }
  }, [dateField, search, today]);

  const swap = () => updateSearch({ from: search.to, to: search.from });

  const pickAirport = (airport: Airport) => {
    setError("");
    if (picker === "from") updateSearch({ from: airport });
    else if (picker === "to") updateSearch({ to: airport });
    else if (picker === "city") updateSearch({ destination: airport.city });
  };

  const submit = () => {
    if (mode === "flights") {
      if (search.from.code === search.to.code) {
        setError("Departure and arrival airports must be different.");
        return;
      }
      setError("");
      router.navigate("/flights");
    } else {
      router.navigate("/hotels");
    }
  };

  return (
    <View>
      <View style={styles.segment}>
        {(["flights", "hotels"] as Mode[]).map((m) => {
          const active = mode === m;
          return (
            <Pressable key={m} style={[styles.segmentItem, active && styles.segmentActive]} onPress={() => setMode(m)}>
              <Ionicons name={m === "flights" ? "paper-plane" : "bed"} size={18} color={active ? colors.primary : colors.muted} />
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {m === "flights" ? "Flights" : "Hotels"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.box}>
        {mode === "flights" ? (
          <>
            <View style={styles.row}>
              <Cell label="From" value={`${search.from.city} (${search.from.code})`} onPress={() => setPicker("from")} />
              <Pressable style={styles.swap} onPress={swap}>
                <Ionicons name="swap-horizontal" size={18} color={colors.primary} />
              </Pressable>
              <Cell label="To" value={`${search.to.city} (${search.to.code})`} onPress={() => setPicker("to")} />
            </View>
            <View style={[styles.row, styles.rowTop]}>
              <Cell label="Departure" value={formatLong(search.departDate)} onPress={() => setDateField("departDate")} />
              <Cell label="Return" value={formatLong(search.returnDate)} onPress={() => setDateField("returnDate")} />
            </View>
            <View style={[styles.row, styles.rowTop, styles.passenger]}>
              <Ionicons name="person-outline" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.passengerMain}>{plural(search.passengers, "Passenger")}</Text>
                <Text style={styles.cellLabel}>Economy</Text>
              </View>
              <Stepper value={search.passengers} min={1} max={9} onChange={(passengers) => updateSearch({ passengers })} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.row}>
              <Cell label="Destination" value={search.destination} onPress={() => setPicker("city")} />
            </View>
            <View style={[styles.row, styles.rowTop]}>
              <Cell label="Check-in" value={formatLong(search.checkIn)} onPress={() => setDateField("checkIn")} />
              <Cell label="Check-out" value={formatLong(search.checkOut)} onPress={() => setDateField("checkOut")} />
            </View>
            <View style={[styles.row, styles.rowTop, styles.passenger]}>
              <Ionicons name="people-outline" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.passengerMain}>{plural(search.guests, "Guest")}</Text>
                <Text style={styles.cellLabel}>1 Room</Text>
              </View>
              <Stepper value={search.guests} min={1} max={4} onChange={(guests) => updateSearch({ guests })} />
            </View>
          </>
        )}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]} onPress={submit}>
        <Text style={styles.buttonText}>{mode === "flights" ? "Search Flights" : "Search Hotels"}</Text>
      </Pressable>

      <AirportPicker
        visible={picker !== null}
        title={picker === "from" ? "From" : picker === "to" ? "To" : "Destination"}
        mode={picker === "city" ? "city" : "airport"}
        onSelect={pickAirport}
        onClose={() => setPicker(null)}
      />

      {dateConfig && (
        <CalendarModal
          visible
          title={dateConfig.title}
          value={dateConfig.value}
          minDate={dateConfig.min}
          onSelect={(date) => updateSearch({ [dateField!]: date } as Partial<Search>)}
          onClose={() => setDateField(null)}
        />
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    segment: {
      flexDirection: "row",
      backgroundColor: colors.primarySoft,
      borderRadius: 22,
      padding: 4,
      marginBottom: 16,
    },
    segmentItem: {
      flex: 1,
      flexDirection: "row",
      gap: 8,
      height: 44,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    segmentActive: { backgroundColor: colors.card },
    segmentText: { fontSize: 14, fontWeight: "600", color: colors.muted },
    segmentTextActive: { color: colors.primary },
    box: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: "hidden", marginBottom: 16, backgroundColor: colors.card },
    row: { flexDirection: "row", alignItems: "center" },
    rowTop: { borderTopWidth: 1, borderTopColor: colors.border },
    cell: { flex: 1, paddingHorizontal: 14, paddingVertical: 10 },
    cellLabel: { fontSize: 11, color: colors.muted },
    cellValue: { fontSize: 15, fontWeight: "700", color: colors.text, marginTop: 2 },
    swap: {
      position: "absolute",
      left: "50%",
      marginLeft: -16,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },
    passenger: { paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
    passengerMain: { fontSize: 13, fontWeight: "600", color: colors.text },
    error: { color: colors.error, fontSize: 13, textAlign: "center", marginBottom: 10 },
    button: { height: 54, borderRadius: 27, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
    buttonText: { color: colors.white, fontSize: 16, fontWeight: "700" },
  });
