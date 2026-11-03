import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Sheet from "@/components/shared/ui/sheet";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type Option = { value: string; title: string; subtitle?: string; badge?: string };

type Props = {
  visible: boolean;
  title: string;
  options: Option[];
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

export default function OptionSheet({ visible, title, options, value, onSelect, onClose }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Sheet visible={visible} title={title} onClose={onClose}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={styles.row}
            onPress={() => {
              onSelect(option.value);
              onClose();
            }}
          >
            {!!option.badge && <Text style={styles.badge}>{option.badge}</Text>}
            <View style={styles.text}>
              <Text style={[styles.title, active && styles.titleActive]}>{option.title}</Text>
              {!!option.subtitle && <Text style={styles.subtitle}>{option.subtitle}</Text>}
            </View>
            {active && <Ionicons name="checkmark" size={20} color={colors.primary} />}
          </Pressable>
        );
      })}
    </Sheet>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    badge: { fontSize: 22, minWidth: 30, textAlign: "center" },
    text: { flex: 1 },
    title: { fontSize: 15, color: colors.text },
    titleActive: { color: colors.primary, fontWeight: "700" },
    subtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
  });
