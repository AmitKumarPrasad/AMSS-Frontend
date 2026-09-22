import axios from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorInfo } from "./errorHandling";

describe("admin operations error workflow", () => {
  it("normalizes admin authorization failures", () => {
    const error = new axios.AxiosError("forbidden");
    error.response = {
      status: 403,
      statusText: "Forbidden",
      headers: {},
      config: {} as never,
      data: {},
    };

    expect(getApiErrorInfo(error)).toMatchObject({ kind: "unknown", status: 403 });
  });

  it("normalizes dashboard server failures", () => {
    const error = new axios.AxiosError("server error");
    error.response = {
      status: 502,
      statusText: "Bad Gateway",
      headers: {},
      config: {} as never,
      data: {},
    };

    expect(getApiErrorInfo(error)).toMatchObject({ kind: "server", status: 502 });
  });

  it("normalizes audit request timeouts", () => {
    const error = new axios.AxiosError("timeout", "ETIMEDOUT");

    expect(getApiErrorInfo(error).kind).toBe("timeout");
  });
});