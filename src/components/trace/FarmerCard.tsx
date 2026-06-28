import type { PublicTraceFarmer } from "@/types/public-trace";
import { TraceAccordionCard } from "./TraceAccordionCard";
import { CheckIcon, compactLocation, FieldRow, formatDate, LeafIcon } from "./trace-utils";

export function FarmerCard({ farmer }: { farmer?: PublicTraceFarmer | null }) {
  const location = compactLocation(farmer?.village, farmer?.district, farmer?.state);
  const contact = farmer?.phone;

  return (
    <TraceAccordionCard
      accent="bg-emerald-50 text-emerald-800"
      icon={
        farmer?.profilePhotoUrl ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${farmer.profilePhotoUrl})` }}
          />
        ) : (
          <LeafIcon className="h-9 w-9" />
        )
      }
      openContent={
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr_1fr]">
          <dl>
            <FieldRow label="Joined" value={formatDate(farmer?.joinedDate)} />
            {contact ? <FieldRow label="Contact" value={contact} /> : null}
          </dl>
          <div className="rounded-3xl bg-stone-50 p-4">
            <h3 className="font-black text-stone-950">About {farmer?.name || "this farmer"}</h3>
            <p className="mt-2 leading-7 text-stone-700">
              {farmer?.bio || "This farmer profile is being enriched with more public details."}
            </p>
          </div>
          {farmer?.introVideoUrl ? (
            <a
              className="block rounded-3xl border border-emerald-100 bg-emerald-50 p-4 font-bold text-emerald-900"
              href={farmer.introVideoUrl}
              rel="noreferrer"
              target="_blank"
            >
              Watch farmer intro video
            </a>
          ) : (
            <div className="rounded-3xl bg-stone-50 p-4 text-sm text-stone-600">
              Farmer intro video is not available yet.
            </div>
          )}
        </div>
      }
      summary={
        <>
          <p className="font-bold text-stone-950">{farmer?.name || "Farmer details unavailable"}</p>
          <p>{location}</p>
        </>
      }
      title="Farmer"
    >
      <div className="mt-2 inline-flex items-center gap-2 text-sm font-black text-emerald-800">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 text-white">
          <CheckIcon className="h-3.5 w-3.5" />
        </span>
        {farmer?.active ? "Farmer Verified" : "Farmer Profile Available"}
      </div>
    </TraceAccordionCard>
  );
}
