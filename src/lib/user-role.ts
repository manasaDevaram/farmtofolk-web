import type { UserRole } from "@/types/admin";

export function formatUserRole(role?: UserRole | null): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "FARMER":
      return "Farmer";
    case "FIELD_OFFICER":
      return "Field Officer";
    default:
      return "Not available";
  }
}
