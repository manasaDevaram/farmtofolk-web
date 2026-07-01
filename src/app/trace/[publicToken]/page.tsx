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
import { LeafIcon } from "@/components/trace/trace-utils";

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
    <main className="min-h-screen bg-[#f8f3e9] px-3 py-3 text-stone-950 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1100px] rounded-[2rem] bg-white/78 p-4 shadow-[0_22px_70px_rgba(50,45,34,0.12)] ring-1 ring-white/80 sm:p-8">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 text-emerald-950">
              <LeafIcon className="h-10 w-10 text-emerald-800" />
              <span className="text-3xl font-black tracking-tight">FarmToFolk</span>
            </div>
            <p className="mt-2 text-base font-medium text-stone-800 sm:text-lg">
              Traceable. Transparent. Trusted.
            </p>
          </div>
          <button
            aria-label="Language selector"
            className="rounded-full px-3 py-2 text-sm font-black text-stone-950 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
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
            verification={trace.latestVerification}
          />
          <MoneyBreakdownCard batch={trace.batch} />
          <FarmMediaCard farmMedia={trace.farmMedia} />
          <TrustSummaryCard trace={trace} />
          <ProductDetailsCard batch={trace.batch} traceEvents={trace.traceEvents} />
        </div>

        <TraceFooter />
      </div>
    </main>
  );
}
