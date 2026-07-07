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
  const costShare =
    consumerPrice && operationalCost
      ? Math.round((operationalCost / consumerPrice) * 100)
      : 0;

  return (
    <TraceAccordionCard
      accent="bg-amber-100 text-amber-900"
      icon={<span className="text-5xl font-black">₹</span>}
      openContent={
        <div className="grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
          <div className="grid gap-3">
            <div className="rounded-3xl border border-stone-100 bg-stone-50 p-5">
              <p className="text-sm font-bold text-stone-600">You paid</p>
              <p className="mt-2 text-3xl font-black text-stone-950">
                {formatCurrency(consumerPrice)} / {unit}
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-sm font-bold text-stone-600">Farmer received</p>
              <p className="mt-2 text-3xl font-black text-emerald-800">
                {formatCurrency(farmerPrice)} / {unit}
              </p>
            </div>
          </div>
          <div
            className="relative mx-auto grid h-40 w-40 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#43a72d 0 ${farmerShare}%, #f5a400 ${farmerShare}% ${farmerShare + costShare}%, #eee ${farmerShare + costShare}% 100%)`,
            }}
          >
            <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center shadow-inner">
              <div>
                <strong className="block text-2xl">{formatCurrency(consumerPrice)}</strong>
                <span className="text-xs text-stone-500">You paid</span>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-stone-100 p-5">
            <p className="text-sm font-bold text-stone-600">Farm-to-consumer cost</p>
            <p className="mt-2 text-3xl font-black text-stone-950">
              {formatCurrency(operationalCost)} / {unit}
            </p>
            <p className="mt-3 text-sm text-stone-600">
              Farmer share: <strong>{farmerShare}%</strong>
            </p>
            <p className="mt-1 text-sm text-stone-600">
              Farm-to-consumer cost: <strong>{costShare}%</strong>
            </p>
            <dl className="mt-4 space-y-1 border-t border-stone-100 pt-3 text-sm">
              <div className="flex justify-between"><dt>Wastage</dt><dd className="font-bold">{formatCurrency(wastageCost)}</dd></div>
              <div className="flex justify-between"><dt>Packaging</dt><dd className="font-bold">{formatCurrency(packagingCost)}</dd></div>
              <div className="flex justify-between"><dt>Operation cost</dt><dd className="font-bold">{formatCurrency(operationalCost)}</dd></div>
              <div className="flex justify-between text-emerald-800"><dt>Margin</dt><dd className="font-black">{formatCurrency(margin)}</dd></div>
            </dl>
          </div>
        </div>
      }
      summary={
        <>
          <div className="grid gap-2 font-bold text-stone-950 sm:grid-cols-3">
            <span>
              You paid: {formatCurrency(consumerPrice)} / {unit}
            </span>
            <span>
              Farmer received: {formatCurrency(farmerPrice)} / {unit}
            </span>
            <span>
              Farm-to-consumer cost: {formatCurrency(operationalCost)} / {unit}
            </span>
          </div>
        </>
      }
      title="Where Your Money Goes"
    />
  );
}
