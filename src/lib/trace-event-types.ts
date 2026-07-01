export const DEFAULT_TRACE_EVENT_TYPES = [
  "HARVESTED",
  "PACKED",
  "RECEIVED_AT_MARKET",
  "SOLD",
] as const;

// Keep the UI behind an async boundary so this implementation can switch to
// GET /api/trace-event-types without changing the form component.
export async function getTraceEventTypes(): Promise<string[]> {
  return [...DEFAULT_TRACE_EVENT_TYPES];
}
