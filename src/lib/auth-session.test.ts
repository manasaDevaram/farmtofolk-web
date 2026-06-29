import { beforeEach, describe, expect, it } from "vitest";
import type { LoginResponse } from "@/types/admin";
import {
  clearSession,
  getSession,
  getSessionToken,
  getSessionUser,
  hasAnyRole,
  hasRole,
  isAuthenticated,
  saveSession,
} from "./auth-session";

function session(role: LoginResponse["user"]["role"]): LoginResponse {
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

describe("auth-session", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists and reads the authenticated session", () => {
    saveSession(session("ADMIN"));

    expect(getSessionToken()).toBe("signed-token");
    expect(getSessionUser()?.role).toBe("ADMIN");
    expect(getSession()).toEqual(session("ADMIN"));
    expect(isAuthenticated()).toBe(true);
  });

  it("clears invalid stored user data", () => {
    localStorage.setItem("ftf-auth-token", "signed-token");
    localStorage.setItem("ftf-auth-user", "{not-json");

    expect(getSessionUser()).toBeNull();
    expect(getSessionToken()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it("checks role helpers", () => {
    saveSession(session("FIELD_OFFICER"));

    expect(hasRole("FIELD_OFFICER")).toBe(true);
    expect(hasRole("ADMIN")).toBe(false);
    expect(hasAnyRole(["ADMIN", "FIELD_OFFICER"])).toBe(true);
    expect(hasAnyRole(["FARMER"])).toBe(false);
  });

  it("clears the stored session", () => {
    saveSession(session("FARMER"));
    clearSession();

    expect(getSession()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });
});
