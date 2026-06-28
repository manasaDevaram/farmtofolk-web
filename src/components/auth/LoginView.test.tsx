import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginView } from "./LoginView";

const { login, push } = vi.hoisted(() => ({
  login: vi.fn(),
  push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/admin-api", () => ({
  authApi: { login },
}));

describe("LoginView", () => {
  beforeEach(() => {
    localStorage.clear();
    login.mockReset();
    push.mockReset();
  });

  it("stores the authenticated session and opens the admin dashboard", async () => {
    login.mockResolvedValue({
      token: "signed-token",
      user: {
        active: true,
        address: null,
        email: "admin@farmtofolk.in",
        gender: null,
        id: "user-1",
        name: "Admin User",
        phone: null,
        role: "ADMIN",
      },
    });

    render(<LoginView />);
    fireEvent.change(screen.getByLabelText(/email or phone/i), {
      target: { value: "admin@farmtofolk.in" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin"));
    expect(login).toHaveBeenCalledWith("admin@farmtofolk.in", "password123");
    expect(localStorage.getItem("ftf-auth-token")).toBe("signed-token");
  });

  it("shows a readable error when authentication fails", async () => {
    login.mockRejectedValue(new Error("Invalid email, phone, or password"));

    render(<LoginView />);
    fireEvent.change(screen.getByLabelText(/email or phone/i), {
      target: { value: "unknown@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email, phone, or password",
    );
    expect(push).not.toHaveBeenCalled();
  });
});
