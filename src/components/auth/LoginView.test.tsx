import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserRole } from "@/types/admin";
import { LoginView } from "./LoginView";

const { login, replace } = vi.hoisted(() => ({
  login: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/lib/admin-api", () => ({
  authApi: { login },
}));

function loginResponse(role: UserRole) {
  return {
    token: "signed-token",
    user: {
      active: true,
      address: null,
      email: "user@farmtofolk.in",
      gender: null,
      id: "user-1",
      name: "Test User",
      phone: null,
      role,
    },
  };
}

async function signIn() {
  fireEvent.change(screen.getByLabelText(/email or phone/i), {
    target: { value: "user@farmtofolk.in" },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: "password123" },
  });
  fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));
}

describe("LoginView", () => {
  beforeEach(() => {
    localStorage.clear();
    login.mockReset();
    replace.mockReset();
  });

  it.each([
    ["ADMIN", "/admin"],
    ["FIELD_OFFICER", "/field"],
    ["FARMER", "/farmer"],
  ] as const)("redirects %s users to %s", async (role, destination) => {
    login.mockResolvedValue(loginResponse(role));

    render(<LoginView />);
    await signIn();

    await waitFor(() => expect(replace).toHaveBeenCalledWith(destination));
    expect(login).toHaveBeenCalledWith("user@farmtofolk.in", "password123");
    expect(localStorage.getItem("ftf-auth-token")).toBe("signed-token");
  });

  it("shows a readable error when authentication fails", async () => {
    login.mockRejectedValue(new Error("Invalid email, phone, or password"));

    render(<LoginView />);
    await signIn();

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email, phone, or password");
    expect(replace).not.toHaveBeenCalled();
  });
});
