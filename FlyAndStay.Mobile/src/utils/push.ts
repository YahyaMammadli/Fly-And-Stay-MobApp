import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

export type PermissionState = "granted" | "denied" | "undetermined";

export type PushRegistration =
  | { status: "ready"; token: string }
  | { status: "denied"; canAskAgain: boolean }
  | { status: "unavailable"; reason: string };

export const isPushSupported = Platform.OS === "android" || Platform.OS === "ios";

if (isPushSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Fly&Stay",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#1A66E8",
  });
}

export async function getPermissionState(): Promise<PermissionState> {
  if (!isPushSupported) return "denied";
  const { status } = await Notifications.getPermissionsAsync();
  return status as PermissionState;
}

export async function registerForPush(options: { prompt: boolean }): Promise<PushRegistration> {
  if (!isPushSupported) {
    return { status: "unavailable", reason: "Push notifications are not available on this platform." };
  }

  await ensureAndroidChannel();

  let permissions = await Notifications.getPermissionsAsync();
  if (!permissions.granted && options.prompt && permissions.canAskAgain) {
    permissions = await Notifications.requestPermissionsAsync();
  }
  if (!permissions.granted) {
    return { status: "denied", canAskAgain: permissions.canAskAgain };
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    return { status: "unavailable", reason: "Missing EAS project id. Run `eas init` once in this project." };
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return { status: "ready", token: token.data };
  } catch (error) {
    return {
      status: "unavailable",
      reason: error instanceof Error ? error.message : "Could not get a push token.",
    };
  }
}
