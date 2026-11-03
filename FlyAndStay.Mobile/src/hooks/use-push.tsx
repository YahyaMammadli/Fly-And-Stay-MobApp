import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Href, router } from "expo-router";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { devicesApi } from "@/api/devices";
import { getErrorMessage } from "@/api/client";
import { notificationsApi } from "@/api/notifications";
import { PUSH_ENABLED_KEY, PUSH_PROMPTED_KEY, PUSH_TOKEN_KEY } from "@/constants/storage";
import { useAuth } from "@/hooks/use-auth";
import { getPermissionState, isPushSupported, PermissionState, registerForPush } from "@/utils/push";

type PushContextValue = {
  supported: boolean;
  enabled: boolean;
  permission: PermissionState;
  unreadCount: number;
  busy: boolean;
  message: string | null;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  sendTest: () => Promise<void>;
  refreshUnread: () => Promise<void>;
};

const PushContext = createContext<PushContextValue | null>(null);

function openFromNotification(notification: Notifications.Notification) {
  const url = notification.request.content.data?.url;
  if (typeof url === "string") router.push(url as Href);
}

export function PushProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<PermissionState>("undetermined");
  const [unreadCount, setUnreadCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refreshUnread = useCallback(async () => {
    const result = await notificationsApi.unreadCount().catch(() => null);
    if (result) setUnreadCount(result.count);
  }, []);

  const register = useCallback(async (prompt: boolean) => {
    try {
      const result = await registerForPush({ prompt });
      setPermission(await getPermissionState());

      if (result.status !== "ready") {
        setEnabled(false);
        setMessage(
          result.status === "denied"
            ? "Notifications are blocked. Allow them in the system settings."
            : result.reason,
        );
        return;
      }

      await devicesApi.register({ token: result.token, platform: Platform.OS });
      await AsyncStorage.multiSet([
        [PUSH_TOKEN_KEY, result.token],
        [PUSH_ENABLED_KEY, "1"],
      ]);
      setEnabled(true);
      setMessage(null);
    } catch (error) {
      setEnabled(false);
      setMessage(getErrorMessage(error, "Could not turn notifications on."));
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setEnabled(false);
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
    setBusy(false);
  }, []);

  const sendTest = useCallback(async () => {
    setBusy(true);
    try {
      await devicesApi.sendTest();
      setMessage("Test notification sent. It should arrive in a few seconds.");
      setTimeout(() => void refreshUnread(), 2000);
    } catch (error) {
      setMessage(getErrorMessage(error, "Could not send the test notification."));
    } finally {
      setBusy(false);
    }
  }, [refreshUnread]);

  const value = useMemo<PushContextValue>(
    () => ({
      supported: isPushSupported,
      enabled,
      permission,
      unreadCount,
      busy,
      message,
      enable,
      disable,
      sendTest,
      refreshUnread,
    }),
    [enabled, permission, unreadCount, busy, message, enable, disable, sendTest, refreshUnread],
  );

  return <PushContext.Provider value={value}>{children}</PushContext.Provider>;
}

export function usePush() {
  const ctx = useContext(PushContext);
  if (!ctx) throw new Error("usePush must be used inside <PushProvider>");
  return ctx;
}
