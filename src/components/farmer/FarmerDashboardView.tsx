"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import { LeafMark } from "@/components/assets/FarmToFolkAssets";
import { BRAND_NAME } from "@/lib/constants";
import { Card, ErrorState, LoadingState } from "@/components/admin/AdminPrimitives";
import { SignedMedia } from "@/components/SignedMedia";
import { farmerDashboardApi } from "@/lib/admin-api";
import type { FarmerDashboardSummaryResponse } from "@/types/admin";

const money = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 0,
  style: "currency",
});

const quantity = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

function isPendingPayment(status: string | null | undefined) {
  const normalized = (status ?? "").toUpperCase();
  return normalized.includes("UNPAID") || normalized.includes("PENDING");
}

function SummaryMetric({
  label,
  note,
  tone,
  value,
}: {
  label: string;
  note: string;
  tone: "green" | "kraft" | "clay";
  value: number | string;
}) {
  return (
    <section className="ftf-card flex min-h-28 items-center gap-4 p-4">
      <div className={`ftf-watercolor-icon ftf-tone-${tone}`}>
        <span className="ftf-display text-xl font-bold">{label.slice(0, 1)}</span>
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-2 text-sm font-bold">{label}</p>
        <p className="mt-0.5 text-xs text-[var(--ftf-muted)]">{note}</p>
      </div>
    </section>
  );
}

