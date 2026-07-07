import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={["ADMIN", "FIELD_OFFICER"]}>{children}</ProtectedRoute>;
}
