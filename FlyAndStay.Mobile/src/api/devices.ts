import { api } from "./client";

export const devicesApi = {
  register: (body: { token: string; platform: string }) =>
    api.post("/api/devices", body).then(() => undefined),

  unregister: (token: string) =>
    api.post("/api/devices/unregister", { token }).then(() => undefined),

  sendTest: () => api.post("/api/devices/test").then(() => undefined),
};
