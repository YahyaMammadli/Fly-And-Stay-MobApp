import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Href } from "expo-router";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppState, Platform } from "react-native";

import { bookingsApi } from "@/api/bookings";
import { devicesApi } from "@/api/devices";
import { getErrorMessage } from "@/api/client";
import { notificationsApi } from "@/api/notifications";
import { PROMO_ENABLED_KEY, PUSH_ENABLED_KEY, PUSH_PROMPTED_KEY, PUSH_TOKEN_KEY } from "@/constants/storage";
import { useAuth } from "@/hooks/use-auth";
import { usePreferences } from "@/hooks/use-preferences";
import {
  cancelFlightReminders,
  cancelPromoNotifications,
  scheduleFlightReminders,
  schedulePromoNotifications,
} from "@/utils/local-notifications";
import { openNotificationUrl } from "@/utils/notification-routing";
import {
  ANDROID_CHANNEL_ID,
  getPermissionState,
  isPushSupported,
  PermissionState,
  registerForPush,
} from "@/utils/push";

type PushContextValue = {
  supported: boolean;
  /** Notifications are allowed on this device (local reminders and promos work). */
  enabled: boolean;
  /** The device is also registered for server push (needs a development/production build with an EAS project). */
  remoteReady: boolean;
  promosEnabled: boolean;
  permission: PermissionState;
  unreadCount: number;
  busy: boolean;
  message: string | null;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  setPromosEnabled: (on: boolean) => void;
  sendTest: () => Promise<void>;
  refreshUnread: () => Promise<void>;
  syncReminders: () => Promise<void>;
};

const PushContext = createContext<PushContextValue | null>(null);

function openFromNotification(notification: Notifications.Notification) {
  const url = notification.request.content.data?.url;
  if (typeof url === "string") openNotificationUrl(url as Href);
}

export function PushProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { t } = usePreferences();
  const [enabled, setEnabled] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const [promosEnabled, setPromosEnabledState] = useState(true);
  const [permission, setPermission] = useState<PermissionState>("undetermined");
  const [unreadCount, setUnreadCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refreshUnread = useCallback(async () => {
    const result = await notificationsApi.unreadCount().catch(() => null);
    if (result) setUnreadCount(result.count);
  }, []);

  const register = useCallback(
    async (prompt: boolean) => {
      try {
        const result = await registerForPush({ prompt });
        setPermission(await getPermissionState());

        if (result.status === "denied") {
          setEnabled(false);
          setRemoteReady(false);
          setMessage(t("Notifications are blocked. Allow them in the system settings."));
          return;
        }

        // Permission is granted: on-device reminders and offers work from here on.
        setEnabled(true);
        setMessage(null);

        if (result.status === "unavailable") {
          setRemoteReady(false);
          if (__DEV__) setMessage(result.reason);
          return;
        }

        await devicesApi.register({ token: result.token, platform: Platform.OS });
        await AsyncStorage.multiSet([
          [PUSH_TOKEN_KEY, result.token],
          [PUSH_ENABLED_KEY, "1"],
        ]);
        setRemoteReady(true);
      } catch (error) {
        setRemoteReady(false);
        setMessage(getErrorMessage(error, t("Could not turn notifications on.")));
      }
    },
    [t],
  );

  const syncReminders = useCallback(async () => {
    if (!isPushSupported) return;
    try {
      if (!user || !enabled) {
        await Promise.all([cancelPromoNotifications(), cancelFlightReminders()]);
        return;
      }

      if (promosEnabled) await schedulePromoNotifications(t);
      else await cancelPromoNotifications();

      const bookings = await bookingsApi.mine().catch(() => null);
      if (bookings) await scheduleFlightReminders(bookings, t, remoteReady);
    } catch {
      // Scheduling is best effort; the next app start retries.
    }
  }, [user, enabled, promosEnabled, remoteReady, t]);

  useEffect(() => {
    AsyncStorage.getItem(PROMO_ENABLED_KEY).then((flag) => setPromosEnabledState(flag !== "0"));
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setEnabled(false);
      setRemoteReady(false);
      return;
    }

    let active = true;

    (async () => {
      void refreshUnread();
      if (!isPushSupported) return;

      const [[, flag], [, prompted]] = await AsyncStorage.multiGet([PUSH_ENABLED_KEY, PUSH_PROMPTED_KEY]);
      setPermission(await getPermissionState());
      if (!active || flag === "0") return;

      await AsyncStorage.setItem(PUSH_PROMPTED_KEY, "1");
      await register(prompted !== "1");
    })();

    return () => {
      active = false;
    };
  }, [user, refreshUnread, register]);

  // Re-plan local notifications on login, on settings changes and every time the app comes back to the foreground.
  useEffect(() => {
    void syncReminders();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void syncReminders();
    });
    return () => sub.remove();
  }, [syncReminders]);

  useEffect(() => {
    if (!user || !isPushSupported) return;

    const received = Notifications.addNotificationReceivedListener(() => {
      void refreshUnread();
    });
    const responded = Notifications.addNotificationResponseReceivedListener((response) => {
      openFromNotification(response.notification);
      void refreshUnread();
    });

    const last = Notifications.getLastNotificationResponse();
    if (last?.notification) {
      openFromNotification(last.notification);
      Notifications.clearLastNotificationResponse();
    }

    return () => {
      received.remove();
      responded.remove();
    };
  }, [user, refreshUnread]);

  const enable = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    await AsyncStorage.setItem(PUSH_ENABLED_KEY, "1");
    await register(true);
    setBusy(false);
  }, [register]);

  const disable = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    const token = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (token) await devicesApi.unregister(token).catch(() => undefined);
    await AsyncStorage.multiRemove([PUSH_TOKEN_KEY]);
    await AsyncStorage.setItem(PUSH_ENABLED_KEY, "0");
    setEnabled(false);
    setRemoteReady(false);
    setBusy(false);
  }, []);

  const setPromosEnabled = useCallback((on: boolean) => {
    setPromosEnabledState(on);
    AsyncStorage.setItem(PROMO_ENABLED_KEY, on ? "1" : "0");
  }, []);

  const sendTest = useCallback(async () => {
    setBusy(true);
    try {
      if (remoteReady) {
        await devicesApi.sendTest();
      } else {
        await Notifications.scheduleNotificationAsync({
          content: { title: "Fly&Stay", body: t("Notifications are working 🎉"), data: { url: "/notifications" } },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 3,
            channelId: ANDROID_CHANNEL_ID,
          },
        });
      }
      setMessage(t("Test notification sent. It should arrive in a few seconds."));
      setTimeout(() => void refreshUnread(), 2000);
    } catch (error) {
      setMessage(getErrorMessage(error, t("Could not send the test notification.")));
    } finally {
      setBusy(false);
    }
  }, [remoteReady, refreshUnread, t]);

  const value = useMemo<PushContextValue>(
    () => ({
      supported: isPushSupported,
      enabled,
      remoteReady,
      promosEnabled,
      permission,
      unreadCount,
      busy,
      message,
      enable,
      disable,
      setPromosEnabled,
      sendTest,
      refreshUnread,
      syncReminders,
    }),
    [
      enabled,
      remoteReady,
      promosEnabled,
      permission,
      unreadCount,
      busy,
      message,
      enable,
      disable,
      setPromosEnabled,
      sendTest,
      refreshUnread,
      syncReminders,
    ],
  );

  return <PushContext.Provider value={value}>{children}</PushContext.Provider>;
}

export function usePush() {
  const ctx = useContext(PushContext);
  if (!ctx) throw new Error("usePush must be used inside <PushProvider>");
  return ctx;
}
