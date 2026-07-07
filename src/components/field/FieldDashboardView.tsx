"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import { LeafMark } from "@/components/assets/FarmToFolkAssets";
import { Card, ErrorState, LoadingState } from "@/components/admin/AdminPrimitives";
import Link from "next/link";
import { dashboardApi } from "@/lib/admin-api";
import type { DashboardVerificationItem } from "@/types/admin";
import { BRAND_NAME } from "@/lib/constants";

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

function verificationLocation(item: DashboardVerificationItem) {
  if (item.location?.trim()) return item.location;
  return [item.farmVillage ?? item.village, item.district, item.state].filter(Boolean).join(", ");
}

function officerName(item: DashboardVerificationItem) {
  return item.assignedOfficerName ?? item.officerName ?? item.verifiedByUserName ?? "Unassigned";
}

export function FieldDashboardView() {
  const [pending, setPending] = useState<DashboardVerificationItem[]>([]);
  const [upcoming, setUpcoming] = useState<DashboardVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [pendingItems, upcomingItems] = await Promise.all([
        dashboardApi.pendingVerifications(),
        dashboardApi.upcomingVerifications(),
      ]);
      setPending(pendingItems);
      setUpcoming(upcomingItems);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not load your verification dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => void load(), [load]);

  const recentActivity = useMemo(
    () =>
      [...pending, ...upcoming].slice(0, 4).map((item) => ({
        id: item.id,
        label: `${item.farmName ?? "Farm"} verification ${item.status.toLowerCase()}`,
      })),
    [pending, upcoming],
  );

  return (
    <main className="ftf-paper min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center gap-3 text-[var(--ftf-green-900)]">
          <LeafMark className="h-11 w-11" />
          <div>
            <p className="ftf-display text-2xl font-bold">{BRAND_NAME} Field</p>
            <p className="text-sm text-[var(--ftf-muted)]">Verification workspace</p>
          </div>
        </header>

        <div className="mt-8 border-b border-[var(--ftf-border)] pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold sm:text-4xl">Verifier Dashboard</h1>
            <Link className="rounded-xl bg-[var(--ftf-green-900)] px-4 py-2 text-sm font-bold text-white" href="/admin/batches/new">
              Create Batch
            </Link>
          </div>
          <p className="mt-2 text-[var(--ftf-muted)]">
            Here are your verification tasks and farm visits.
          </p>
        </div>

        {loading ? (
          <div className="mt-4">
            <LoadingState label="Loading verification tasks..." />
          </div>
        ) : null}
        {error ? (
          <div className="mt-4">
            <ErrorState message={error} onRetry={load} />
          </div>
        ) : null}

        {!loading && !error ? (
          <>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryMetric
                label="Pending Verifications"
                note="Needs review"
                tone="clay"
                value={pending.length}
              />
              <SummaryMetric
                label="Upcoming Visits"
                note="Scheduled"
                tone="green"
                value={upcoming.length}
              />
              <SummaryMetric
                label="Completed"
                note="Recently verified"
                tone="kraft"
                value={
                  pending.filter((item) => item.status.toUpperCase().includes("APPROVED")).length
                }
              />
              <SummaryMetric
                label="Farms Verified"
                note="Assigned farms"
                tone="green"
                value={new Set([...pending, ...upcoming].map((item) => item.farmId)).size}
              />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <Card>
                <h2 className="text-xl font-bold">Pending Verifications</h2>
                {!pending.length ? (
                  <p className="mt-5 text-sm font-bold text-[var(--ftf-muted)]">
                    No pending verifications
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {pending.map((item) => (
                      <article
                        className="rounded-xl border border-[var(--ftf-border)] bg-white/55 p-4"
                        key={item.id}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-bold">{item.farmName ?? "Not available"}</p>
                            <p className="text-sm text-[var(--ftf-muted)]">
                              {item.farmerName ?? "Not available"}
                            </p>
                          </div>
                          <span className="ftf-stamp border-amber-200 bg-amber-50 text-amber-900">
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[var(--ftf-muted)]">
                          {verificationLocation(item) || "Location unavailable"} ·{" "}
                          {officerName(item)}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <h2 className="text-xl font-bold">Upcoming Visits</h2>
                {!upcoming.length ? (
                  <div className="mt-8 text-center">
                    <p className="text-sm font-bold text-[var(--ftf-muted)]">
                      No upcoming verifications
                    </p>
                    <p className="mt-1 text-sm text-[var(--ftf-muted)]">
                      You&apos;re all caught up!
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {upcoming.map((item) => (
                      <article
                        className="rounded-xl border border-[var(--ftf-border)] bg-white/55 p-4"
                        key={item.id}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-bold">{item.farmName ?? "Not available"}</p>
                            <p className="text-sm text-[var(--ftf-muted)]">
                              {item.farmerName ?? "Not available"}
                            </p>
                          </div>
                          <span className="ftf-stamp">{item.status}</span>
                        </div>
                        <p className="mt-2 text-sm text-[var(--ftf-muted)]">
                          {officerName(item)} ·{" "}
                          {item.scheduledDate ?? item.nextVerificationDue ?? item.verificationDate}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <Card className="mt-4">
              <h2 className="text-xl font-bold">Recent Activity</h2>
              {!recentActivity.length ? (
                <p className="mt-4 text-sm font-bold text-[var(--ftf-muted)]">
                  No recent verification activity.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {recentActivity.map((item) => (
                    <li
                      className="rounded-xl border border-[var(--ftf-border)] bg-white/55 px-4 py-3 text-sm font-bold"
                      key={item.id}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        ) : null}
      </div>
    </main>
  );
}
