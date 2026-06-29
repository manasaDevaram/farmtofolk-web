import type { PublicTraceBatch, PublicTraceEvent } from "@/types/public-trace";
import { TraceAccordionCard } from "./TraceAccordionCard";
import { FieldRow, formatDate, formatNumber, toTitleCase } from "./trace-utils";

export function ProductDetailsCard({
  batch,
  traceEvents,
}: {
  batch?: PublicTraceBatch | null;
  traceEvents?: PublicTraceEvent[] | null;
}) {
  return (
    <TraceAccordionCard
      accent="bg-stone-100 text-stone-700"
      icon={<span className="text-4xl font-black">i</span>}
      openContent={
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <dl>
            <FieldRow label="Crop" value={batch?.cropName} />
            <FieldRow label="Variety" value={batch?.variety} />
            <FieldRow
              label="Quantity"
              value={
                batch?.quantity
                  ? `${formatNumber(batch.quantity)} ${batch.unit || ""}`.trim()
                  : null
              }
            />
            <FieldRow label="Harvest Date" value={formatDate(batch?.harvestDate)} />
            <FieldRow label="Packed Date" value={formatDate(batch?.packedDate)} />
            <FieldRow label="Best Before" value={formatDate(batch?.bestBeforeDate)} />
            <FieldRow label="Status" value={toTitleCase(batch?.status)} />
          </dl>
          <div>
            <h3 className="mb-3 font-black text-stone-950">Trace events</h3>
            <ol className="space-y-3">
              {(traceEvents ?? []).map((event, index) => (
                <li
                  className="rounded-2xl border border-stone-100 bg-stone-50 p-4"
                  key={`${event.id ?? index}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-black text-stone-950">{toTitleCase(event.eventType)}</p>
                    <time className="shrink-0 text-xs font-bold text-stone-500">
                      {formatDate(event.eventTime)}
                    </time>
                  </div>
                  {event.description ? (
                    <p className="mt-1 text-sm leading-6 text-stone-700">{event.description}</p>
                  ) : null}
                  {event.location ? (
                    <p className="mt-2 text-xs font-bold text-emerald-800">{event.location}</p>
                  ) : null}
                </li>
              ))}
              {!traceEvents?.length ? (
                <li className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                  Trace events are not available yet.
                </li>
              ) : null}
            </ol>
          </div>
        </div>
      }
      summary={
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p>Quick details about this produce</p>
          <p className="font-bold text-stone-950">Harvested on {formatDate(batch?.harvestDate)}</p>
        </div>
      }
      title="About This Product"
    />
  );
}
