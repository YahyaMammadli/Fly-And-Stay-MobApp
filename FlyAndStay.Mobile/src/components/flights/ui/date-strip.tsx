import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { CalendarDay } from "@/api/types";
import { ThemeColors } from "@/constants/theme";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import { formatShort, formatWeekday } from "@/utils/dates";

type Props = { days: CalendarDay[]; selected: string; onSelect: (date: string) => void };

export default function DateStrip({ days, selected, onSelect }: Props) {
  const { colors } = useTheme();
  const { formatMoney } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {days.map((day) => {
        const active = day.date === selected;
        return (
          <Pressable key={day.date} style={[styles.item, active && styles.itemActive]} onPress={() => onSelect(day.date)}>
            <Text style={[styles.weekday, active && styles.textActive]}>{formatWeekday(day.date)}</Text>
            <Text style={[styles.date, active && styles.textActive]}>{formatShort(day.date)}</Text>
            <Text style={[styles.price, active && styles.textActive]}>
              {day.minPrice != null ? formatMoney(day.minPrice) : "—"}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: { gap: 8, paddingHorizontal: 20, paddingVertical: 8 },
    item: {
      width: 68,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: colors.card,
      alignItems: "center",
      boxShadow: colors.shadow,
    },
    itemActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    weekday: { fontSize: 10, color: colors.muted },
    date: { fontSize: 12, fontWeight: "700", color: colors.text, marginTop: 2 },
    price: { fontSize: 12, fontWeight: "800", color: colors.primary, marginTop: 2 },
    textActive: { color: colors.white },
  });
