import type { PublicTraceFarm, PublicTraceMedia } from "@/types/public-trace";
import { TraceAccordionCard } from "./TraceAccordionCard";
import {
  compactLocation,
  FieldRow,
  formatNumber,
  LeafIcon,
  MediaTile,
  toTitleCase,
} from "./trace-utils";

export function FarmCard({
  farm,
  farmMedia,
}: {
  farm?: PublicTraceFarm | null;
  farmMedia?: PublicTraceMedia[] | null;
}) {
  const size = farm?.sizeAcres;
  const location = compactLocation(farm?.village, farm?.district);

  return (
    <TraceAccordionCard
      accent="bg-lime-50 text-emerald-800"
      icon={<LeafIcon className="h-9 w-9" />}
      openContent={
        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <dl>
            <FieldRow label="Farm Size" value={size ? `${formatNumber(size)} acres` : null} />
            <FieldRow label="Farming Type" value={toTitleCase(farm?.farmingType)} />
            {farm?.altitudeMeters != null ? (
              <FieldRow
                label="Altitude"
                value={`${formatNumber(farm.altitudeMeters)} m above sea level`}
              />
            ) : null}
          </dl>
          <div>
            <h3 className="mb-3 font-black text-stone-950">Farm media</h3>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {(farmMedia?.slice(0, 5) ?? []).map((media, index) => (
                <MediaTile
                  alt={media.caption || `Farm media ${index + 1}`}
                  className="aspect-square"
                  key={`${media.id ?? index}`}
                  media={media}
                />
              ))}
              {!farmMedia?.length ? (
                <p className="col-span-full rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                  Farm photos are not available yet.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      }
      summary={
        <>
          <p className="font-bold text-stone-950">{farm?.farmName || "Farm details unavailable"}</p>
          <p>
            {size ? `${formatNumber(size)} Acres` : "Farm size unavailable"} - {location}
          </p>
        </>
      }
      title="Farm"
    />
  );
}
