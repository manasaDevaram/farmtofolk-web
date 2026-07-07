import type { PublicTraceBatch, PublicTraceMedia } from "@/types/public-trace";
import { SignedMedia } from "@/components/SignedMedia";
import { CheckIcon, formatDate, isVideo, mediaSrc } from "./trace-utils";

export function TraceHero({
  batch,
  farmMedia,
}: {
  batch?: PublicTraceBatch | null;
  farmMedia?: PublicTraceMedia[] | null;
}) {
  const cropName = batch?.cropName || "Fresh Produce";
  const heroMedia = farmMedia?.find((item) => item.isPublic) ?? farmMedia?.[0];
  const heroImage = mediaSrc(heroMedia);

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-emerald-950 shadow-[0_20px_50px_rgba(32,72,45,0.16)]">
      {heroImage ? (
        <SignedMedia
          alt="Featured farm media"
          className="absolute inset-0 h-full w-full object-cover"
          kind={isVideo(heroMedia) ? "video" : "image"}
          src={heroImage}
        />
      ) : null}
      <div
        className={`absolute inset-0 ${heroImage ? "bg-gradient-to-r from-[#f8f5ed] via-[#f8f5ed]/90 to-transparent" : "bg-gradient-to-br from-emerald-50 via-lime-50 to-emerald-800"}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/10 via-transparent to-white/5" />
      <div className="relative min-h-64 p-7 sm:min-h-80 sm:p-10">
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
        <dl className="mt-6 grid max-w-lg gap-3 text-sm text-stone-700">
          <div>
            <dt className="font-semibold text-stone-500">Harvested</dt>
            <dd className="font-black text-stone-950">{formatDate(batch?.harvestDate)}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
