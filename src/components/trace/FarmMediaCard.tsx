import type { PublicTraceMedia } from "@/types/public-trace";
import { TraceAccordionCard } from "./TraceAccordionCard";
import { MediaTile } from "./trace-utils";

export function FarmMediaCard({ farmMedia }: { farmMedia?: PublicTraceMedia[] | null }) {
  const media = farmMedia ?? [];
  const remaining = Math.max(media.length - 3, 0);

  return (
    <TraceAccordionCard
      accent="bg-fuchsia-50 text-fuchsia-800"
      icon={
        <svg aria-hidden="true" className="h-9 w-9" fill="none" viewBox="0 0 24 24">
          <path
            d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.1-1.6h6.4L16.3 6h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="12.5" r="3" stroke="currentColor" strokeWidth="2" />
        </svg>
      }
      openContent={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {media.map((item, index) => (
            <div key={`${item.id ?? index}`}>
              <MediaTile
                alt={item.caption || `Farm media ${index + 1}`}
                className="aspect-square"
                media={item}
              />
              {item.caption ? (
                <p className="mt-2 text-center text-xs font-semibold text-stone-600">
                  {item.caption}
                </p>
              ) : null}
            </div>
          ))}
          {!media.length ? (
            <p className="col-span-full rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
              Farm photos and videos are not available yet.
            </p>
          ) : null}
        </div>
      }
      summary={
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p>Glimpse of the farmer and their farm</p>
          </div>
          <div className="flex items-center gap-2">
            {media.slice(0, 3).map((item, index) => (
              <MediaTile
                alt={item.caption || `Farm media preview ${index + 1}`}
                className="h-14 w-14"
                key={`${item.id ?? index}`}
                media={item}
              />
            ))}
            {remaining ? (
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-sm font-black text-stone-800">
                +{remaining}
              </span>
            ) : null}
          </div>
        </div>
      }
      title="Farm Photos & Video"
    />
  );
}
