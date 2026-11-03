import { Ionicons } from "@expo/vector-icons";
import { ComponentProps, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppNotification, NotificationType } from "@/api/types";
import { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatRelative } from "@/utils/relative-time";

type IconName = ComponentProps<typeof Ionicons>["name"];

type Props = { notification: AppNotification; onPress: () => void };

const ICONS: Record<NotificationType, IconName> = {
  BookingConfirmed: "checkmark-circle",
  BookingCancelled: "close-circle",
  FlightReminder: "airplane",
  PasswordChanged: "shield-checkmark",
  Info: "information-circle",
};

export default function NotificationCard({ notification, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const tint =
    notification.type === "BookingConfirmed"
      ? colors.success
      : notification.type === "BookingCancelled"
        ? colors.error
        : colors.primary;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, !notification.isRead && styles.unread, pressed && { opacity: 0.9 }]}
      onPress={onPress}
    >
      <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={ICONS[notification.type]} size={22} color={tint} />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !notification.isRead && styles.titleUnread]} numberOfLines={1}>
            {notification.title}
          </Text>
          {!notification.isRead && <View style={styles.dot} />}
        </View>
        <Text style={styles.text} numberOfLines={3}>
          {notification.body}
        </Text>
        <Text style={styles.time}>{formatRelative(notification.createdAt)}</Text>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      gap: 14,
      padding: 14,
      borderRadius: 20,
      backgroundColor: colors.card,
      boxShadow: colors.shadow,
    },
    unread: { borderWidth: 1.5, borderColor: colors.primary },
    icon: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    body: { flex: 1 },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    title: { flex: 1, fontSize: 15, fontWeight: "600", color: colors.text },
    titleUnread: { fontWeight: "800" },
    dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary },
    text: { fontSize: 13, lineHeight: 19, color: colors.muted, marginTop: 3 },
    time: { fontSize: 11, color: colors.muted, marginTop: 8 },
  });
