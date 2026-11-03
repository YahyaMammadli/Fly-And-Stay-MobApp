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
import { signUpSchema, SignUpSchema } from "./auth.schema";

export default function SignUpForm() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { signUp } = useAuth();
  const [formError, setFormError] = useState("");
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: SignUpSchema) => {
    setFormError("");
    try {

      await signUp(data.name.trim(), data.email.trim(), data.password);
      reset();
      router.replace("/home");
    } catch (error) {
      setFormError(getErrorMessage(error, "Could not create your account. Please try again."));
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Sign up to start planning your trip"
      footer={
        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text style={styles.link} onPress={() => router.replace("/auth/sign-in")}>
            Log in
          </Text>
        </Text>
      }
    >
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthField
            icon="person-outline"
            placeholder="Name"
            autoCapitalize="words"
            autoComplete="name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.name?.message}
          />
        )}
      />

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
            autoComplete="new-password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthField
            icon="lock-closed-outline"
            placeholder="Confirm Password"
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

      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
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
  footerText: { color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: "600" },
});
