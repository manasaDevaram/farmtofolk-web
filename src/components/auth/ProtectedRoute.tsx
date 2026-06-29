"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { clearSession, getSession } from "@/lib/auth-session";
import type { UserRole } from "@/types/admin";

const roleHomes: Record<UserRole, string> = {
  ADMIN: "/admin",
  FARMER: "/farmer",
  FIELD_OFFICER: "/field",
};

export function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const rolesKey = allowedRoles.join(",");

  useEffect(() => {
    const session = getSession();

    if (!session) {
      clearSession();
      router.replace("/login");
      return;
    }

    if (!rolesKey.split(",").includes(session.user.role)) {
      router.replace(roleHomes[session.user.role] ?? "/login");
      return;
    }

    setAllowed(true);
  }, [rolesKey, router]);

  if (!allowed) {
    return (
      <main className="ftf-paper grid min-h-screen place-items-center p-6">
        <p className="font-bold text-[var(--ftf-muted)]">Checking your access...</p>
      </main>
    );
  }

  return children;
}
