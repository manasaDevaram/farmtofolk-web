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
  const verificationStatus = trace.latestVerification?.status?.toUpperCase();
  if (verificationStatus === "VERIFIED" || verificationStatus === "APPROVED") {
    active.add("Farm Verified");
  }
  if (trace.verificationEvidence?.some((item) => item.isPublic)) {
    active.add("Evidence Available");
  }
  if (trace.batch?.consumerPricePerUnit != null) active.add("Transparent Pricing");
  if (trace.batch || trace.qrCode) active.add("Traceable Batch");
  active.add("Data Integrity Ready");
  const score = Math.round((active.size / badges.length) * 100);

  return (
    <TraceAccordionCard
      accent="bg-sky-50 text-sky-800"
      icon={
        <svg aria-hidden="true" className="h-9 w-9" fill="none" viewBox="0 0 24 24">
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
        <div className="grid items-center gap-5 sm:grid-cols-[150px_1fr]">
          <div className="mx-auto grid h-32 w-32 place-items-center rounded-full border-[12px] border-emerald-600 bg-white text-center shadow-inner">
            <div>
              <strong className="block text-4xl text-emerald-900">{score}</strong>
              <span className="text-xs">/100</span>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
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
        </div>
      }
      summary={
        <p>
          <strong className="text-stone-950">{score}/100</strong> · Based on verification,
          transparency and evidence.
        </p>
      }
      title="Trust Score"
    />
  );
}
