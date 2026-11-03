import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Airport } from "@/api/types";
import Catalog from "@/components/shared/ui/catalog";
import Sheet from "@/components/shared/ui/sheet";
import { ThemeColors } from "@/constants/theme";
import { useAirports } from "@/hooks/use-airports";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  visible: boolean;
  title: string;

  mode?: "airport" | "city";
  onSelect: (airport: Airport) => void;
  onClose: () => void;
};

const SEARCH_KEYS: (keyof Airport)[] = ["city", "code", "country", "name"];

export default function AirportPicker({ visible, title, mode = "airport", onSelect, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const airports = useAirports();

  return (
    <Sheet visible={visible} title={title} onClose={onClose} scroll={false}>
      <View style={styles.list}>
        <Catalog
          data={airports}
          keyExtractor={(a) => a.code}
          searchKeys={SEARCH_KEYS}
          searchPlaceholder={mode === "city" ? "Search city" : "Search city or airport"}
          gap={0}
          emptyTitle="No places found"
          emptyText="Try another name or code."
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.city}>
                  {item.city}, {item.country}
                </Text>
                {mode === "airport" && <Text style={styles.name}>{item.name}</Text>}
              </View>
              {mode === "airport" && (
                <View style={styles.code}>
                  <Text style={styles.codeText}>{item.code}</Text>
                </View>
              )}
            </Pressable>
          )}
        />
      </View>
    </Sheet>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    list: { height: 440 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    city: { fontSize: 15, fontWeight: "700", color: colors.text },
    name: { fontSize: 12, color: colors.muted, marginTop: 2 },
    code: { paddingHorizontal: 10, height: 26, borderRadius: 13, backgroundColor: colors.primarySoft, justifyContent: "center" },
    codeText: { fontSize: 12, fontWeight: "800", color: colors.primary },
  });
