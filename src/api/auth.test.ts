import { describe, expect, it, vi } from "vitest";

const post = vi.fn();

vi.mock("./client", () => ({
  apiClient: { post },
}));

import { login } from "./auth";

describe("auth api", () => {
  it("uses the shared api client for login", async () => {
    const response = {
      data: {
        accessToken: "token-123",
        tokenType: "Bearer",
      },
    };
    post.mockResolvedValueOnce(response);

    await expect(
      login({ username: "admin", password: "secret" }),
    ).resolves.toEqual(response.data);

    expect(post).toHaveBeenCalledWith("/api/v1/auth/login", {
      username: "admin",
      password: "secret",
    });
  });
});
