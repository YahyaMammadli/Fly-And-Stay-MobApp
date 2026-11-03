import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";

import AuthLayout from "@/components/auth/ui/auth-layout";
import PasswordReset from "@/components/profile/ui/password-reset";
import { ThemeColors } from "@/constants/theme";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const { t } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <AuthLayout
      title={t("Reset password")}
      subtitle={t("We will e-mail you a code to set a new password")}
      footer={
        <Text style={styles.footerText}>
          {t("Remembered it?")}{" "}
          <Text style={styles.link} onPress={() => router.replace("/auth/sign-in")}>
            {t("Back to log in")}
          </Text>
        </Text>
      }
    >
      <PasswordReset onDone={() => router.replace("/auth/sign-in")} />
    </AuthLayout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    footerText: { color: colors.muted, fontSize: 14 },
    link: { color: colors.primary, fontWeight: "700" },
  });
