import axios from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorInfo } from "./errorHandling";

describe("AI assistant error workflow", () => {
  it("normalizes unavailable assistant services", () => {
    const error = new axios.AxiosError("service unavailable");
    error.response = {
      status: 503,
      statusText: "Service Unavailable",
      headers: {},
      config: {} as never,
      data: {},
    };

    expect(getApiErrorInfo(error)).toMatchObject({
      kind: "server",
      status: 503,
    });
  });

  it("normalizes AI request timeouts", () => {
    const error = new axios.AxiosError("timeout", "ETIMEDOUT");

    expect(getApiErrorInfo(error)).toMatchObject({
      kind: "timeout",
      message: "The request timed out. Please try again.",
    });
  });

  it("normalizes tenant authorization failures", () => {
    const error = new axios.AxiosError("forbidden");
    error.response = {
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: {} as never,
      data: {},
    };

    expect(getApiErrorInfo(error).kind).toBe("unauthorized");
  });
});
