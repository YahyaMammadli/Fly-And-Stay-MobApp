import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { useTheme } from "@/hooks/use-theme";

type IconName = keyof typeof Ionicons.glyphMap;

const tabs: { name: string; title: string; icon: IconName; iconOutline: IconName }[] = [
  { name: "home", title: "Home", icon: "home", iconOutline: "home-outline" },
  { name: "flights", title: "Flights", icon: "paper-plane", iconOutline: "paper-plane-outline" },
  { name: "hotels", title: "Hotels", icon: "bed", iconOutline: "bed-outline" },
  { name: "trips", title: "Trips", icon: "briefcase", iconOutline: "briefcase-outline" },
  { name: "profile", title: "Profile", icon: "person", iconOutline: "person-outline" },
];

export default function TabsLayout() {
  const { colors } = useTheme();

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
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
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
            title: tab.title,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? tab.icon : tab.iconOutline} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
