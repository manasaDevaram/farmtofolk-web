import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("authApi", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.nammafarmers.in");
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("sends login directly to the production API base URL", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        token: "token",
        user: { id: "admin-1", name: "Admin", role: "ADMIN", active: true },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { authApi } = await import("./admin-api");

    await authApi.login("admin@example.com", "password");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.nammafarmers.in/api/auth/login");
  });
});
