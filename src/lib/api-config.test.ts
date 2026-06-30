import { afterEach, describe, expect, it, vi } from "vitest";

describe("API_BASE_URL", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("removes a trailing slash", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://backend.test/");

    const { API_BASE_URL } = await import("./api-config");

    expect(API_BASE_URL).toBe("https://backend.test");
  });

  it("fails clearly when the public API URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");

    await expect(import("./api-config")).rejects.toThrow(
      "NEXT_PUBLIC_API_BASE_URL is not configured",
    );
  });
});
