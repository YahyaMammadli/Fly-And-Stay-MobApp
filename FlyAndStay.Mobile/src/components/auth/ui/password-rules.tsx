import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { ThemeColors } from "@/constants/theme";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import { PASSWORD_RULES } from "./auth.schema";

export default function PasswordRules({ value }: { value: string }) {
  const { colors } = useTheme();
  const { t } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.list}>
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <View key={rule.label} style={styles.rule}>
            <Ionicons
              name={ok ? "checkmark-circle" : "ellipse-outline"}
              size={15}
              color={ok ? colors.success : colors.muted}
            />
            <Text style={[styles.text, ok && styles.textOk]}>{t(rule.label)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    list: { marginTop: -8, marginBottom: 14, marginLeft: 8, gap: 4 },
    rule: { flexDirection: "row", alignItems: "center", gap: 6 },
    text: { fontSize: 12, color: colors.muted },
    textOk: { color: colors.success },
  });
