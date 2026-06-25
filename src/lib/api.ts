import type { PublicTraceResponse } from "@/types/public-trace";

const DEFAULT_API_BASE_URL = "http://localhost:8080";

export async function getPublicTrace(
  publicToken: string,
): Promise<PublicTraceResponse> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    DEFAULT_API_BASE_URL;
  const endpoint = `${baseUrl}/api/public/trace/${encodeURIComponent(publicToken)}`;

  let response: Response;

  try {
    console.log("API URL:", endpoint);
    response = await fetch(endpoint, { cache: "no-store" });
  } catch {
    throw new Error(
      "Unable to reach FarmToFolk trace service. Please check your connection and try again.",
    );
  }

  if (!response.ok) {
    let message = `Trace lookup failed with status ${response.status}.`;

    try {
      const body = (await response.json()) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      // Keep the readable status message when the backend does not return JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<PublicTraceResponse>;
}
