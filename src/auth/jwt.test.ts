import { describe, expect, it } from "vitest";
import { isJwtExpired, userFromJwt } from "./jwt";

function token(payload: Record<string, unknown>) {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
}

describe("JWT auth mapping", () => {
  it("maps backend JWT claims into the frontend user model", () => {
    const jwt = token({
      sub: "demo-admin",
      user_id: "user-1",
      school_id: "school-1",
      display_name: "Demo School Admin",
      roles: ["SCHOOL_ADMIN"],
      exp: Math.floor(Date.now() / 1000) + 300,
    });

    expect(userFromJwt(jwt)).toEqual({
      id: "user-1",
      username: "demo-admin",
      schoolId: "school-1",
      displayName: "Demo School Admin",
      roles: ["SCHOOL_ADMIN"],
    });
    expect(isJwtExpired(jwt)).toBe(false);
  });

  it("rejects expired or malformed tokens", () => {
    expect(isJwtExpired(token({ exp: 1 }))).toBe(true);
    expect(isJwtExpired("broken-token")).toBe(true);
  });
});
