import { describe, expect, it } from "vitest";
import AppErrorBoundary from "./AppErrorBoundary";

describe("AppErrorBoundary", () => {
  it("exports a React error boundary component", () => {
    expect(AppErrorBoundary).toBeDefined();
    expect(typeof AppErrorBoundary).toBe("function");
  });
});
