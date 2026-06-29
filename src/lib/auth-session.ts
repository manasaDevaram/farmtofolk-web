import type { LoginResponse, UserAccount } from "@/types/admin";

const TOKEN_KEY = "ftf-auth-token";
const USER_KEY = "ftf-auth-user";

export function saveSession(session: LoginResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function getSession(): LoginResponse | null {
  const token = getSessionToken();
  const user = getSessionUser();
  return token && user ? { token, user } : null;
}

export function getSessionToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getSessionUser(): UserAccount | null {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem(USER_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value) as UserAccount;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return getSession() !== null;
}

export function hasRole(role: UserAccount["role"]) {
  return getSessionUser()?.role === role;
}

export function hasAnyRole(roles: UserAccount["role"][]) {
  const role = getSessionUser()?.role;
  return role ? roles.includes(role) : false;
}
