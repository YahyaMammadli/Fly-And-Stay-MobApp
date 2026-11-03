import { api } from "./client";
import { AppNotification } from "./types";

export const notificationsApi = {
  list: (signal?: AbortSignal) =>
    api.get<AppNotification[]>("/api/notifications", { signal }).then((r) => r.data),

  unreadCount: (signal?: AbortSignal) =>
    api.get<{ count: number }>("/api/notifications/unread-count", { signal }).then((r) => r.data),

  markRead: (id: string) => api.post(`/api/notifications/${id}/read`).then(() => undefined),

  markAllRead: () => api.post("/api/notifications/read-all").then(() => undefined),
};
