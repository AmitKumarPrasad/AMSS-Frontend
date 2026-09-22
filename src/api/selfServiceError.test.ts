import axios from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorInfo } from "./errorHandling";

describe("self-service error workflow", () => {
  it("normalizes announcement and document authorization failures", () => {
    const error = new axios.AxiosError("unauthorized");
    error.response = {
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config: {} as never,
      data: {},
    };

    expect(getApiErrorInfo(error)).toMatchObject({ kind: "unauthorized", status: 401 });
  });

  it("normalizes document download server failures", () => {
    const error = new axios.AxiosError("server error");
    error.response = {
      status: 500,
      statusText: "Internal Server Error",
      headers: {},
      config: {} as never,
      data: {},
    };

    expect(getApiErrorInfo(error)).toMatchObject({ kind: "server", status: 500 });
  });

  it("normalizes network failures for self-service reads", () => {
    const error = new axios.AxiosError("network error", "ERR_NETWORK");

    expect(getApiErrorInfo(error).kind).toBe("network");
  });
});