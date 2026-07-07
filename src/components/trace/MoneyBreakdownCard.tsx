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

export function MoneyBreakdownCard({
  batch,
  priceBreakdown,
}: {
  batch?: PublicTraceBatch | null;
  priceBreakdown?: Breakdown | null;
}) {
  const consumerPrice = priceBreakdown?.consumerPrice ?? batch?.consumerPricePerUnit;
  const farmerPrice = priceBreakdown?.farmerPrice ?? batch?.farmerPricePerUnit;
  const operationalCost =
    priceBreakdown?.operationalCost ??
    batch?.operationalCostPerUnit ??
    batch?.farmToConsumerCostPerUnit;
  const wastageCost = priceBreakdown?.wastageCost ?? 0;
  const packagingCost = priceBreakdown?.packagingCost ?? 0;
  const margin =
    priceBreakdown?.margin ??
    (consumerPrice ?? 0) -
      (farmerPrice ?? 0) -
      wastageCost -
      packagingCost -
      (operationalCost ?? 0);
  const unit = priceBreakdown?.priceUnit || batch?.unit || "unit";
  const farmerShare =
    consumerPrice && farmerPrice ? Math.round((farmerPrice / consumerPrice) * 100) : 0;
  const items = [
    { color: "#43a72d", label: "Farmer", value: farmerPrice ?? 0 },
    { color: "#f59e0b", label: "Wastage", value: wastageCost },
    { color: "#3b82f6", label: "Packaging", value: packagingCost },
    { color: "#8b5cf6", label: "Operations", value: operationalCost ?? 0 },
    { color: "#f97316", label: "Margin", value: margin },
  ];
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
          <div className="grid items-center gap-6 lg:grid-cols-[0.8fr_0.8fr_1.4fr]">
            <div className="space-y-3">
              <div className="rounded-2xl border border-stone-100 bg-stone-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                  You paid (Retail price)
                </p>
                <p className="mt-2 text-3xl font-black text-stone-950">
                  {formatCurrency(consumerPrice)} / {unit}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
                  Farmer received
                </p>
                <p className="mt-2 text-3xl font-black text-emerald-800">
                  {formatCurrency(farmerPrice)} / {unit}
                </p>
                <p className="mt-1 font-bold text-emerald-700">{farmerShare}%</p>
              </div>
            </div>
            <div
              className="relative mx-auto grid h-44 w-44 place-items-center rounded-full"
              style={{ background: `conic-gradient(${chartStops.join(", ")})` }}
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
          <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            <strong>Your impact:</strong> this purchase sends {farmerShare}% directly to the farmer.
          </div>
        </div>
      }
      summary={
        <>
          <div className="grid gap-2 font-bold text-stone-950 sm:grid-cols-2">
            <span>
              You paid: {formatCurrency(consumerPrice)} / {unit}
            </span>
            <span>
              Farmer received: {formatCurrency(farmerPrice)} / {unit}
            </span>
          </div>
        </>
      }
      title="Where Your Money Goes"
    />
  );
}
