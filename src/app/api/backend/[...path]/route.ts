const DEFAULT_BACKEND_API_BASE_URL = "http://13.233.206.171:8080";

export const dynamic = "force-dynamic";

type BackendRouteContext = {
  params: Promise<{ path: string[] }>;
};

// Proxies browser-safe same-origin requests to the Spring Boot backend.
async function proxyToBackend(request: Request, context: BackendRouteContext) {
  const { path } = await context.params;
  const backendBaseUrl = (process.env.BACKEND_API_BASE_URL ?? DEFAULT_BACKEND_API_BASE_URL).replace(
    /\/$/,
    "",
  );
  const search = new URL(request.url).search;
  const backendPath = path.map(encodeURIComponent).join("/");
  const backendUrl = `${backendBaseUrl}/${backendPath}${search}`;
  const method = request.method.toUpperCase();
  const headers = buildForwardHeaders(request.headers);
  const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  let backendResponse: Response;

  try {
    backendResponse = await fetch(backendUrl, {
      body,
      cache: "no-store",
      headers,
      method,
    });
  } catch (error) {
    console.error("Backend proxy network error", { backendUrl, error });
    return Response.json(
      { message: "Backend service is unavailable. Please try again shortly." },
      { status: 502 },
    );
  }

  return new Response(await backendResponse.arrayBuffer(), {
    headers: buildResponseHeaders(backendResponse.headers),
    status: backendResponse.status,
    statusText: backendResponse.statusText,
  });
}

function buildForwardHeaders(source: Headers) {
  const headers = new Headers();
  const contentType = source.get("content-type");
  const accept = source.get("accept");
  const authorization = source.get("authorization");

  if (contentType) headers.set("content-type", contentType);
  if (accept) headers.set("accept", accept);
  if (authorization) headers.set("authorization", authorization);

  return headers;
}

function buildResponseHeaders(source: Headers) {
  const headers = new Headers();
  const contentType = source.get("content-type");
  const contentDisposition = source.get("content-disposition");

  if (contentType) headers.set("content-type", contentType);
  if (contentDisposition) headers.set("content-disposition", contentDisposition);
  headers.set("cache-control", "no-store");

  return headers;
}

export const GET = proxyToBackend;
export const POST = proxyToBackend;
export const PUT = proxyToBackend;
export const PATCH = proxyToBackend;
export const DELETE = proxyToBackend;
