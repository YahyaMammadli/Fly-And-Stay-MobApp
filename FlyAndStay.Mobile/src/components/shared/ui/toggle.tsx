import { useEffect, useMemo, useState } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

const TRACK_WIDTH = 50;
const TRACK_HEIGHT = 30;
const THUMB = 24;
const GAP = (TRACK_HEIGHT - THUMB) / 2;

export default function Toggle({ value, onValueChange, disabled, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [progress] = useState(() => new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(progress, { toValue: value ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [value, progress]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [GAP, TRACK_WIDTH - THUMB - GAP] });
  const backgroundColor = progress.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.primary] });

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      style={disabled && styles.disabled}
    >
      <Animated.View style={[styles.track, { backgroundColor }]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    track: { width: TRACK_WIDTH, height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2, justifyContent: "center" },
    thumb: {
      width: THUMB,
      height: THUMB,
      borderRadius: THUMB / 2,
      backgroundColor: colors.white,
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)",
    },
    disabled: { opacity: 0.5 },
  });
