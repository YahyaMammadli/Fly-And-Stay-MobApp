import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { ThemeColors } from "@/constants/theme";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";

type Props = TextInputProps & {
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
  password?: boolean;
};

export default function AuthField({ icon, error, password, style, ...inputProps }: Props) {
  const { colors } = useTheme();
  const { t } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.field}>
      <View style={[styles.wrapper, !!error && styles.wrapperError]}>
        <Ionicons name={icon} size={20} color={colors.muted} />
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.muted}
          secureTextEntry={password ? hidden : false}
          {...inputProps}
        />
        {password && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons name={hidden ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{t(error)}</Text>}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  field: { marginBottom: 16 },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: colors.inputBackground,
  },
  wrapperError: { borderColor: colors.error },
  input: { flex: 1, height: "100%", fontSize: 15, color: colors.text },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 8 },
});
