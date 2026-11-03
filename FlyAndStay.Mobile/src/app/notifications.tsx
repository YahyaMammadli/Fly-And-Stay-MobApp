import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { notificationsApi } from "@/api/notifications";
import { AppNotification } from "@/api/types";
import NotificationCard from "@/components/notifications/ui/notification-card";
import Catalog from "@/components/shared/ui/catalog";
import ScreenHeader from "@/components/shared/ui/screen-header";
import { ThemeColors } from "@/constants/theme";
import { useFetch } from "@/hooks/use-fetch";
import { usePush } from "@/hooks/use-push";
import { useTheme } from "@/hooks/use-theme";

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { refreshUnread } = usePush();

  const { data, loading, error, reload } = useFetch((signal) => notificationsApi.list(signal), []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const items = data ?? [];
  const hasUnread = items.some((n) => !n.isRead);

  const open = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await notificationsApi.markRead(notification.id).catch(() => undefined);
      reload();
      void refreshUnread();
    }
    if (notification.bookingId) router.push("/trips");
  };

  const markAll = async () => {
    await notificationsApi.markAllRead().catch(() => undefined);
    reload();
    void refreshUnread();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader
        title="Notifications"
        fallbackHref="/home"
        right={
          hasUnread ? (
            <Pressable onPress={markAll} hitSlop={8}>
              <Text style={styles.markAll}>Mark all read</Text>
            </Pressable>
          ) : undefined
        }
      />
      <Catalog
        data={items}
        loading={loading}
        error={error}
        onRetry={reload}
        refreshing={loading && !!data}
        onRefresh={reload}
        skeletonHeight={96}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        emptyTitle="No notifications yet"
        emptyText="Booking updates and flight reminders will show up here."
        renderItem={({ item }) => <NotificationCard notification={item} onPress={() => open(item)} />}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    list: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 6 },
    markAll: { color: colors.primary, fontSize: 13, fontWeight: "700" },
  });
