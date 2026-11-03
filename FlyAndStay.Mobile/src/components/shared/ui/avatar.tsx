import { Image } from "expo-image";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { API_URL } from "@/api/client";
import { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

export default function Avatar({ size = 44 }: { size?: number }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user, accessToken } = useAuth();

  if (user?.hasPhoto && accessToken) {
    return (
      <Image

        source={{
          uri: `${API_URL}/api/users/me/photo?v=${user.photoVersion}`,
          headers: { Authorization: `Bearer ${accessToken}` },
        }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primarySoft }}
        contentFit="cover"
      />
    );
  }

  const letter = (user?.name?.trim()[0] ?? "?").toUpperCase();
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.letter, { fontSize: size * 0.42 }]}>{letter}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    fallback: { backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    letter: { color: colors.primary, fontWeight: "800" },
  });
