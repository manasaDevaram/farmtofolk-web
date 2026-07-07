import type { PublicTraceBatch } from "@/types/public-trace";
import { TraceAccordionCard } from "./TraceAccordionCard";
import { formatCurrency } from "./trace-utils";

type Breakdown = {
  consumerPrice: number;
  farmerPrice: number;
  wastageCost: number;
  packagingCost: number;
  operationalCost: number;
  margin: number;
  priceUnit: string;
};

const breakdownItems = [
  { color: "#43a72d", key: "farmerPrice" as const, label: "Farmer" },
  { color: "#f59e0b", key: "wastageCost" as const, label: "Wastage" },
  { color: "#3b82f6", key: "packagingCost" as const, label: "Packaging" },
  { color: "#8b5cf6", key: "operationalCost" as const, label: "Operations" },
  { color: "#f97316", key: "margin" as const, label: "Margin" },
];

export function MoneyBreakdownCard({
  batch,
  priceBreakdown,
}: {
  batch?: PublicTraceBatch | null;
  priceBreakdown?: Breakdown | null;
}) {
  if (!priceBreakdown) {
    return null;
  }

  const consumerPrice = priceBreakdown.consumerPrice;
  const unit = priceBreakdown.priceUnit || batch?.unit || "unit";
  const items = breakdownItems
    .map((item) => ({
      ...item,
      value: priceBreakdown[item.key] ?? 0,
    }))
    .filter((item) => item.value > 0);
  const farmerPrice = priceBreakdown.farmerPrice ?? 0;
  const farmerShare =
    consumerPrice && farmerPrice ? Math.round((farmerPrice / consumerPrice) * 100) : 0;
  let runningPercent = 0;
  const chartStops = items.map((item) => {
    const start = runningPercent;
    const percentage = consumerPrice ? (item.value / consumerPrice) * 100 : 0;
    runningPercent += percentage;
    return `${item.color} ${start}% ${runningPercent}%`;
  });
  const percent = (value: number) => {
    if (!consumerPrice) return "0%";
    const result = (value / consumerPrice) * 100;
    return `${Number.isInteger(result) ? result : result.toFixed(1)}%`;
  };

  return (
    <TraceAccordionCard
      accent="bg-amber-100 text-amber-900"
      icon={<span className="text-5xl font-black">₹</span>}
      openContent={
        <div>
          <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div
              className="relative mx-auto grid h-44 w-44 place-items-center rounded-full"
              style={{
                background:
                  chartStops.length > 0
                    ? `conic-gradient(${chartStops.join(", ")})`
                    : "conic-gradient(#e7e5e4 0% 100%)",
              }}
            >
              <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center shadow-inner">
                <div>
                  <strong className="block text-2xl">{formatCurrency(consumerPrice)}</strong>
                  <span className="text-xs text-stone-500">per {unit}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-black text-stone-950">Price breakdown</p>
              <dl className="space-y-2 text-sm">
                {items.map((item) => (
                  <div
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-stone-100 pb-2 last:border-0"
                    key={item.label}
                  >
                    <dt className="flex items-center gap-2 font-semibold text-stone-700">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </dt>
                    <dd className="font-bold text-stone-950">{formatCurrency(item.value)}</dd>
                    <dd className="w-12 text-right font-semibold text-stone-500">
                      {percent(item.value)}
                    </dd>
                  </div>
                ))}
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-t border-stone-300 pt-2 font-black">
                  <dt>Total</dt>
                  <dd>{formatCurrency(consumerPrice)}</dd>
                  <dd className="w-12 text-right">100%</dd>
                </div>
              </dl>
            </div>
          </div>
          {farmerShare > 0 ? (
            <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
              <strong>Your impact:</strong> this purchase sends {farmerShare}% directly to the farmer.
            </div>
          ) : null}
        </div>
      }
      summary={<p>Transparent distribution of the retail price.</p>}
      title="Where Your Money Goes"
    />
  );
}
