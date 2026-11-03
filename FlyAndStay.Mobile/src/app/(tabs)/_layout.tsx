import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";
import { markTabsReady } from "@/utils/notification-routing";

type IconName = keyof typeof Ionicons.glyphMap;

const tabs: { name: string; title: string; icon: IconName; iconOutline: IconName }[] = [
  { name: "home", title: "Home", icon: "home", iconOutline: "home-outline" },
  { name: "flights", title: "Flights", icon: "paper-plane", iconOutline: "paper-plane-outline" },
  { name: "hotels", title: "Hotels", icon: "bed", iconOutline: "bed-outline" },
  { name: "trips", title: "Trips", icon: "briefcase", iconOutline: "briefcase-outline" },
  { name: "profile", title: "Profile", icon: "person", iconOutline: "person-outline" },
];

const BAR_CONTENT_HEIGHT = 58;
const BAR_BOTTOM_GAP = 12;

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = usePreferences();
  const insets = useSafeAreaInsets();
  // Keep the bar clear of the gesture/navigation area and rounded screen corners.
  const bottomPadding = insets.bottom + BAR_BOTTOM_GAP;

  useEffect(() => {
    markTabsReady();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          height: BAR_CONTENT_HEIGHT + bottomPadding,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          paddingHorizontal: 8,
          boxShadow: colors.shadowUp,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.title),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? tab.icon : tab.iconOutline} size={size} color={color as string} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
