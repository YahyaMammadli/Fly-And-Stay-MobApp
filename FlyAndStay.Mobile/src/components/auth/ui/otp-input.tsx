import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputInstance, View } from "react-native";

import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
};

export default function OtpInput({ value, onChange, length = 6, error }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const inputRef = useRef<TextInputInstance>(null);
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={() => inputRef.current?.focus()} style={styles.row}>
        {Array.from({ length }, (_, i) => (
          <View
            key={i}
            style={[styles.box, focused && i === activeIndex && styles.boxActive, !!error && styles.boxError]}
          >
            <Text style={styles.char}>{value[i] ?? ""}</Text>
          </View>
        ))}
      </Pressable>
      <TextInput
        ref={inputRef}
        style={styles.hidden}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        maxLength={length}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: { marginBottom: 16 },
    row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
    box: {
      flex: 1,
      height: 54,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.inputBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    boxActive: { borderColor: colors.primary, borderWidth: 2 },
    boxError: { borderColor: colors.error },
    char: { fontSize: 22, fontWeight: "700", color: colors.text },
    hidden: { position: "absolute", opacity: 0, width: 1, height: 1 },
    errorText: { color: colors.error, fontSize: 12, marginTop: 6, marginLeft: 4 },
  });
