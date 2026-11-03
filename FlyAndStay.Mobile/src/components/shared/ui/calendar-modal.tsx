import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Sheet from "@/components/shared/ui/sheet";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { monthName, toISO } from "@/utils/dates";

type Props = {
  visible: boolean;
  title: string;

  value: string;

  minDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS_SHOWN = 12;

type Cell = { iso: string; day: number } | null;

function buildMonth(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const cells: Cell[] = Array(offset).fill(null);
  for (let day = 1; day <= count; day++) cells.push({ iso: toISO(new Date(year, month, day)), day });
  return cells;
}

export default function CalendarModal({ visible, title, value, minDate, onSelect, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const months = useMemo(() => {
    const [y, m] = minDate.split("-").map(Number);
    return Array.from({ length: MONTHS_SHOWN }, (_, i) => {
      const d = new Date(y, m - 1 + i, 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: `${monthName(d.getMonth())} ${d.getFullYear()}`, cells: buildMonth(d.getFullYear(), d.getMonth()) };
    });
  }, [minDate]);

  return (
    <Sheet visible={visible} title={title} onClose={onClose}>
      <View style={styles.weekRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>
      {months.map((month) => (
        <View key={month.key}>
          <Text style={styles.monthTitle}>{month.label}</Text>
          <View style={styles.grid}>
            {month.cells.map((cell, index) => {
              if (!cell) return <View key={`e-${index}`} style={styles.cell} />;
              const disabled = cell.iso < minDate;
              const selected = cell.iso === value;
              return (
                <Pressable
                  key={cell.iso}
                  style={styles.cell}
                  disabled={disabled}
                  onPress={() => {
                    onSelect(cell.iso);
                    onClose();
                  }}
                >
                  <View style={[styles.day, selected && styles.daySelected]}>
                    <Text style={[styles.dayText, disabled && styles.dayDisabled, selected && styles.dayTextSelected]}>
                      {cell.day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </Sheet>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    weekRow: { flexDirection: "row" },
    weekday: { flex: 1, textAlign: "center", fontSize: 11, fontWeight: "600", color: colors.muted },
    monthTitle: { fontSize: 15, fontWeight: "800", color: colors.text, marginBottom: 6 },
    grid: { flexDirection: "row", flexWrap: "wrap" },
    cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
    day: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    daySelected: { backgroundColor: colors.primary },
    dayText: { fontSize: 14, fontWeight: "600", color: colors.text },
    dayDisabled: { color: colors.border },
    dayTextSelected: { color: colors.white },
  });
