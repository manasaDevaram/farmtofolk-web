import type { PublicTraceResponse } from "@/types/public-trace";
import { TraceAccordionCard } from "./TraceAccordionCard";
import { CheckIcon } from "./trace-utils";

const badges = [
  "Farmer Verified",
  "Farm Verified",
  "Evidence Available",
  "Transparent Pricing",
  "Traceable Batch",
  "Data Integrity Ready",
];

export function TrustSummaryCard({ trace }: { trace: PublicTraceResponse }) {
  const active = new Set<string>();

  if (trace.farmer) active.add("Farmer Verified");
  if (trace.farm) active.add("Farm Verified");
  if (trace.verificationEvidence?.some((item) => item.isPublic)) {
    active.add("Evidence Available");
  }
  if (trace.priceBreakdown?.consumerPrice) active.add("Transparent Pricing");
  if (trace.batch || trace.qrCode) active.add("Traceable Batch");
  active.add("Data Integrity Ready");

  return (
    <TraceAccordionCard
      accent="bg-sky-50 text-sky-800"
      icon={
        <svg
          aria-hidden="true"
          className="h-9 w-9"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 3 5 6v5.5c0 4.2 2.8 7.9 7 9.5 4.2-1.6 7-5.3 7-9.5V6l-7-3Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="m8.5 12 2.2 2.2 4.8-5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      }
      openContent={
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((badge) => {
            const isActive = active.has(badge);
            return (
              <div
                className={`flex items-center gap-3 rounded-2xl border p-4 ${
                  isActive
                    ? "border-emerald-100 bg-emerald-50 text-emerald-950"
                    : "border-stone-100 bg-stone-50 text-stone-500"
                }`}
                key={badge}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isActive ? "bg-emerald-700 text-white" : "bg-stone-200"
                  }`}
                >
                  <CheckIcon className="h-4 w-4" />
                </span>
                <span className="font-black">{badge}</span>
              </div>
            );
          })}
        </div>
      }
      summary={
        <p>
          Trust signals based on verified people, farm evidence, pricing, and
          batch traceability.
        </p>
      }
      title="Trust Summary"
    />
  );
}
