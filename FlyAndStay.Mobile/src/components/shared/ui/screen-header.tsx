import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ReactNode, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;

  fallbackHref?: "/home" | "/flights" | "/hotels" | "/trips" | "/profile";
};

export default function ScreenHeader({ title, subtitle, right, fallbackHref = "/home" }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(fallbackHref);
  };

  return (
    <View style={styles.row}>
      <Pressable onPress={goBack} hitSlop={10} style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </Pressable>
      <View style={styles.titles}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
    back: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    titles: { flex: 1 },
    title: { fontSize: 18, fontWeight: "800", color: colors.text },
    subtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
  });
