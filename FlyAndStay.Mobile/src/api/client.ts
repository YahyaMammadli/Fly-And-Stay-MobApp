import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { AuthResponse } from "./types";

const API_PORT = 5080;

function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  if (host && host !== "localhost" && host !== "127.0.0.1") return `http://${host}:${API_PORT}`;

  return Platform.OS === "android" ? `http://10.0.2.2:${API_PORT}` : `http://localhost:${API_PORT}`;
}

export const API_URL = resolveBaseUrl();

export type Tokens = { accessToken: string; refreshToken: string };

let tokens: Tokens | null = null;
let tokensListener: ((value: Tokens | null) => void) | null = null;
let sessionExpiredHandler: (() => void) | null = null;
let refreshPromise: Promise<Tokens> | null = null;

export const getTokens = () => tokens;

export const setTokens = (value: Tokens | null) => {
  tokens = value;
  tokensListener?.(value);
};

export const setTokensListener = (listener: ((value: Tokens | null) => void) | null) => {
  tokensListener = listener;
};

export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  sessionExpiredHandler = handler;
};

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

const bare = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  if (tokens?.accessToken) config.headers.set("Authorization", `Bearer ${tokens.accessToken}`);
  return config;
});

function refreshTokens(): Promise<Tokens> {
  if (!tokens) return Promise.reject(new Error("No session"));

  if (!refreshPromise) {
    refreshPromise = bare
      .post<AuthResponse>("/api/auth/refresh", { refreshToken: tokens.refreshToken })
      .then((response) => {
        const next: Tokens = {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        };
        setTokens(next);
        return next;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

type RetriableConfig = InternalAxiosRequestConfig & { retried?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthCall = String(config?.url ?? "").startsWith("/api/auth/");

    if (error.response?.status === 401 && config && !config.retried && !isAuthCall && tokens) {
      config.retried = true;
      try {
        const next = await refreshTokens();
        config.headers.set("Authorization", `Bearer ${next.accessToken}`);
        return api(config);
      } catch (refreshError) {
        const status = axios.isAxiosError(refreshError) ? refreshError.response?.status : undefined;
        if (status === 400 || status === 401) {
          setTokens(null);
          sessionExpiredHandler?.();
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export const isCancelled = (error: unknown) => axios.isCancel(error);

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return error.code === "ECONNABORTED"
        ? "The server took too long to respond."
        : "Can't reach the server. Check your connection and the API address.";
    }
    if (error.response.status === 429) return "Too many attempts. Please wait a minute and try again.";

    const data = error.response.data as { message?: unknown; errors?: Record<string, unknown>; title?: unknown } | undefined;
    if (typeof data?.message === "string") return data.message;
    if (data?.errors && typeof data.errors === "object") {
      const first = (Object.values(data.errors) as unknown[]).flat()[0];
      if (typeof first === "string") return first;
    }
    if (typeof data?.title === "string") return data.title;
  }
  return fallback;
}
