import type { PublicTracePriceBreakdown } from "@/types/public-trace";
import { TraceAccordionCard } from "./TraceAccordionCard";
import { formatCurrency, formatPercent } from "./trace-utils";

const rows: Array<{
  key: keyof PublicTracePriceBreakdown;
  label: string;
  color: string;
}> = [
  { color: "bg-emerald-700", key: "farmerPrice", label: "Farmer" },
  { color: "bg-amber-500", key: "transportCost", label: "Transport" },
  { color: "bg-sky-500", key: "packingCost", label: "Packing" },
  { color: "bg-lime-600", key: "organizationCost", label: "Organization" },
  { color: "bg-violet-500", key: "platformCost", label: "Platform" },
];

export function MoneyBreakdownCard({
  priceBreakdown,
}: {
  priceBreakdown?: PublicTracePriceBreakdown | null;
}) {
  const consumerPrice = priceBreakdown?.consumerPrice;
  const farmerPrice = priceBreakdown?.farmerPrice;
  const unit = priceBreakdown?.priceUnit || "kg";
  const farmerPercent = formatPercent(farmerPrice, consumerPrice);

  return (
    <TraceAccordionCard
      accent="bg-amber-100 text-amber-900"
      icon={<span className="text-5xl font-black">₹</span>}
      openContent={
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.4fr]">
          <div className="rounded-3xl border border-stone-100 bg-stone-50 p-5">
            <p className="text-sm font-bold text-stone-600">You Paid (Retail Price)</p>
            <p className="mt-2 text-3xl font-black text-stone-950">
              {formatCurrency(consumerPrice)} / {unit}
            </p>
            <div className="my-5 h-px bg-stone-200" />
            <p className="text-sm font-bold text-stone-600">Farmer Received</p>
            <p className="mt-2 text-3xl font-black text-emerald-800">
              {formatCurrency(farmerPrice)} / {unit}
            </p>
            <p className="font-black text-emerald-800">({farmerPercent})</p>
          </div>
          <div className="rounded-3xl border border-stone-100 p-5">
            <h3 className="font-black text-stone-950">Price breakdown</h3>
            <div className="mt-4 space-y-4">
              {rows.map((row) => {
                const value = priceBreakdown?.[row.key];
                const percent = formatPercent(value as number | null, consumerPrice);
                const width = percent === "N/A" ? "0%" : percent;

                return (
                  <div key={row.key}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                      <span className="font-bold text-stone-800">{row.label}</span>
                      <span className="font-black text-stone-950">
                        {formatCurrency(value as number | null)} - {percent}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                      <div className={`h-full rounded-full ${row.color}`} style={{ width }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      }
      summary={
        <>
          <p>
            Farmer gets <span className="font-black text-emerald-800">{farmerPercent}</span> of what
            you pay
          </p>
          <div className="mt-2 grid gap-2 font-bold text-stone-950 sm:grid-cols-2">
            <span>
              Farmer Received: {formatCurrency(farmerPrice)} / {unit}
            </span>
            <span>
              You Paid: {formatCurrency(consumerPrice)} / {unit}
            </span>
          </div>
        </>
      }
      title="Where Your Money Goes"
    />
  );
}
