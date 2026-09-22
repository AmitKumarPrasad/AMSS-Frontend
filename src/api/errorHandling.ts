import axios from "axios";

export type ApiErrorKind =
  | "unauthorized"
  | "validation"
  | "not-found"
  | "server"
  | "network"
  | "timeout"
  | "unknown";

export interface ApiErrorInfo {
  kind: ApiErrorKind;
  message: string;
  status?: number;
  requestId?: string;
}

export function getApiErrorInfo(error: unknown): ApiErrorInfo {
  if (!axios.isAxiosError(error)) {
    return { kind: "unknown", message: "An unexpected error occurred." };
  }

  const status = error.response?.status;
  const requestId = error.config?.headers?.["X-Request-ID"] as string | undefined;

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return { kind: "timeout", message: "The request timed out. Please try again.", status, requestId };
  }

  if (!error.response) {
    return { kind: "network", message: "Unable to reach the server. Please check your connection.", requestId };
  }

  if (status === 401) {
    return { kind: "unauthorized", message: "Your session has expired. Please sign in again.", status, requestId };
  }

  if (status === 404) {
    return { kind: "not-found", message: "The requested resource was not found.", status, requestId };
  }

  if (status === 400 || status === 422) {
    return { kind: "validation", message: "Please check the submitted information.", status, requestId };
  }

  if (status >= 500) {
    return { kind: "server", message: "The server could not complete the request.", status, requestId };
  }

  return { kind: "unknown", message: "The request could not be completed.", status, requestId };
}
