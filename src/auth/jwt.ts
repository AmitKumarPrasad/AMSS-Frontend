export interface AuthUser {
  id?: string;
  username?: string;
  displayName?: string;
  schoolId?: string;
  roles?: string[];
}

interface JwtClaims {
  sub?: string;
  user_id?: string;
  school_id?: string;
  display_name?: string;
  roles?: string[];
  exp?: number;
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return decodeURIComponent(
    Array.from(atob(padded))
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
}

export function decodeJwtClaims(token: string): JwtClaims {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  return JSON.parse(decodeBase64Url(parts[1])) as JwtClaims;
}

export function userFromJwt(token: string): AuthUser {
  const claims = decodeJwtClaims(token);
  return {
    id: claims.user_id,
    username: claims.sub,
    displayName: claims.display_name,
    schoolId: claims.school_id,
    roles: Array.isArray(claims.roles) ? claims.roles : [],
  };
}

export function isJwtExpired(token: string): boolean {
  try {
    const { exp } = decodeJwtClaims(token);
    return typeof exp === "number" ? exp * 1000 <= Date.now() : true;
  } catch {
    return true;
  }
}
