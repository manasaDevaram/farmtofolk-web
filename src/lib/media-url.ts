export function cleanMediaUrl(url?: string | null): string | null {
  return url?.trim().replace(/(?:%22|")+$/gi, "") || null;
}
