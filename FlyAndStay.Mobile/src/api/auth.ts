import { Platform } from "react-native";

import { api } from "./client";
import { AuthResponse, User } from "./types";

type PickedPhoto = { uri: string; mimeType?: string | null; fileName?: string | null };

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/register", body).then((r) => r.data),

  login: (body: { email: string; password: string }) =>
    api.post<AuthResponse>("/api/auth/login", body).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<AuthResponse>("/api/auth/refresh", { refreshToken }).then((r) => r.data),

  logout: (refreshToken: string) => api.post("/api/auth/logout", { refreshToken }).then(() => undefined),

  logoutAll: () => api.post("/api/auth/logout-all").then(() => undefined),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/api/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (body: { email: string; code: string; newPassword: string }) =>
    api.post<{ message: string }>("/api/auth/reset-password", body).then((r) => r.data),

  me: (signal?: AbortSignal) => api.get<User>("/api/users/me", { signal }).then((r) => r.data),

  updateName: (name: string) => api.put<User>("/api/users/me", { name }).then((r) => r.data),

  async uploadPhoto(photo: PickedPhoto) {
    const form = new FormData();
    const name = photo.fileName ?? "avatar.jpg";
    const type = photo.mimeType ?? "image/jpeg";

    if (Platform.OS === "web") {
      const blob = await (await fetch(photo.uri)).blob();
      form.append("file", blob, name);
    } else {

      form.append("file", { uri: photo.uri, name, type } as unknown as Blob);
    }

    const res = await api.put<User>("/api/users/me/photo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  deletePhoto: () => api.delete<User>("/api/users/me/photo").then((r) => r.data),
};
