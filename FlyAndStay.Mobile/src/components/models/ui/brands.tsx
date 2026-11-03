import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AirlineBrand } from "@/api/types";
import Catalog from "@/components/shared/ui/catalog";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  brands: AirlineBrand[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;

  selectedSlug: string | null;
  onSelect: (slug: string) => void;
};

export default function Brands({ brands, loading, error, onRetry, selectedSlug, onSelect }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Catalog
      horizontal
      data={brands}
      loading={loading}
      error={error}
      onRetry={onRetry}
      keyExtractor={(b) => b.slug}
      contentContainerStyle={styles.list}
      emptyTitle="No airlines"
      renderItem={({ item }) => {
        const active = item.slug === selectedSlug;
        return (
          <Pressable style={[styles.card, active && styles.cardActive]} onPress={() => onSelect(item.slug)}>
            <View style={[styles.logo, { backgroundColor: item.color }]}>
              <Text style={styles.logoText}>{item.code}</Text>
            </View>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.fleet}>{item.fleetSize} aircraft</Text>
          </Pressable>
        );
      }}
    />
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    list: { paddingHorizontal: 20, paddingVertical: 6 },
    card: {
      width: 112,
      alignItems: "center",
      gap: 6,
      padding: 12,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: "transparent",
      backgroundColor: colors.card,
      boxShadow: colors.shadow,
    },
    cardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    logo: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
    logoText: { color: colors.white, fontWeight: "800", fontSize: 14 },
    name: { fontSize: 12, fontWeight: "700", color: colors.text, textAlign: "center", minHeight: 30 },
    fleet: { fontSize: 11, color: colors.muted },
  });
