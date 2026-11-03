import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { LocationProvider } from "@/hooks/use-location";
import { PreferencesProvider } from "@/hooks/use-preferences";
import { PushProvider } from "@/hooks/use-push";
import { ThemeProvider, useTheme } from "@/hooks/use-theme";
import { TripProvider } from "@/hooks/use-trip";

const PROTECTED = ["(tabs)", "flight", "hotel", "booking", "models", "edit-profile", "notifications"];

function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const root = (segments[0] ?? "") as string;

  useEffect(() => {
    if (!loading && !user && PROTECTED.includes(root)) router.replace("/auth/sign-in");
  }, [loading, user, root, router]);

  return null;
}

function RootStack() {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AuthGate />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/sign-in" />
        <Stack.Screen name="auth/sign-up" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="flight/[id]" />
        <Stack.Screen name="hotel/[slug]" />
        <Stack.Screen name="booking/summary" />
        <Stack.Screen name="booking/confirmed" options={{ gestureEnabled: false }} />
        <Stack.Screen name="models" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="notifications" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LocationProvider>
        <PreferencesProvider>
          <AuthProvider>
            <TripProvider>
              <PushProvider>
                <RootStack />
              </PushProvider>
            </TripProvider>
          </AuthProvider>
        </PreferencesProvider>
      </LocationProvider>
    </ThemeProvider>
  );
}
