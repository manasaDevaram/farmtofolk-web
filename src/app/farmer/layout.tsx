import type { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function FarmerLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={["FARMER"]}>{children}</ProtectedRoute>;
}
