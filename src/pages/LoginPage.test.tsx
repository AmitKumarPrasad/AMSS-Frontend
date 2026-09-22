import { describe, expect, it } from "vitest";
import axios from "axios";
import { getApiErrorInfo } from "../api/errorHandling";

describe("login error workflow", () => {
  it("normalizes unexpected login failures", () => {
    expect(getApiErrorInfo(new Error("network failure")).message).toBe(
      "An unexpected error occurred.",
    );
  });

  it("preserves authentication-specific messaging", () => {
    const error = new axios.AxiosError("unauthorized");
    error.response = {
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: {} as never,
      data: {},
    };

    expect(getApiErrorInfo(error).message).toBe(
      "Your session has expired. Please sign in again.",
    );
  });
});
