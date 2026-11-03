import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useMemo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;

  footer?: ReactNode;

  scroll?: boolean;
};

export default function Sheet({ visible, title, onClose, children, footer, scroll = true }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          {scroll ? (
            <ScrollView
              style={styles.body}
              contentContainerStyle={styles.bodyContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={styles.body}>{children}</View>
          )}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: "flex-end" },
    backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
    sheet: {
      maxHeight: "88%",
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 8 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
    title: { fontSize: 18, fontWeight: "800", color: colors.text },
    body: { flexGrow: 0 },
    bodyContent: { paddingBottom: 8, gap: 20 },
    footer: { flexDirection: "row", gap: 12, paddingTop: 12 },
  });
