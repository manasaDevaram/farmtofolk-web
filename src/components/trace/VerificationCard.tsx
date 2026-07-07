import type { PublicTraceLastVerified, PublicTraceMedia } from "@/types/public-trace";
import { TraceAccordionCard } from "./TraceAccordionCard";
import { CheckIcon, formatDate, LeafIcon, MediaTile } from "./trace-utils";

export function VerificationCard({
  evidence,
  lastVerified,
}: {
  evidence?: PublicTraceMedia[] | null;
  lastVerified?: PublicTraceLastVerified | null;
}) {
  const publicEvidence = evidence?.filter((item) => item.isPublic !== false) ?? [];
  if (!lastVerified || publicEvidence.length === 0) {
    return null;
  }

  return (
    <TraceAccordionCard
      accent="bg-emerald-50 text-emerald-800"
      icon={<LeafIcon className="h-9 w-9" />}
      openContent={
        <div>
          <h3 className="mb-3 font-black text-stone-950">Verification evidence</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {publicEvidence.slice(0, 6).map((media, index) => (
              <MediaTile
                alt={media.caption || `Verification evidence ${index + 1}`}
                className="aspect-[4/3]"
                key={`${media.id ?? index}`}
                media={media}
              />
            ))}
          </div>
        </div>
      }
      summary={
        <>
          <p>
            Last verified on{" "}
            <span className="font-bold text-stone-950">
              {formatDate(lastVerified.verificationDate)}
            </span>
          </p>
          <p className="mt-1 inline-flex items-center gap-2 font-bold text-emerald-800">
            <CheckIcon className="h-4 w-4" />
            {publicEvidence.length} verification document{publicEvidence.length === 1 ? "" : "s"}{" "}
            available
          </p>
        </>
      }
      title="Agroecology Verification"
    />
  );
}
