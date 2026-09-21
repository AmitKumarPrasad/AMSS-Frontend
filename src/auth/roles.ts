export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  TEACHER: "TEACHER",
  ACCOUNTANT: "ACCOUNTANT",
  PARENT: "PARENT",
  STUDENT: "STUDENT",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function hasAnyRole(userRoles: string[] | undefined, allowedRoles: Role[]) {
  return Boolean(userRoles?.some((role) => allowedRoles.includes(role as Role)));
}
