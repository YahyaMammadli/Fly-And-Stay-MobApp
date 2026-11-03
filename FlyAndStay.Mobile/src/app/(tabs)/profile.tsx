import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ComponentProps, useMemo } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Avatar from "@/components/shared/ui/avatar";
import Button from "@/components/shared/ui/button";
import { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { usePush } from "@/hooks/use-push";
import { useTheme } from "@/hooks/use-theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { user, signOut } = useAuth();
  const push = usePush();

  const logout = async () => {
    await signOut();
    router.replace("/auth/sign-in");
  };

  const renderRow = (icon: IconName, label: string, onPress: () => void) => (
    <Pressable key={label} style={styles.row} onPress={onPress}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.hero}>
          <Avatar size={88} />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.menu}>
          {renderRow("create-outline", "Edit profile", () => router.push("/edit-profile"))}
          {renderRow("notifications-outline", "Notifications", () => router.push("/notifications"))}
          {renderRow("airplane-outline", "Airlines & fleet", () => router.push("/models"))}
          {push.supported && (
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.rowLabel}>Push notifications</Text>
              <Switch
                value={push.enabled}
                disabled={push.busy}
                onValueChange={(on) => (on ? push.enable() : push.disable())}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </View>
          )}
          {push.supported && push.enabled && renderRow("paper-plane-outline", "Send a test notification", push.sendTest)}
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={colors.primary} />
            </View>
            <Text style={styles.rowLabel}>Dark theme</Text>
            <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: colors.primary, false: colors.border }} />
          </View>
        </View>

        {push.supported && !!push.message && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{push.message}</Text>
            {push.permission === "denied" && (
              <Text style={styles.noticeLink} onPress={() => Linking.openSettings()}>
                Open settings
              </Text>
            )}
          </View>
        )}

        <Button title="Log out" variant="danger" icon="log-out-outline" onPress={logout} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, gap: 20 },
    title: { fontSize: 24, fontWeight: "800", color: colors.text },
    hero: { alignItems: "center", gap: 4 },
    name: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 10 },
    email: { fontSize: 13, color: colors.muted },
    menu: { borderRadius: 20, backgroundColor: colors.card, overflow: "hidden", boxShadow: colors.shadow },
    row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, height: 58, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    rowIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    notice: { backgroundColor: colors.primarySoft, borderRadius: 16, padding: 14, gap: 6 },
    noticeText: { fontSize: 13, lineHeight: 19, color: colors.text },
    noticeLink: { fontSize: 13, fontWeight: "700", color: colors.primary },
    rowLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.text },
  });
