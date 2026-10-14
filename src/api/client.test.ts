import { beforeEach, describe, expect, it, vi } from "vitest";

type MockAuthState = {
  accessToken: string | null;
  logout: ReturnType<typeof vi.fn>;
};

const { getState } = vi.hoisted(() => ({
  getState: vi.fn<() => MockAuthState>(() => ({ accessToken: null, logout: vi.fn() })),
}));

vi.mock("../auth/authStore", () => ({
  useAuthStore: { getState },
}));

import { apiClient } from "./client";
import { AxiosHeaders } from "axios";

describe("api client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("attaches the bearer token and request id to requests", async () => {
    const logout = vi.fn();
    getState.mockReturnValue({ accessToken: "token-123", logout });

    const requestHandler = apiClient.interceptors.request.handlers
      ?.find((handler) => handler.fulfilled)?.fulfilled;

    const request = await requestHandler?.({
      headers: {},
    } as never);

    expect(request?.headers?.Authorization).toBe("Bearer token-123");
    expect(request?.headers?.["X-Request-ID"]).toMatch(
      /^(amss-[a-z0-9-]+|[0-9a-f-]{36})$/,
    );
  });

  it("does not attach the retired session to a new login", async () => {
    getState.mockReturnValue({accessToken:"retired-token",logout:vi.fn()});
    const handler=apiClient.interceptors.request.handlers?.find(item=>item.fulfilled)?.fulfilled;
    const request=await handler?.({url:"/api/v1/auth/login",headers:new AxiosHeaders()} as never);
    expect(request?.headers.Authorization).toBeUndefined();
  });

  it("configures a bounded request timeout suitable for Render cold starts", () => {
    expect(apiClient.defaults.timeout).toBe(60_000);
  });

  it("keeps uploads as FormData and removes the JSON content type", async () => {
    getState.mockReturnValue({ accessToken: "token-123", logout: vi.fn() });
    const form = new FormData();
    form.append("title", "School notice");
    const handler = apiClient.interceptors.request.handlers?.find((item) => item.fulfilled)?.fulfilled;
    const config = await handler?.({ data: form, headers: new AxiosHeaders({ "Content-Type": "application/json" }) } as never);
    expect(config?.data).toBe(form);
    expect(config?.headers.has("Content-Type")).toBe(false);
    expect(config?.headers.Authorization).toBe("Bearer token-123");
  });

  it("logs the user out on a 401 response", async () => {
    const logout = vi.fn();
    getState.mockReturnValue({ accessToken: "token-123", logout });

    const error = { response: { status: 401 } };
    const rejected = apiClient.interceptors.response.handlers
      ?.find((handler) => handler.rejected)?.rejected;

    await expect(rejected?.(error as never)).rejects.toBe(error);
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("ignores unauthorized replies from an older session", async () => {
    const logout=vi.fn();getState.mockReturnValue({accessToken:"new-token",logout});
    const error={response:{status:401},config:{url:"/api/v1/schools/s1/students",headers:{Authorization:"Bearer old-token"}}};
    const handler=apiClient.interceptors.response.handlers?.find(item=>item.rejected)?.rejected;
    await expect(handler?.(error as never)).rejects.toBe(error);expect(logout).not.toHaveBeenCalled();
  });

  it("does not clear a session because a login attempt was rejected", async () => {
    const logout=vi.fn();getState.mockReturnValue({accessToken:"new-token",logout});
    const error={response:{status:401},config:{url:"/api/v1/auth/login",headers:{}}};
    const handler=apiClient.interceptors.response.handlers?.find(item=>item.rejected)?.rejected;
    await expect(handler?.(error as never)).rejects.toBe(error);expect(logout).not.toHaveBeenCalled();
  });

  it("preserves non-authentication errors", async () => {
    const logout = vi.fn();
    getState.mockReturnValue({ accessToken: "token-123", logout });

    const error = { response: { status: 500 } };
    const rejected = apiClient.interceptors.response.handlers
      ?.find((handler) => handler.rejected)?.rejected;

    await expect(rejected?.(error as never)).rejects.toBe(error);
    expect(logout).not.toHaveBeenCalled();
  });
});
