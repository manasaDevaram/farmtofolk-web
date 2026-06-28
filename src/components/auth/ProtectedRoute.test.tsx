import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LoginResponse, UserRole } from "@/types/admin";
import { saveSession } from "@/lib/auth-session";
import { ProtectedRoute } from "./ProtectedRoute";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

function session(role: UserRole): LoginResponse {
  return {
    token: "test-token",
    user: {
      active: true,
      address: null,
      email: null,
      gender: null,
      id: "user-1",
      name: "Test User",
      phone: "9999999999",
      role,
    },
  };
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
    replace.mockReset();
  });

  it("redirects unauthenticated visitors to login", async () => {
    render(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <p>Admin content</p>
      </ProtectedRoute>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("redirects farmers away from admin pages", async () => {
    saveSession(session("FARMER"));

    render(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <p>Admin content</p>
      </ProtectedRoute>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/farmer"));
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("redirects field officers away from admin pages", async () => {
    saveSession(session("FIELD_OFFICER"));

    render(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <p>Admin content</p>
      </ProtectedRoute>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/field"));
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });

  it("renders protected content for an allowed role", async () => {
    saveSession(session("ADMIN"));

    render(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <p>Admin content</p>
      </ProtectedRoute>,
    );

    expect(await screen.findByText("Admin content")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
