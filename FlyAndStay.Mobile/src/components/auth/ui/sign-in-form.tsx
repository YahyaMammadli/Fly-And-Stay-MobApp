import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { getErrorMessage } from "@/api/client";
import { ThemeColors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import AuthField from "./auth-field";
import AuthLayout from "./auth-layout";
import { signInSchema, SignInSchema } from "./auth.schema";

export default function SignInForm() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { signIn } = useAuth();
  const [formError, setFormError] = useState("");
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInSchema) => {
    setFormError("");
    try {
      await signIn(data.email.trim(), data.password);
      reset();
      router.replace("/home");
    } catch (error) {
      setFormError(getErrorMessage(error, "Could not log in. Please try again."));
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue your journey"
      footer={
        <Text style={styles.footerText}>
          Don&apos;t have an account?{" "}
          <Text style={styles.link} onPress={() => router.replace("/auth/sign-up")}>
            Sign up
          </Text>
        </Text>
      }
    >
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthField
            icon="mail-outline"
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthField
            icon="lock-closed-outline"
            placeholder="Password"
            password
            autoCapitalize="none"
            autoComplete="current-password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.password?.message}
          />
        )}
      />

      <Text style={styles.forgot} onPress={() => router.push("/auth/forgot-password")}>
        Forgot password?
      </Text>

      {!!formError && <Text style={styles.formError}>{formError}</Text>}

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </Pressable>
    </AuthLayout>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  pressed: { opacity: 0.85 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "600" },
  formError: { color: colors.error, fontSize: 13, textAlign: "center", marginBottom: 8 },
  forgot: { alignSelf: "flex-end", color: colors.primary, fontSize: 13, fontWeight: "700", marginTop: -6, marginBottom: 16 },
  footerText: { color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: "600" },
});
