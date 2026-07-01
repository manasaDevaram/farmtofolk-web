import type { PublicTraceBatch } from "@/types/public-trace";
import { TraceAccordionCard } from "./TraceAccordionCard";
import { formatCurrency } from "./trace-utils";

export function MoneyBreakdownCard({ batch }: { batch?: PublicTraceBatch | null }) {
  const consumerPrice = batch?.consumerPricePerUnit;
  const farmerPrice = batch?.farmerPricePerUnit;
  const operationalCost = batch?.operationalCostPerUnit;
  const unit = batch?.unit || "unit";

  return (
    <TraceAccordionCard
      accent="bg-amber-100 text-amber-900"
      icon={<span className="text-5xl font-black">₹</span>}
      openContent={
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-stone-100 bg-stone-50 p-5">
            <p className="text-sm font-bold text-stone-600">You paid</p>
            <p className="mt-2 text-3xl font-black text-stone-950">
              {formatCurrency(consumerPrice)} / {unit}
            </p>
          </div>
          <div className="rounded-3xl border border-stone-100 bg-emerald-50 p-5">
            <p className="text-sm font-bold text-stone-600">Farmer received</p>
            <p className="mt-2 text-3xl font-black text-emerald-800">
              {formatCurrency(farmerPrice)} / {unit}
            </p>
          </div>
          <div className="rounded-3xl border border-stone-100 p-5">
            <p className="text-sm font-bold text-stone-600">Farm-to-consumer cost</p>
            <p className="mt-2 text-3xl font-black text-stone-950">
              {formatCurrency(operationalCost)} / {unit}
            </p>
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
