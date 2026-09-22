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

describe("api client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("attaches the bearer token to requests", async () => {
    const logout = vi.fn();
    getState.mockReturnValue({ accessToken: "token-123", logout });

    const requestHandler = apiClient.interceptors.request.handlers
      ?.find((handler) => handler.fulfilled)?.fulfilled;

    const request = await requestHandler?.({
      headers: {},
    } as never);

    expect(request?.headers?.Authorization).toBe("Bearer token-123");
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
