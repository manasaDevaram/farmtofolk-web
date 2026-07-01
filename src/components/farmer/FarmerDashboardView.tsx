"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { LeafMark } from "@/components/assets/FarmToFolkAssets";
import { Card, ErrorState, InfoGrid, LoadingState } from "@/components/admin/AdminPrimitives";
import { SignedMedia } from "@/components/SignedMedia";
import { farmerDashboardApi } from "@/lib/admin-api";
import type {
  FarmerDashboardSummaryResponse,
  FarmerDashboardWorkBatchResponse,
} from "@/types/admin";

const shown = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? "Not available" : String(value);

function BatchCard({ batch }: { batch: FarmerDashboardWorkBatchResponse }) {
  return (
    <article className="rounded-2xl border border-[var(--ftf-border)] bg-white/55 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-xl font-bold">{shown(batch.cropName)}</h3>
          <p className="text-sm text-[var(--ftf-muted)]">Batch ID: {shown(batch.batchId)}</p>
        </div>
        <span className="ftf-stamp">{batch.batchCode}</span>
      </div>
      <div className="mt-4">
        <InfoGrid
          items={[
            { label: "Batch status", value: shown(batch.batchStatus) },
            { label: "Latest trace status", value: shown(batch.currentTraceStatus) },
            { label: "Payment status", value: shown(batch.paymentStatus) },
            { label: "Quantity produced", value: shown(batch.quantityProduced) },
            { label: "Quantity sold", value: shown(batch.quantitySold) },
            { label: "Quantity remaining", value: shown(batch.remainingQuantity) },
            { label: "Farmer price per unit", value: shown(batch.farmerPrice) },
            { label: "Consumer price", value: shown(batch.consumerPrice) },
            { label: "Farmer amount payable", value: shown(batch.amountPayable) },
            { label: "Total sale amount", value: shown(batch.saleAmount) },
            { label: "Harvest date", value: shown(batch.harvestDate) },
            { label: "Last updated", value: shown(batch.lastUpdated) },
          ]}
        />
      </div>
    </article>
  );
}

export function FarmerDashboardView() {
  const [summary, setSummary] = useState<FarmerDashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSummary(await farmerDashboardApi.summary());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => void load(), [load]);

  return (
    <main className="ftf-paper min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center gap-3 text-[var(--ftf-green-900)]">
          <LeafMark className="h-11 w-11" />
          <div>
            <p className="ftf-display text-2xl font-bold">FarmToFolk Farmer</p>
            <p className="text-sm text-[var(--ftf-muted)]">Your farms, batches, and payments</p>
          </div>
        </header>
        <h1 className="mt-8 text-3xl font-bold">Farmer Profile</h1>
        <div className="mt-4">{loading ? <LoadingState label="Loading your farm records..." /> : null}</div>
        {error ? <ErrorState message={error} onRetry={load} /> : null}
        {summary ? (
          <>
            <Card>
              <div className="mb-5 grid gap-4 sm:grid-cols-2">
                {summary.farmer.profilePhotoUrl ? (
                  <SignedMedia
                    alt={`${summary.farmer.name} profile photo`}
                    className="aspect-square max-h-72 w-full rounded-2xl object-cover"
                    kind="image"
                    onReload={load}
                    src={summary.farmer.profilePhotoUrl}
                  />
                ) : null}
                {summary.farmer.introVideoUrl ? (
                  <SignedMedia
                    alt={`${summary.farmer.name} introduction video`}
                    className="aspect-video w-full rounded-2xl bg-stone-950 object-cover"
                    kind="video"
                    onReload={load}
                    src={summary.farmer.introVideoUrl}
                  />
                ) : null}
              </div>
              <InfoGrid items={[
                { label: "Name", value: summary.farmer.name },
                { label: "Farmer code", value: summary.farmer.farmerCode },
                { label: "Phone", value: summary.farmer.phone },
                { label: "Location", value: [summary.farmer.village, summary.farmer.district, summary.farmer.state].filter(Boolean).join(", ") },
              ]} />
            </Card>
            <div className="mt-5 space-y-5">
              {!summary.farms.length ? <Card><p className="text-center font-bold text-[var(--ftf-muted)]">No farms added yet.</p></Card> : null}
              {summary.farms.map(({ farm, batches }) => (
                <Card key={farm.id}>
                  <h2 className="text-2xl font-bold">{farm.farmName}</h2>
                  <p className="mt-1 text-sm text-[var(--ftf-muted)]">{[farm.village, farm.district, farm.state].filter(Boolean).join(", ")}</p>
                  {!batches.length ? <p className="mt-5 rounded-xl bg-[var(--ftf-sage)]/45 p-4 text-sm font-bold text-[var(--ftf-muted)]">No batches yet for this farm.</p> : null}
                  {batches.length ? <div className="mt-5 grid gap-4">{batches.map((batch) => <BatchCard batch={batch} key={batch.batchId} />)}</div> : null}
                </Card>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
