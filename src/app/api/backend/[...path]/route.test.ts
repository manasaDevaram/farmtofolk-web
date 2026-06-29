import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

const backendResponse = () =>
  new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" },
    status: 200,
  });

function routeContext(path: string[]) {
  return { params: Promise.resolve({ path }) };
}

describe("backend proxy route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("forwards the Authorization header to the backend", async () => {
    const fetchMock = vi.fn(async () => backendResponse());
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("BACKEND_API_BASE_URL", "http://backend.test");

    const request = new Request("http://localhost/api/backend/api/farmers", {
      headers: { Authorization: "Bearer signed-token" },
      method: "GET",
    });

    await GET(request, routeContext(["api", "farmers"]));

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://backend.test/api/farmers");
    expect((init?.headers as Headers).get("authorization")).toBe("Bearer signed-token");
  });

  it("forwards JSON requests with content type and body", async () => {
    const fetchMock = vi.fn(async () => backendResponse());
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("BACKEND_API_BASE_URL", "http://backend.test");

    const payload = { emailOrPhone: "admin@farmtofolk.in", password: "password123" };
    const request = new Request("http://localhost/api/backend/api/auth/login", {
      body: JSON.stringify(payload),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    await POST(request, routeContext(["api", "auth", "login"]));

    const [, init] = fetchMock.mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get("content-type")).toBe("application/json");
    expect(headers.get("accept")).toBe("application/json");
    expect(new TextDecoder().decode(init?.body as ArrayBuffer)).toBe(JSON.stringify(payload));
  });

  it("forwards multipart uploads with content type and body", async () => {
    const fetchMock = vi.fn(async () => backendResponse());
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("BACKEND_API_BASE_URL", "http://backend.test");

    const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
    const multipartBody = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="profile.jpg"',
      "Content-Type: image/jpeg",
      "",
      "photo-bytes",
      `--${boundary}--`,
      "",
    ].join("\r\n");
    const body = new TextEncoder().encode(multipartBody);

    const request = new Request(
      "http://localhost/api/backend/api/farmers/farmer-1/profile-photo/upload",
      {
        body,
        headers: {
          Authorization: "Bearer signed-token",
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
        },
        method: "POST",
      },
    );

    await POST(request, routeContext(["api", "farmers", "farmer-1", "profile-photo", "upload"]));

    const [, init] = fetchMock.mock.calls[0];
    const headers = init?.headers as Headers;
    expect(headers.get("authorization")).toBe("Bearer signed-token");
    expect(headers.get("content-type")).toBe(`multipart/form-data; boundary=${boundary}`);
    expect(init?.body).toBeInstanceOf(ArrayBuffer);
    expect(new TextDecoder().decode(init?.body as ArrayBuffer)).toContain("photo-bytes");
  });
});
