import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";

import { authApi } from "@/api/auth";
import { getErrorMessage } from "@/api/client";
import AuthField from "@/components/auth/ui/auth-field";
import OtpInput from "@/components/auth/ui/otp-input";
import PasswordRules from "@/components/auth/ui/password-rules";
import { resetPasswordSchema, ResetPasswordSchema } from "@/components/auth/ui/auth.schema";
import Button from "@/components/shared/ui/button";
import { ThemeColors } from "@/constants/theme";
import { usePreferences } from "@/hooks/use-preferences";
import { useTheme } from "@/hooks/use-theme";

const RESEND_SECONDS = 60;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = {
  email?: string;
  onDone?: () => void;
};

export default function PasswordReset({ email: fixedEmail, onDone }: Props) {
  const { colors } = useTheme();
  const { t } = usePreferences();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [step, setStep] = useState<"start" | "code">("start");
  const [emailInput, setEmailInput] = useState(fixedEmail ?? "");
  const [emailError, setEmailError] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [formError, setFormError] = useState("");

  const email = (fixedEmail ?? emailInput).trim();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const sendCode = useCallback(async () => {
    setFormError("");
    if (!EMAIL_PATTERN.test(email)) {
      setEmailError("Enter a valid email address");
      return;
    }
    setEmailError("");
    setSending(true);
    try {
      await authApi.forgotPassword(email);
      setStep("code");
      setCooldown(RESEND_SECONDS);
    } catch (error) {
      setFormError(getErrorMessage(error, "Could not send the code. Please try again."));
    } finally {
      setSending(false);
    }
  }, [email]);

  const finish = () => {
    reset();
    setStep("start");
    setCooldown(0);
    onDone?.();
  };

  const onSubmit = async (data: ResetPasswordSchema) => {
    setFormError("");
    try {
      await authApi.resetPassword({ email, code: data.code, newPassword: data.newPassword });
      if (Platform.OS === "web") {
        finish();
      } else {
        Alert.alert(t("Password updated"), t("Use your new password the next time you log in."), [
          { text: "OK", onPress: finish },
        ]);
      }
    } catch (error) {
      setFormError(getErrorMessage(error, t("Could not update the password. Please try again.")));
    }
  };

  if (step === "start") {
    return (
      <View>
        {fixedEmail ? (
          <Text style={styles.hint}>
            We will send a 6-digit code to <Text style={styles.bold}>{fixedEmail}</Text>. Enter it here to choose a new password.
          </Text>
        ) : (
          <>
              <Text style={styles.hint}>{t("Enter the e-mail of your account and we will send you a 6-digit code.")}</Text>
              <AuthField
                icon="mail-outline"
                placeholder={t("Email Address")}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={emailInput}
                onChangeText={setEmailInput}
                error={emailError}
              />
          </>
        )}
        {!!formError && <Text style={styles.formError}>{formError}</Text>}
        <Button
          title={t("Send code")}
          icon="mail-outline"
          variant={fixedEmail ? "outline" : "primary"}
          onPress={sendCode}
          loading={sending}
        />
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.hint}>
        {t("Code sent to")} <Text style={styles.bold}>{email}</Text>. {t("It is valid for 10 minutes.")}
      </Text>

      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, value } }) => (
          <OtpInput value={value} onChange={onChange} error={errors.code?.message} />
        )}
      />

      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <AuthField
              icon="lock-closed-outline"
              placeholder={t("New password")}
              password
              autoCapitalize="none"
              autoComplete="new-password"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.newPassword?.message}
            />
            <PasswordRules value={value} />
          </>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthField
            icon="lock-closed-outline"
            placeholder={t("Confirm new password")}
            password
            autoCapitalize="none"
            autoComplete="new-password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.confirmPassword?.message}
          />
        )}
      />

      {!!formError && <Text style={styles.formError}>{formError}</Text>}

      <Button title={t("Update password")} onPress={() => void handleSubmit(onSubmit)()} loading={isSubmitting} />

      <Text style={styles.resend}>
        {cooldown > 0 ? (
          t("Didn't get it? Resend in {seconds}s", { seconds: cooldown })
        ) : (
          <Text style={styles.link} onPress={sendCode}>
            {t("Resend code")}
          </Text>
        )}
      </Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    hint: { fontSize: 13, lineHeight: 19, color: colors.muted, marginBottom: 14 },
    bold: { color: colors.text, fontWeight: "700" },
    formError: { color: colors.error, fontSize: 13, textAlign: "center", marginBottom: 10 },
    resend: { textAlign: "center", marginTop: 14, fontSize: 13, color: colors.muted },
    link: { color: colors.primary, fontWeight: "700" },
  });