function PaymentStatusBadge({ status }: { status: string | null | undefined }) {
  const tone = isPendingPayment(status)
    ? "border-amber-200 bg-amber-50 text-amber-900"
    : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return <span className={`ftf-stamp ${tone}`}>{status ?? "Unknown"}</span>;
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

  const batches = useMemo(
    () =>
      (summary?.farms ?? []).flatMap(({ farm, batches: farmBatches }) =>
        farmBatches.map((batch) => ({ batch, farmName: farm.farmName })),
      ),
    [summary],
  );

  const paymentsDue = useMemo(
    () =>
      batches
        .filter(({ batch }) => isPendingPayment(batch.paymentStatus))
        .reduce((total, { batch }) => total + (batch.totalFarmerAmount ?? 0), 0),
    [batches],
  );

  const recentBatches = useMemo(
    () =>
      [...batches]
        .sort((left, right) =>
          (right.batch.harvestDate ?? "").localeCompare(left.batch.harvestDate ?? ""),
        )
        .slice(0, 5),
    [batches],
  );

  const recentPayments = useMemo(
    () =>
      [...batches]
        .filter(({ batch }) => batch.paymentStatus)
        .sort((left, right) =>
          (right.batch.lastUpdated ?? right.batch.harvestDate ?? "").localeCompare(
            left.batch.lastUpdated ?? left.batch.harvestDate ?? "",
          ),
        )
        .slice(0, 5),
    [batches],
  );

  const nextVerificationFarm = summary?.farms[0];

  return (
    <main className="ftf-paper min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center gap-3 text-[var(--ftf-green-900)]">
          <LeafMark className="h-11 w-11" />
          <div>
            <p className="ftf-display text-2xl font-bold">{BRAND_NAME} Farmer</p>
            <p className="text-sm text-[var(--ftf-muted)]">Your farms, batches, and payments</p>
          </div>
        </header>

        <div className="mt-8 border-b border-[var(--ftf-border)] pb-5">
          <h1 className="text-3xl font-bold sm:text-4xl">Farmer Dashboard</h1>
          <p className="mt-2 text-[var(--ftf-muted)]">
            Welcome back{summary?.farmer.name ? `, ${summary.farmer.name}` : ""}!
          </p>
        </div>

        {loading ? (
          <div className="mt-4">
            <LoadingState label="Loading your farm records..." />
          </div>
        ) : null}
        {error ? (
          <div className="mt-4">
            <ErrorState message={error} onRetry={load} />
          </div>
        ) : null}

        {summary ? (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric
                label="My Farms"
                note="Registered holdings"
                tone="green"
                value={summary.farms.length}
              />
              <SummaryMetric
                label="My Batches"
                note="Crop lots"
                tone="kraft"
                value={batches.length}
              />
              <SummaryMetric
                label="Payments Due"
                note="Outstanding farmer amount"
                tone="clay"
                value={money.format(paymentsDue)}
              />
              <SummaryMetric
                label="Verifications"
                note="Pending review"
                tone="green"
                value={
                  batches.filter(({ batch }) =>
                    (batch.batchStatus ?? "").toUpperCase().includes("PENDING"),
                  ).length
                }
              />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <Card>
                <h2 className="text-xl font-bold">Recent Batches</h2>
                {!recentBatches.length ? (
                  <p className="mt-5 text-sm font-bold text-[var(--ftf-muted)]">No batches yet.</p>
                ) : (
                  <>
                    <div className="mt-4 hidden overflow-x-auto md:block">
                      <table className="min-w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-[var(--ftf-border)] text-xs uppercase tracking-wide text-[var(--ftf-muted)]">
                            <th className="px-2 py-3 font-bold">Batch</th>
                            <th className="px-2 py-3 font-bold">Crop</th>
                            <th className="px-2 py-3 font-bold">Qty</th>
                            <th className="px-2 py-3 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBatches.map(({ batch }) => (
                            <tr
                              className="border-b border-[var(--ftf-border)]/70"
                              key={batch.batchId}
                            >
                              <td className="px-2 py-3 font-bold">{batch.batchCode}</td>
                              <td className="px-2 py-3">{batch.cropName}</td>
                              <td className="px-2 py-3">
                                {quantity.format(batch.quantityReceived ?? 0)}
                              </td>
                              <td className="px-2 py-3">{batch.batchStatus ?? "Not available"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 space-y-3 md:hidden">
                      {recentBatches.map(({ batch }) => (
                        <article
                          className="rounded-xl border border-[var(--ftf-border)] bg-white/55 p-4"
                          key={batch.batchId}
                        >
                          <p className="font-bold">{batch.batchCode}</p>
                          <p className="text-sm text-[var(--ftf-muted)]">{batch.cropName}</p>
                          <p className="mt-2 text-sm">
                            Qty: {quantity.format(batch.quantityReceived ?? 0)} ·{" "}
                            {batch.batchStatus ?? "Not available"}
                          </p>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </Card>

              <Card>
                <h2 className="text-xl font-bold">Recent Payments</h2>
                {!recentPayments.length ? (
                  <p className="mt-5 text-sm font-bold text-[var(--ftf-muted)]">
                    No payment records yet.
                  </p>
                ) : (
                  <>
                    <div className="mt-4 hidden overflow-x-auto md:block">
                      <table className="min-w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-[var(--ftf-border)] text-xs uppercase tracking-wide text-[var(--ftf-muted)]">
                            <th className="px-2 py-3 font-bold">Batch</th>
                            <th className="px-2 py-3 font-bold">Amount</th>
                            <th className="px-2 py-3 font-bold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentPayments.map(({ batch }) => (
                            <tr
                              className="border-b border-[var(--ftf-border)]/70"
                              key={batch.batchId}
                            >
                              <td className="px-2 py-3 font-bold">{batch.batchCode}</td>
                              <td className="px-2 py-3">
                                {money.format(batch.totalFarmerAmount ?? 0)}
                              </td>
                              <td className="px-2 py-3">
                                <PaymentStatusBadge status={batch.paymentStatus} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 space-y-3 md:hidden">
                      {recentPayments.map(({ batch }) => (
                        <article
                          className="rounded-xl border border-[var(--ftf-border)] bg-white/55 p-4"
                          key={batch.batchId}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold">{batch.batchCode}</p>
                              <p className="text-sm">
                                {money.format(batch.totalFarmerAmount ?? 0)}
                              </p>
                            </div>
                            <PaymentStatusBadge status={batch.paymentStatus} />
                          </div>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            </div>

            <Card className="mt-4">
              <h2 className="text-xl font-bold">Next Verification</h2>
              {nextVerificationFarm ? (
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-bold">{nextVerificationFarm.farm.farmName}</p>
                    <p className="text-sm text-[var(--ftf-muted)]">
                      {[nextVerificationFarm.farm.village, nextVerificationFarm.farm.district]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                  <span className="ftf-stamp border-amber-200 bg-amber-50 text-amber-900">
                    PENDING
                  </span>
                </div>
              ) : (
                <p className="mt-4 text-sm font-bold text-[var(--ftf-muted)]">
                  No verification scheduled yet.
                </p>
              )}
            </Card>

            <Card className="mt-4">
              <h2 className="text-xl font-bold">Your Profile</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ftf-muted)]">
                    Phone
                  </dt>
                  <dd className="font-bold">{summary.farmer.phone}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ftf-muted)]">
                    Location
                  </dt>
                  <dd className="font-bold">
                    {[summary.farmer.village, summary.farmer.district, summary.farmer.state]
                      .filter(Boolean)
                      .join(", ")}
                  </dd>
                </div>
              </dl>
            </Card>
          </>
        ) : null}
      </div>
    </main>
  );
}
