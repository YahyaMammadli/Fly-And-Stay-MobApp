import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { travelApi } from "@/api/travel";
import { Destination } from "@/api/types";
import DestinationCard from "@/components/home/ui/destination-card";
import SearchCard from "@/components/home/ui/search-card";
import Avatar from "@/components/shared/ui/avatar";
import Catalog from "@/components/shared/ui/catalog";
import { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useFetch } from "@/hooks/use-fetch";
import { useLocation } from "@/hooks/use-location";
import { usePreferences } from "@/hooks/use-preferences";
import { usePush } from "@/hooks/use-push";
import { useTheme } from "@/hooks/use-theme";
import { useTrip } from "@/hooks/use-trip";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 18) return "Good afternoon,";
  return "Good evening,";
}

export default function HomeScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t } = usePreferences();
  const { requestOnce } = useLocation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { user } = useAuth();
  const { search, updateSearch } = useTrip();
  const { unreadCount } = usePush();
  // "From $X" prices follow the chosen departure airport.
  const originCode = search.from?.code ?? null;
  const { data, loading, error, reload } = useFetch((signal) => travelApi.destinations(originCode, signal), [originCode]);

  // Ask for the location once, so "From" and the currency can follow where the user is.
  useEffect(() => {
    void requestOnce();
  }, [requestOnce]);

  const openDestination = (d: Destination) => {
    updateSearch({
      to: { code: d.airportCode, city: d.city, country: d.country, name: d.airportName, latitude: d.latitude, longitude: d.longitude },
    });
    router.navigate("/flights");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.navigate("/profile")} style={styles.avatar}>
            <Avatar size={46} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{t(greeting())}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {user?.name ?? t("Traveler")} 👋
            </Text>
          </View>
          <Pressable
            style={styles.themeButton}
            onPress={() => router.push("/notifications")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t("Notifications")}
          >
            <Ionicons name={unreadCount > 0 ? "notifications" : "notifications-outline"} size={20} color={colors.primary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={styles.themeButton}
            onPress={toggleTheme}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t(isDark ? "Switch to light theme" : "Switch to dark theme")}
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.circleLarge} />
          <View style={styles.circleSmall} />
          <Ionicons name="airplane" size={120} color="rgba(255,255,255,0.12)" style={styles.heroPlane} />
          <Text style={styles.heroTitle}>{t("Where to next?")}</Text>
          <Text style={styles.heroSub}>{t("Flights and hotels in one place")}</Text>
        </View>

        <View style={styles.searchCard}>
          <SearchCard />
        </View>

        <View style={styles.banners}>
          <Pressable style={styles.banner} onPress={() => router.navigate("/hotels")}>
            <View style={styles.bannerIcon}>
              <Ionicons name="bed" size={22} color={colors.primary} />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>{t("Find your perfect stay")}</Text>
              <Text style={styles.bannerSub}>{t("Hotels in top destinations")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          <Pressable style={styles.banner} onPress={() => router.push("/explore")}>
            <View style={styles.bannerIcon}>
              <Ionicons name="map" size={22} color={colors.primary} />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>{t("Explore on the map")}</Text>
              <Text style={styles.bannerSub}>
                {search.from ? t("Cheapest fares from {city}", { city: search.from.city }) : t("Cheapest fares to every destination")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>

          <Pressable style={styles.banner} onPress={() => router.push("/models")}>
            <View style={styles.bannerIcon}>
              <Ionicons name="airplane" size={22} color={colors.primary} />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>{t("Airlines & fleet")}</Text>
              <Text style={styles.bannerSub}>{t("See which aircraft each airline flies")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>{t("Popular destinations")}</Text>
        </View>
        <Catalog
          horizontal
          data={data ?? []}
          loading={loading}
          error={error}
          onRetry={reload}
          skeletonHeight={150}
          keyExtractor={(d) => d.airportCode}
          contentContainerStyle={styles.destinations}
          emptyTitle={t("No destinations yet")}
          emptyText={t("Flights will appear here when they are available.")}
          renderItem={({ item }) => <DestinationCard item={item} onPress={() => openDestination(item)} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: 40 },
    header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
    avatar: { borderRadius: 25, borderWidth: 2, borderColor: colors.card, boxShadow: colors.shadow },
    headerText: { flex: 1 },
    badge: {
      position: "absolute",
      top: -2,
      right: -2,
      minWidth: 18,
      height: 18,
      paddingHorizontal: 4,
      borderRadius: 9,
      backgroundColor: colors.error,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: { color: colors.white, fontSize: 10, fontWeight: "800" },
    greeting: { fontSize: 13, color: colors.muted },
    name: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 1 },
    themeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      boxShadow: colors.shadow,
    },
    hero: {
      marginHorizontal: 20,
      borderRadius: 28,
      backgroundColor: colors.primary,
      paddingHorizontal: 22,
      paddingTop: 24,
      paddingBottom: 72,
      overflow: "hidden",
    },
    circleLarge: {
      position: "absolute",
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: "rgba(255,255,255,0.10)",
      right: -60,
      top: -80,
    },
    circleSmall: {
      position: "absolute",
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "rgba(255,255,255,0.08)",
      left: -30,
      bottom: -40,
    },
    heroPlane: { position: "absolute", right: 10, bottom: 18, transform: [{ rotate: "-20deg" }] },
    heroTitle: { fontSize: 28, fontWeight: "800", color: colors.white },
    heroSub: { fontSize: 14, color: "rgba(255,255,255,0.85)", marginTop: 4 },
    searchCard: {
      marginHorizontal: 28,
      marginTop: -48,
      padding: 16,
      borderRadius: 24,
      backgroundColor: colors.card,
      boxShadow: colors.shadowStrong,
    },
    banners: { paddingHorizontal: 20, gap: 12, marginTop: 24 },
    banner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 14,
      boxShadow: colors.shadow,
    },
    bannerIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    bannerText: { flex: 1 },
    bannerTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
    bannerSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
    sectionRow: { paddingHorizontal: 20, marginTop: 28, marginBottom: 14 },
    section: { fontSize: 18, fontWeight: "800", color: colors.text },
    destinations: { paddingHorizontal: 20, paddingBottom: 8 },
  });
