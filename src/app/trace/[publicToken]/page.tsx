import { FarmCard } from "@/components/trace/FarmCard";
import { FarmMediaCard } from "@/components/trace/FarmMediaCard";
import { FarmerCard } from "@/components/trace/FarmerCard";
import { MoneyBreakdownCard } from "@/components/trace/MoneyBreakdownCard";
import { ProductDetailsCard } from "@/components/trace/ProductDetailsCard";
import { ErrorState } from "@/components/trace/ErrorState";
import { TraceFooter } from "@/components/trace/TraceFooter";
import { TraceHero } from "@/components/trace/TraceHero";
import { TrustSummaryCard } from "@/components/trace/TrustSummaryCard";
import { VerificationCard } from "@/components/trace/VerificationCard";
import { getPublicTrace } from "@/lib/api";
import { LeafMark } from "@/components/assets/FarmToFolkAssets";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/constants";

export default async function PublicTracePage({
  params,
}: {
  params: Promise<{ publicToken: string }>;
}) {
  const { publicToken } = await params;
  const trace = await getPublicTrace(publicToken).catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : "We could not load this trace page right now.";

    return { error: message };
  });

  if ("error" in trace) {
    return <ErrorState message={trace.error} />;
  }

  return (
    <main className="trace-page min-h-screen px-3 py-3 text-[var(--ftf-text)] sm:px-6 sm:py-6">
      <div className="trace-surface mx-auto max-w-[1100px] rounded-[30px] border border-[var(--ftf-border)] p-4 backdrop-blur sm:p-8">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-[var(--ftf-green-900)]">
              <LeafMark className="h-11 w-11" />
              <span className="ftf-display text-3xl font-bold">{BRAND_NAME}</span>
            </div>
            <p className="mt-2 text-base font-medium text-stone-800 sm:text-lg">
              {BRAND_TAGLINE}
            </p>
          </div>
          <button
            aria-label="Language selector"
            className="ftf-focus rounded-xl border border-[var(--ftf-border)] bg-white/65 px-3 py-2 text-sm font-bold text-[var(--ftf-green-900)] shadow-sm transition hover:bg-[var(--ftf-sage)]"
            type="button"
          >
            EN v
          </button>
        </header>

        <TraceHero batch={trace.batch} farmMedia={trace.farmMedia} />

        <div className="mt-4 space-y-4">
          <FarmerCard farmer={trace.farmer} />
          <FarmCard farm={trace.farm} farmMedia={trace.farmMedia} />
          <VerificationCard
            evidence={trace.verificationEvidence}
            lastVerified={trace.lastVerified}
          />
          <MoneyBreakdownCard batch={trace.batch} priceBreakdown={trace.priceBreakdown} />
          <FarmMediaCard farmMedia={trace.farmMedia} />
          <TrustSummaryCard trace={trace} />
          <ProductDetailsCard batch={trace.batch} traceEvents={trace.traceEvents} />
        </div>

        <TraceFooter />
      </div>
    </main>
  );
}
