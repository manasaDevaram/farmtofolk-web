import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let getPublicTrace: typeof import("./api").getPublicTrace;

describe("getPublicTrace", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://backend.test");
    ({ getPublicTrace } = await import("./api"));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("fetches the public trace endpoint without caching", async () => {
    const fetchMock = vi.fn(async () => Response.json({ batch: { cropName: "Tomatoes" } }));
    vi.stubGlobal("fetch", fetchMock);

    const trace = await getPublicTrace("public token");

    expect(trace.batch?.cropName).toBe("Tomatoes");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.test/api/public/trace/public%20token",
      {
        cache: "no-store",
      },
    );
  });

  it("throws backend message when response is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ message: "Trace token not found." }, { status: 404 })),
    );

    await expect(getPublicTrace("missing")).rejects.toThrow("Trace token not found.");
  });

  it("throws readable message when network request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }),
    );

    await expect(getPublicTrace("offline")).rejects.toThrow(
      "Unable to reach FarmToFolk trace service.",
    );
  });
});
