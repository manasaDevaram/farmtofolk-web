import type { PublicTraceResponse } from "@/types/public-trace";

const SERVER_BACKEND_API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ?? "http://13.202.215.18:8080/api";

export async function getPublicTrace(publicToken: string): Promise<PublicTraceResponse> {
  const baseUrl = SERVER_BACKEND_API_BASE_URL.replace(/\/$/, "");

  let response: Response;

  try {
    response = await fetch(
      `${baseUrl}/public/trace/${encodeURIComponent(publicToken)}`,
      { cache: "no-store" },
    );
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
    } catch { }

    throw new Error(message);
  }

  return response.json() as Promise<PublicTraceResponse>;
}