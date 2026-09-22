import axios from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorInfo } from "./errorHandling";

describe("API error normalization coverage", () => {
  it("handles unknown errors", () => {
    expect(getApiErrorInfo(new Error("boom"))).toMatchObject({ kind: "unknown" });
  });

  it("handles not found responses", () => {
    const error = new axios.AxiosError("not found");
    error.response = { status: 404, statusText: "Not Found", headers: {}, config: {} as never, data: {} };
    expect(getApiErrorInfo(error)).toMatchObject({ kind: "not-found", status: 404 });
  });

  it("handles validation responses", () => {
    const error = new axios.AxiosError("validation");
    error.response = { status: 422, statusText: "Unprocessable Entity", headers: {}, config: {} as never, data: {} };
    expect(getApiErrorInfo(error)).toMatchObject({ kind: "validation", status: 422 });
  });

  it("handles request correlation ids", () => {
    const error = new axios.AxiosError("failure");
    error.response = { status: 500, statusText: "Internal Server Error", headers: {}, config: { headers: { "X-Request-ID": "req-123" } } as never, data: {} };
    expect(getApiErrorInfo(error)).toMatchObject({ kind: "server", status: 500, requestId: "req-123" });
  });
});