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

  it("surfaces API conflict messages from the backend", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json(
        {
          error: "Conflict",
          message: "Farmer phone already exists",
          status: 409,
        },
        { status: 409 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    localStorage.setItem("ftf.session", JSON.stringify({ token: "token", user: { role: "ADMIN" } }));
    const { farmerApi } = await import("./admin-api");

    await expect(
      farmerApi.create({
        bio: null,
        farmerCode: "",
        introVideoUrl: null,
        joinedDate: "2026-07-19",
        name: "Test",
        phone: "9876543210",
        profilePhotoUrl: null,
        state: "Karnataka",
        district: "Bangalore",
        village: "Test",
      }),
    ).rejects.toThrow("Farmer phone already exists");
  });

  it("surfaces nginx upload size errors", async () => {
    const fetchMock = vi.fn(async () =>
      new Response("<html><title>413 Request Entity Too Large</title></html>", {
        status: 413,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    localStorage.setItem("ftf.session", JSON.stringify({ token: "token", user: { role: "ADMIN" } }));
    const { farmerApi } = await import("./admin-api");

    await expect(
      farmerApi.uploadIntroVideo(
        "3c08b135-304f-4d6d-b16c-4f884b929b95",
        new File(["video"], "intro.mp4", { type: "video/mp4" }),
      ),
    ).rejects.toThrow("413 Request Entity Too Large");
  });
});
