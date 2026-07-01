import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("dashboard API routes", () => {
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

  it("loads the farmer dashboard directly from its aggregate endpoint", async () => {
    const fetchMock = vi.fn(async () => Response.json({ farmer: {}, farms: [] }));
    vi.stubGlobal("fetch", fetchMock);
    const { farmerDashboardApi } = await import("./admin-api");

    await farmerDashboardApi.summary();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.nammafarmers.in/api/farmer-dashboard/me");
  });

  it("loads the admin dashboard from its aggregate endpoint", async () => {
    const fetchMock = vi.fn(async () => Response.json({}));
    vi.stubGlobal("fetch", fetchMock);
    const { dashboardApi } = await import("./admin-api");

    await dashboardApi.summary();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.nammafarmers.in/api/admin/dashboard");
  });
});
