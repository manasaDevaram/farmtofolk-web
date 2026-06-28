import type { PublicTraceBatch, PublicTraceMedia } from "@/types/public-trace";
import { CheckIcon, formatDate, mediaSrc } from "./trace-utils";

export function TraceHero({
  batch,
  farmMedia,
}: {
  batch?: PublicTraceBatch | null;
  farmMedia?: PublicTraceMedia[] | null;
}) {
  const cropName = batch?.cropName || "Fresh Produce";
  const heroImage = mediaSrc(farmMedia?.find((item) => item.isPublic) ?? farmMedia?.[0]);

  return (
    <section
      className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-emerald-950 shadow-[0_20px_50px_rgba(32,72,45,0.16)]"
      style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_45%,rgba(239,68,68,0.85)_0_9%,transparent_10%),radial-gradient(circle_at_70%_55%,rgba(220,38,38,0.9)_0_11%,transparent_12%),radial-gradient(circle_at_91%_60%,rgba(248,113,113,0.82)_0_8%,transparent_9%),linear-gradient(100deg,#f8f3e9_0%,rgba(248,243,233,0.92)_36%,rgba(248,243,233,0.22)_62%,rgba(31,90,45,0.15)_100%)] bg-cover bg-center" />
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_60%_48%,#ef4444_0_12%,transparent_13%),radial-gradient(circle_at_78%_56%,#dc2626_0_10%,transparent_11%),radial-gradient(circle_at_45%_60%,#f97316_0_9%,transparent_10%)] opacity-80 sm:block" />
      <div className="relative min-h-64 bg-gradient-to-r from-[#f8f3e9] via-[#f8f3e9]/90 to-transparent p-7 sm:min-h-80 sm:p-10">
        <p className="text-lg font-medium text-stone-900">You are holding</p>
        <h1 className="mt-4 max-w-xl text-4xl font-black tracking-tight text-stone-950 sm:text-6xl">
          Organic {cropName}
        </h1>
        <p className="mt-4 text-lg font-medium text-stone-800 sm:text-2xl">
          Grown with care. Delivered with trust.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-base font-black text-emerald-950">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-white">
            <CheckIcon className="h-4 w-4" />
          </span>
          100% Traceable
        </div>
        <dl className="mt-6 grid max-w-lg gap-3 text-sm text-stone-700 sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-stone-500">Harvested</dt>
            <dd className="font-black text-stone-950">{formatDate(batch?.harvestDate)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-stone-500">Best before</dt>
            <dd className="font-black text-stone-950">{formatDate(batch?.bestBeforeDate)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
