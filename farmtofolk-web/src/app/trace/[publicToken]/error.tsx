"use client";

import { ErrorState } from "@/components/trace/ErrorState";

export default function TraceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState message={error.message} reset={reset} />;
}
