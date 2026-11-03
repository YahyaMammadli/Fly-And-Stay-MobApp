import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps, ReactNode, useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import OptionSheet from "@/components/profile/ui/option-sheet";
import Avatar from "@/components/shared/ui/avatar";
import Button from "@/components/shared/ui/button";
import Toggle from "@/components/shared/ui/toggle";
import { CURRENCIES } from "@/constants/currencies";
import { ThemeColors, ThemePreference } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "@/hooks/use-location";
import { usePreferences } from "@/hooks/use-preferences";
import { usePush } from "@/hooks/use-push";
import { useTheme } from "@/hooks/use-theme";
import { findLanguage, LANGUAGES, LanguageCode } from "@/i18n/languages";

type IconName = ComponentProps<typeof Ionicons>["name"];
type Picker = "language" | "currency" | null;

const AUTO_CURRENCY = "auto";

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: IconName }[] = [
  { value: "auto", label: "Auto", icon: "time-outline" },
  { value: "light", label: "Light", icon: "sunny-outline" },
  { value: "dark", label: "Dark", icon: "moon-outline" },
];

export default function ProfileScreen() {
  const { colors, preference, setPreference } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { user, signOut } = useAuth();
  const push = usePush();
  const { t, language, setLanguage, currency, currencyIsAuto, setCurrency } = usePreferences();
  const geo = useLocation();
  const [picker, setPicker] = useState<Picker>(null);

  const logout = async () => {
    await signOut();
    router.replace("/auth/sign-in");
  };

  const shareLocation = () => {
    if (geo.status === "denied") Linking.openSettings();
    else void geo.requestLocation();
  };

  const locationText =
    geo.status === "granted"
      ? [geo.location?.city, geo.location?.country].filter(Boolean).join(", ") || t("Shared")
      : t("Not shared");

  const row = (icon: IconName, label: string, right: ReactNode, onPress?: () => void, last = false) => (
    <Pressable key={label} style={[styles.row, last && styles.rowLast]} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.rowLabel} numberOfLines={1}>
        {label}
      </Text>
      {right}
    </Pressable>
  );

  const valueWithChevron = (value: string) => (
    <View style={styles.rowRight}>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </View>
  );

  const chevron = <Ionicons name="chevron-forward" size={18} color={colors.muted} />;
  const lang = findLanguage(language);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t("Profile")}</Text>

        <View style={styles.hero}>
          <Avatar size={88} />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.role === "Admin" && (
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
              <Text style={styles.roleText}>{t("Administrator")}</Text>
            </View>
          )}
        </View>

        <Text style={styles.section}>{t("Account")}</Text>
        <View style={styles.menu}>
          {row("create-outline", t("Edit profile"), chevron, () => router.push("/edit-profile"))}
          {row("notifications-outline", t("Notifications"), chevron, () => router.push("/notifications"))}
          {row("airplane-outline", t("Airlines & fleet"), chevron, () => router.push("/models"), true)}
        </View>

        <Text style={styles.section}>{t("Preferences")}</Text>
        <View style={styles.menu}>
          {row("language-outline", t("Language"), valueWithChevron(`${lang.flag} ${lang.nativeName}`), () => setPicker("language"))}
          {row(
            "cash-outline",
            t("Currency"),
            valueWithChevron(currencyIsAuto ? `${currency.code} · ${t("Auto")}` : currency.code),
            () => setPicker("currency"),
          )}
          {row("location-outline", t("Location"), valueWithChevron(locationText), shareLocation)}

          <View style={styles.themeRow}>
            <View style={styles.themeHeader}>
              <View style={styles.rowIcon}>
                <Ionicons name="contrast-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.rowLabel}>{t("Theme")}</Text>
                {preference === "auto" && <Text style={styles.rowHint}>{t("Dark from 19:00, light from 07:00")}</Text>}
              </View>
            </View>
            <View style={styles.segment}>
              {THEME_OPTIONS.map((option) => {
                const active = preference === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.segmentItem, active && styles.segmentActive]}
                    onPress={() => setPreference(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Ionicons name={option.icon} size={16} color={active ? colors.white : colors.muted} />
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{t(option.label)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {push.supported && (
          <>
            <Text style={styles.section}>{t("Notifications")}</Text>
            <View style={styles.menu}>
              {row(
                "phone-portrait-outline",
                t("Push notifications"),
                <Toggle
                  value={push.enabled}
                  disabled={push.busy}
                  onValueChange={(on) => (on ? push.enable() : push.disable())}
                  accessibilityLabel={t("Push notifications")}
                />,
                undefined,
                !push.enabled,
              )}
              {push.enabled &&
                row(
                  "pricetag-outline",
                  t("Deals & booking ideas"),
                  <Toggle
                    value={push.promosEnabled}
                    onValueChange={push.setPromosEnabled}
                    accessibilityLabel={t("Deals & booking ideas")}
                  />,
                )}
              {push.enabled && row("paper-plane-outline", t("Send a test notification"), chevron, push.sendTest, true)}
            </View>
          </>
        )}

        {push.supported && !!push.message && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{push.message}</Text>
            {push.permission === "denied" && (
              <Text style={styles.noticeLink} onPress={() => Linking.openSettings()}>
                {t("Open settings")}
              </Text>
            )}
          </View>
        )}

        <Button title={t("Log out")} variant="danger" icon="log-out-outline" onPress={logout} />
      </ScrollView>

      <OptionSheet
        visible={picker === "language"}
        title={t("Language")}
        value={language}
        options={LANGUAGES.map((l) => ({ value: l.code, title: l.nativeName, subtitle: l.name, badge: l.flag }))}
        onSelect={(code) => setLanguage(code as LanguageCode)}
        onClose={() => setPicker(null)}
      />
      <OptionSheet
        visible={picker === "currency"}
        title={t("Currency")}
        value={currencyIsAuto ? AUTO_CURRENCY : currency.code}
        options={[
          {
            value: AUTO_CURRENCY,
            title: t("Automatic"),
            subtitle: t("By your location, USD if it is not shared"),
          },
          ...CURRENCIES.map((c) => ({ value: c.code, title: `${c.code} · ${c.symbol.trim()}`, subtitle: c.name })),
        ]}
        onSelect={(code) => setCurrency(code === AUTO_CURRENCY ? null : code)}
        onClose={() => setPicker(null)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 32, gap: 12 },
    flex: { flex: 1 },
    title: { fontSize: 24, fontWeight: "800", color: colors.text },
    hero: { alignItems: "center", gap: 4, marginBottom: 8 },
    name: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 10 },
    email: { fontSize: 13, color: colors.muted },
    roleBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 6,
      paddingHorizontal: 10,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
    },
    roleText: { fontSize: 12, fontWeight: "700", color: colors.primary },
    section: { fontSize: 13, fontWeight: "700", color: colors.muted, marginTop: 8, marginLeft: 4, textTransform: "uppercase" },
    menu: { borderRadius: 20, backgroundColor: colors.card, overflow: "hidden", boxShadow: colors.shadow },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 14,
      minHeight: 60,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    rowLast: { borderBottomWidth: 0 },
    rowIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    rowLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text },
    rowHint: { fontSize: 12, color: colors.muted, marginTop: 2 },
    rowRight: { flexDirection: "row", alignItems: "center", gap: 4, maxWidth: "50%" },
    rowValue: { fontSize: 13, color: colors.muted, flexShrink: 1 },
    themeRow: { paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
    themeHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
    segment: { flexDirection: "row", backgroundColor: colors.inputBackground, borderRadius: 14, padding: 4, gap: 4 },
    segmentItem: { flex: 1, flexDirection: "row", gap: 6, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
    segmentActive: { backgroundColor: colors.primary },
    segmentText: { fontSize: 13, fontWeight: "600", color: colors.muted },
    segmentTextActive: { color: colors.white },
    notice: { backgroundColor: colors.primarySoft, borderRadius: 16, padding: 14, gap: 6 },
    noticeText: { fontSize: 13, lineHeight: 19, color: colors.text },
    noticeLink: { fontSize: 13, fontWeight: "700", color: colors.primary },
  });
