import axios from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorInfo } from "./errorHandling";

describe("api error handling", () => {
  it("normalizes timeout errors", () => {
    const error = new axios.AxiosError("timeout", "ETIMEDOUT");
    expect(getApiErrorInfo(error).kind).toBe("timeout");
  });

  it("normalizes authentication errors and preserves request id", () => {
    const error = new axios.AxiosError("unauthorized");
    error.response = { status: 401, statusText: "Unauthorized", headers: {}, config: error.config!, data: {} };
    error.config = { headers: { "X-Request-ID": "req-123" } } as never;

    expect(getApiErrorInfo(error)).toMatchObject({
      kind: "unauthorized",
      status: 401,
      requestId: "req-123",
    });
  });

  it("normalizes validation, not-found, and server errors", () => {
    for (const [status, kind] of [[422, "validation"], [404, "not-found"], [500, "server"]] as const) {
      const error = new axios.AxiosError(String(status));
      error.response = { status, statusText: "", headers: {}, config: {} as never, data: {} };
      expect(getApiErrorInfo(error).kind).toBe(kind);
    }
  });

  it("handles non-axios errors", () => {
    expect(getApiErrorInfo(new Error("boom")).kind).toBe("unknown");
  });
});
