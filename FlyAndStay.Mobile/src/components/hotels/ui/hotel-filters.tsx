import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { Amenity } from "@/api/types";
import Button from "@/components/shared/ui/button";
import Chip from "@/components/shared/ui/chip";
import Sheet from "@/components/shared/ui/sheet";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { DISTANCE_OPTIONS, emptyHotelFilters, HotelFilters, RATING_OPTIONS, STAR_OPTIONS } from "../filters";

export type FilterSection = "price" | "rating" | "more";

type Props = {
  section: FilterSection;
  amenities: Amenity[];
  value: HotelFilters;
  onApply: (filters: HotelFilters) => void;
  onClose: () => void;
};

const TITLES: Record<FilterSection, string> = { price: "Price per night", rating: "Rating & stars", more: "More filters" };

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export default function HotelFiltersSheet({ section, amenities, value, onApply, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [draft, setDraft] = useState<HotelFilters>(value);
  const set = (patch: Partial<HotelFilters>) => setDraft((d) => ({ ...d, ...patch }));

  const resetSection = () => {
    if (section === "price") set({ minPrice: "", maxPrice: "" });
    else if (section === "rating") set({ minRating: null, stars: [] });
    else set({ amenities: [], maxDistance: null });
  };

  return (
    <Sheet
      visible
      title={TITLES[section]}
      onClose={onClose}
      footer={
        <>
          <Button title="Reset" variant="outline" style={{ flex: 1 }} onPress={resetSection} />
          <Button
            title="Apply"
            style={{ flex: 2 }}
            onPress={() => {
              onApply(draft);
              onClose();
            }}
          />
        </>
      }
    >
      {section === "price" && (
        <View>
          <Text style={styles.label}>Cheapest room, USD per night</Text>
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
      )}

      {section === "rating" && (
        <>
          <View>
            <Text style={styles.label}>Guest rating</Text>
            <View style={styles.wrap}>
              {RATING_OPTIONS.map((r) => (
                <Chip
                  key={r}
                  label={`${r}+`}
                  icon="star"
                  active={draft.minRating === r}
                  onPress={() => set({ minRating: draft.minRating === r ? null : r })}
                />
              ))}
            </View>
          </View>
          <View>
            <Text style={styles.label}>Hotel class</Text>
            <View style={styles.wrap}>
              {STAR_OPTIONS.map((s) => (
                <Chip
                  key={s}
                  label={`${s} stars`}
                  active={draft.stars.includes(s)}
                  onPress={() => set({ stars: toggle(draft.stars, s) })}
                />
              ))}
            </View>
          </View>
        </>
      )}

      {section === "more" && (
        <>
          <View>
            <Text style={styles.label}>Amenities</Text>
            <View style={styles.wrap}>
              {amenities.map((a) => (
                <Chip
                  key={a.code}
                  label={a.name}
                  active={draft.amenities.includes(a.code)}
                  onPress={() => set({ amenities: toggle(draft.amenities, a.code) })}
                />
              ))}
            </View>
          </View>
          <View>
            <Text style={styles.label}>Distance to center</Text>
            <View style={styles.wrap}>
              {DISTANCE_OPTIONS.map((d) => (
                <Chip
                  key={d}
                  label={`Up to ${d} km`}
                  active={draft.maxDistance === d}
                  onPress={() => set({ maxDistance: draft.maxDistance === d ? null : d })}
                />
              ))}
            </View>
          </View>
        </>
      )}
    </Sheet>
  );
}

export { emptyHotelFilters };

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
  });
