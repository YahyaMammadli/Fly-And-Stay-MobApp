import { useEffect, useMemo, useRef } from "react";
import { Animated, DimensionValue, StyleSheet, View } from "react-native";

import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type BlockProps = { width?: DimensionValue; height: number; radius?: number };

export function SkeletonBlock({ width = "100%", height, radius = 16 }: BlockProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 750, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.block, { width, height, borderRadius: radius, opacity }]} />;
}

type ListProps = { count?: number; height?: number; horizontal?: boolean };

export default function SkeletonList({ count = 4, height = 120, horizontal = false }: ListProps) {
  return (
    <View style={horizontal ? skeletonStyles.row : skeletonStyles.column}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonBlock key={i} width={horizontal ? 120 : "100%"} height={height} />
      ))}
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  column: { gap: 12 },
  row: { flexDirection: "row", gap: 12 },
});

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    block: { backgroundColor: colors.skeleton },
  });
