import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { travelApi } from "@/api/travel";
import Brands from "@/components/models/ui/brands";
import Models from "@/components/models/ui/models";
import ScreenHeader from "@/components/shared/ui/screen-header";
import { ThemeColors } from "@/constants/theme";
import { useFetch } from "@/hooks/use-fetch";
import { useTheme } from "@/hooks/use-theme";

export default function ModelsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const { data: brands, loading, error, reload } = useFetch((signal) => travelApi.airlines(signal), []);

  const currentSlug = selectedSlug ?? brands?.[0]?.slug ?? null;
  const currentBrand = brands?.find((b) => b.slug === currentSlug) ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Airlines & fleet" subtitle="Pick an airline to see its aircraft" fallbackHref="/profile" />

      <View style={styles.brands}>
        <Brands
          brands={brands ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          selectedSlug={currentSlug}
          onSelect={setSelectedSlug}
        />
      </View>

      <View style={styles.models}>
        <Models selectedSlug={currentSlug} brand={currentBrand} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    brands: { minHeight: 150 },
    models: { flex: 1 },
  });
