import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../auth/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const API_TIMEOUT_MS = 60_000;

const createRequestId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `amss-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    // Let the browser supply the multipart boundary instead of serializing as JSON.
    config.headers.delete("Content-Type");
  }
  const token = useAuthStore.getState().accessToken;
  if (token && config.url !== "/api/v1/auth/login") {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["X-Request-ID"] = createRequestId();
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
