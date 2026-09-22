import axios from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorInfo } from "./errorHandling";

describe("communication workflow errors", () => {
  it("normalizes notification authorization failures", () => {
    const error = new axios.AxiosError("forbidden");
    error.response = { status: 403, statusText: "Forbidden", headers: {}, config: {} as never, data: {} };
    expect(getApiErrorInfo(error)).toMatchObject({ status: 403 });
  });

  it("normalizes document service failures", () => {
    const error = new axios.AxiosError("server error");
    error.response = { status: 503, statusText: "Service Unavailable", headers: {}, config: {} as never, data: {} };
    expect(getApiErrorInfo(error)).toMatchObject({ kind: "server", status: 503 });
  });
});
