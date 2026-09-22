import { describe, expect, it } from "vitest";
import { ROLES, hasAnyRole } from "./roles";

describe("hasAnyRole", () => {
  it("matches when the user has an allowed role", () => {
    expect(hasAnyRole([ROLES.TEACHER], [ROLES.TEACHER, ROLES.SCHOOL_ADMIN])).toBe(true);
  });

  it("does not match when the user has no allowed role", () => {
    expect(hasAnyRole([ROLES.STUDENT], [ROLES.TEACHER, ROLES.SCHOOL_ADMIN])).toBe(false);
  });

  it("handles an undefined role list safely", () => {
    expect(hasAnyRole(undefined, [ROLES.STUDENT])).toBe(false);
  });
});
