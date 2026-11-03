import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "@/api/auth";
import { devicesApi } from "@/api/devices";
import {
  getTokens,
  setSessionExpiredHandler,
  setTokens,
  setTokensListener,
  Tokens,
} from "@/api/client";
import { AuthResponse, User } from "@/api/types";
import { ACCESS_TOKEN_KEY, PUSH_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants/storage";

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function persistTokens(value: Tokens | null) {
  if (value) {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, value.accessToken],
      [REFRESH_TOKEN_KEY, value.refreshToken],
    ]);
  } else {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTokensListener((value) => {
      setAccessToken(value?.accessToken ?? null);
      void persistTokens(value);
    });
    setSessionExpiredHandler(() => setUser(null));
    return () => {
      setTokensListener(null);
      setSessionExpiredHandler(null);
    };
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [[, access], [, refresh]] = await AsyncStorage.multiGet([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
        if (!refresh) return;

        setTokens({ accessToken: access ?? "", refreshToken: refresh });
        const me = await authApi.me();
        if (active) setUser(me);
      } catch {
        if (!getTokens()) await persistTokens(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const applySession = useCallback((response: AuthResponse) => {
    setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });
    setUser(response.user);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      applySession(await authApi.login({ email, password }));
    },
    [applySession],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      applySession(await authApi.register({ name, email, password }));
    },
    [applySession],
  );

  const signOut = useCallback(async () => {
    const current = getTokens();
    const pushToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (pushToken && current) {
      await devicesApi.unregister(pushToken).catch(() => undefined);
    }
    await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
    setTokens(null);
    setUser(null);
    if (current?.refreshToken) {
      authApi.logout(current.refreshToken).catch(() => undefined);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, accessToken, loading, signIn, signUp, signOut, setUser }),
    [user, accessToken, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
