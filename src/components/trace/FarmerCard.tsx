import type { PublicTraceFarmer } from "@/types/public-trace";
import { SignedMedia } from "@/components/SignedMedia";
import { TraceAccordionCard } from "./TraceAccordionCard";
import { CheckIcon, compactLocation, farmerPhotoThumbnailSrc, FieldRow, formatDate, LeafIcon } from "./trace-utils";

export function FarmerCard({ farmer }: { farmer?: PublicTraceFarmer | null }) {
  const location = compactLocation(farmer?.village, farmer?.district, farmer?.state);
  const contact = farmer?.phone;

  return (
    <TraceAccordionCard
      accent="bg-emerald-50 text-emerald-800"
      defaultOpen
      icon={
        farmer?.profilePhotoUrl ? (
          <SignedMedia
            alt={`${farmer.name || "Farmer"} profile photo`}
            className="h-full w-full object-cover"
            kind="image"
            loading="lazy"
            src={farmer.profilePhotoUrl}
            thumbnailSrc={farmerPhotoThumbnailSrc(farmer)}
          />
        ) : (
          <LeafIcon className="h-9 w-9" />
        )
      }
      openContent={({ isOpen }) => (
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
          {farmer?.introVideoUrl && isOpen ? (
            <SignedMedia
              alt={`${farmer.name || "Farmer"} introduction video`}
              className="aspect-video w-full rounded-3xl bg-stone-950 object-cover"
              kind="video"
              src={farmer.introVideoUrl}
            />
          ) : farmer?.introVideoUrl ? (
            <div className="flex aspect-video w-full items-center justify-center rounded-3xl bg-stone-100 px-4 text-center text-sm text-stone-600">
              Expand this section to play the farmer intro video.
            </div>
          ) : (
            <div className="rounded-3xl bg-stone-50 p-4 text-sm text-stone-600">
              Farmer intro video is not available yet.
            </div>
          )}
        </div>
      )}
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
