import { beforeEach, describe, expect, it, vi } from "vitest";

const { getState } = vi.hoisted(() => ({
  getState: vi.fn(() => ({ accessToken: null, logout: vi.fn() })),
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

    const request = await apiClient.interceptors.request.handlers[0].fulfilled?.({
      headers: {},
    } as never);

    expect(request?.headers?.Authorization).toBe("Bearer token-123");
  });

  it("logs the user out on a 401 response", async () => {
    const logout = vi.fn();
    getState.mockReturnValue({ accessToken: "token-123", logout });

    const error = { response: { status: 401 } };
    const rejected = apiClient.interceptors.response.handlers
      .find((handler) => handler.rejected)?.rejected;

    await expect(rejected?.(error)).rejects.toBe(error);
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("preserves non-authentication errors", async () => {
    const logout = vi.fn();
    getState.mockReturnValue({ accessToken: "token-123", logout });

    const error = { response: { status: 500 } };
    const rejected = apiClient.interceptors.response.handlers
      .find((handler) => handler.rejected)?.rejected;

    await expect(rejected?.(error)).rejects.toBe(error);
    expect(logout).not.toHaveBeenCalled();
  });
});
