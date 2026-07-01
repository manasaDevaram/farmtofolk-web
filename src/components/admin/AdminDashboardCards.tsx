"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { batchUsageApi, dashboardApi } from "@/lib/admin-api";
import type {
  AdminDashboardResponse,
  Batch,
  BatchListItem,
  DashboardVerificationItem,
} from "@/types/admin";
import { Button, ButtonLink, Card, LoadingState } from "./AdminPrimitives";

type DashboardCardId = "payments" | "pendingVerifications" | "upcomingVerifications" | "inventory";

const money = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 0,
  style: "currency",
});

const quantity = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

function verificationLocation(item: DashboardVerificationItem) {
  if (item.location?.trim()) return item.location;
  return [item.farmVillage ?? item.village, item.district, item.state].filter(Boolean).join(", ");
}

function officerName(item: DashboardVerificationItem) {
  return item.assignedOfficerName ?? item.officerName ?? item.verifiedByUserName ?? null;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-5 w-5 shrink-0 text-[var(--ftf-muted)] transition-transform ${expanded ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const tone =
    normalized.includes("PAID") || normalized.includes("COMPLETE")
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : normalized.includes("PENDING") || normalized.includes("UNPAID")
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-stone-300 bg-stone-100/70 text-stone-700";

  return <span className={`ftf-stamp ${tone}`}>{status}</span>;
}

function VerificationStatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const tone = normalized.includes("PENDING")
    ? "border-amber-200 bg-amber-50 text-amber-900"
    : normalized.includes("APPROVED") || normalized.includes("VERIFIED")
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-stone-300 bg-stone-100/70 text-stone-700";

  return <span className={`ftf-stamp ${tone}`}>{status}</span>;
}

function MetricCard({
  href,
  label,
  note,
  tone,
  value,
}: {
  href?: string;
  label: string;
  note: string;
  tone: "green" | "kraft" | "clay";
  value: number | string;
}) {
  const content = (
    <>
      <div className={`ftf-watercolor-icon ftf-tone-${tone}`}>
        <span className="ftf-display text-xl font-bold">{label.slice(0, 1)}</span>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none sm:text-3xl">{value}</p>
        <p className="mt-2 text-sm font-bold">{label}</p>
        <p className="mt-0.5 text-xs text-[var(--ftf-muted)]">{note}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        className="ftf-card ftf-focus flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--ftf-shadow-card)]"
        href={href}
      >
        {content}
      </Link>
    );
  }

  return <div className="ftf-card flex items-center gap-4 p-4">{content}</div>;
}

function ExpandableDashboardCard({
  badge,
  children,
  expanded,
  id,
  onToggle,
  subtitle,
  title,
}: {
  badge?: ReactNode;
  children: ReactNode;
  expanded: boolean;
  id: DashboardCardId;
  onToggle: (id: DashboardCardId) => void;
  subtitle?: ReactNode;
  title: string;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <button
        aria-expanded={expanded}
        className="ftf-focus flex w-full items-start justify-between gap-3 p-5 text-left"
        onClick={() => onToggle(id)}
        type="button"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold">{title}</h2>
            {badge}
          </div>
          {subtitle ? <div className="mt-2 text-sm text-[var(--ftf-muted)]">{subtitle}</div> : null}
        </div>
        <ChevronIcon expanded={expanded} />
      </button>
      {expanded ? (
        <div className="border-t border-[var(--ftf-border)] px-5 pb-5">{children}</div>
      ) : null}
    </Card>
  );
}

function CardInlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50/80 p-4">
      <p className="text-sm font-bold text-red-800">{message}</p>
      <button
        className="mt-3 text-sm font-bold text-[var(--ftf-green-700)] underline"
        onClick={onRetry}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}

function DashboardListShell({
  children,
  footerHref,
  footerLabel,
}: {
  children: ReactNode;
  footerHref?: string;
  footerLabel?: string;
}) {
  return (
    <div>
      {children}
      {footerHref && footerLabel ? (
        <div className="mt-4 border-t border-[var(--ftf-border)] pt-4">
          <Link className="text-sm font-bold text-[var(--ftf-green-700)]" href={footerHref}>
            {footerLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function PendingPaymentsList({ batches }: { batches: BatchListItem[] }) {
  if (!batches.length) {
    return (
      <p className="py-8 text-center text-sm font-bold text-[var(--ftf-muted)]">
        No pending payments
      </p>
    );
  }

  return (
    <DashboardListShell footerHref="/admin/batches" footerLabel="View all payments">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--ftf-border)] text-xs uppercase tracking-wide text-[var(--ftf-muted)]">
              <th className="px-2 py-3 font-bold">Batch Code</th>
              <th className="px-2 py-3 font-bold">Farmer</th>
              <th className="px-2 py-3 font-bold">Crop</th>
              <th className="px-2 py-3 font-bold">Qty</th>
              <th className="px-2 py-3 font-bold">Amount</th>
              <th className="px-2 py-3 font-bold">Status</th>
              <th className="px-2 py-3 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr className="border-b border-[var(--ftf-border)]/70" key={batch.id}>
                <td className="px-2 py-3 font-bold">{batch.batchCode}</td>
                <td className="px-2 py-3">{batch.farmerName ?? "Not available"}</td>
                <td className="px-2 py-3">{batch.cropName}</td>
                <td className="px-2 py-3">
                  {quantity.format(batch.quantityReceived)} {batch.unit}
                </td>
                <td className="px-2 py-3">{money.format(batch.totalFarmerAmount || 0)}</td>
                <td className="px-2 py-3">
                  <PaymentStatusBadge status={batch.paymentStatus} />
                </td>
                <td className="px-2 py-3">
                  <ButtonLink href={`/admin/batches/${batch.id}`} variant="secondary">
                    View Batch
                  </ButtonLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {batches.map((batch) => (
          <article
            className="rounded-xl border border-[var(--ftf-border)] bg-white/55 p-4"
            key={batch.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{batch.batchCode}</p>
                <p className="text-sm text-[var(--ftf-muted)]">
                  {batch.farmerName ?? "Not available"}
                </p>
              </div>
              <PaymentStatusBadge status={batch.paymentStatus} />
            </div>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ftf-muted)]">Crop</dt>
                <dd className="font-bold">{batch.cropName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ftf-muted)]">Qty</dt>
                <dd className="font-bold">
                  {quantity.format(batch.quantityReceived)} {batch.unit}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ftf-muted)]">Amount</dt>
                <dd className="font-bold">{money.format(batch.totalFarmerAmount || 0)}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <ButtonLink href={`/admin/batches/${batch.id}`} variant="secondary">
                View Batch
              </ButtonLink>
            </div>
          </article>
        ))}
      </div>
    </DashboardListShell>
  );
}

function PendingVerificationsList({ items }: { items: DashboardVerificationItem[] }) {
  if (!items.length) {
    return (
      <p className="py-8 text-center text-sm font-bold text-[var(--ftf-muted)]">
        No pending verifications
      </p>
    );
  }

  return (
    <DashboardListShell footerHref="/admin/farms" footerLabel="View all verifications">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--ftf-border)] text-xs uppercase tracking-wide text-[var(--ftf-muted)]">
              <th className="px-2 py-3 font-bold">Farm</th>
              <th className="px-2 py-3 font-bold">Farmer</th>
              <th className="px-2 py-3 font-bold">Location</th>
              <th className="px-2 py-3 font-bold">Status</th>
              <th className="px-2 py-3 font-bold">Officer</th>
              <th className="px-2 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-b border-[var(--ftf-border)]/70" key={item.id}>
                <td className="px-2 py-3 font-bold">{item.farmName ?? "Not available"}</td>
                <td className="px-2 py-3">{item.farmerName ?? "Not available"}</td>
                <td className="px-2 py-3">{verificationLocation(item) || "Not available"}</td>
                <td className="px-2 py-3">
                  <VerificationStatusBadge status={item.status} />
                </td>
                <td className="px-2 py-3">{officerName(item) ?? "Unassigned"}</td>
                <td className="px-2 py-3">
                  <div className="flex flex-wrap gap-2">
                    <ButtonLink href={`/admin/farms/${item.farmId}`} variant="secondary">
                      View Farm
                    </ButtonLink>
                    <ButtonLink href="/admin/users" variant="secondary">
                      Assign Officer
                    </ButtonLink>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <article
            className="rounded-xl border border-[var(--ftf-border)] bg-white/55 p-4"
            key={item.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{item.farmName ?? "Not available"}</p>
                <p className="text-sm text-[var(--ftf-muted)]">
                  {item.farmerName ?? "Not available"}
                </p>
              </div>
              <VerificationStatusBadge status={item.status} />
            </div>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ftf-muted)]">Location</dt>
                <dd className="text-right font-bold">
                  {verificationLocation(item) || "Not available"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ftf-muted)]">Officer</dt>
                <dd className="font-bold">{officerName(item) ?? "Unassigned"}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href={`/admin/farms/${item.farmId}`} variant="secondary">
                View Farm
              </ButtonLink>
              <ButtonLink href="/admin/users" variant="secondary">
                Assign Officer
              </ButtonLink>
            </div>
          </article>
        ))}
      </div>
    </DashboardListShell>
  );
}

function UpcomingVerificationsList({ items }: { items: DashboardVerificationItem[] }) {
  if (!items.length) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-bold text-[var(--ftf-muted)]">No upcoming verifications</p>
        <p className="mt-1 text-sm text-[var(--ftf-muted)]">You&apos;re all caught up!</p>
      </div>
    );
  }

  return (
    <DashboardListShell footerHref="/admin/farms" footerLabel="View all scheduled">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--ftf-border)] text-xs uppercase tracking-wide text-[var(--ftf-muted)]">
              <th className="px-2 py-3 font-bold">Farm</th>
              <th className="px-2 py-3 font-bold">Farmer</th>
              <th className="px-2 py-3 font-bold">Officer</th>
              <th className="px-2 py-3 font-bold">Scheduled</th>
              <th className="px-2 py-3 font-bold">Status</th>
              <th className="px-2 py-3 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-b border-[var(--ftf-border)]/70" key={item.id}>
                <td className="px-2 py-3 font-bold">{item.farmName ?? "Not available"}</td>
                <td className="px-2 py-3">{item.farmerName ?? "Not available"}</td>
                <td className="px-2 py-3">{officerName(item) ?? "Unassigned"}</td>
                <td className="px-2 py-3">
                  {item.scheduledDate ?? item.nextVerificationDue ?? item.verificationDate}
                </td>
                <td className="px-2 py-3">
                  <VerificationStatusBadge status={item.status} />
                </td>
                <td className="px-2 py-3">
                  <ButtonLink href={`/admin/farms/${item.farmId}`} variant="secondary">
                    View Farm
                  </ButtonLink>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <article
            className="rounded-xl border border-[var(--ftf-border)] bg-white/55 p-4"
            key={item.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{item.farmName ?? "Not available"}</p>
                <p className="text-sm text-[var(--ftf-muted)]">
                  {item.farmerName ?? "Not available"}
                </p>
              </div>
              <VerificationStatusBadge status={item.status} />
            </div>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ftf-muted)]">Officer</dt>
                <dd className="font-bold">{officerName(item) ?? "Unassigned"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ftf-muted)]">Scheduled</dt>
                <dd className="font-bold">
                  {item.scheduledDate ?? item.nextVerificationDue ?? item.verificationDate}
                </dd>
              </div>
            </dl>
            <div className="mt-4">
              <ButtonLink href={`/admin/farms/${item.farmId}`} variant="secondary">
                View Farm
              </ButtonLink>
            </div>
          </article>
        ))}
      </div>
    </DashboardListShell>
  );
}

function BatchInventoryList({
  batches,
  onConverted,
}: {
  batches: BatchListItem[];
  onConverted: () => void;
}) {
  const [busyBatchId, setBusyBatchId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function convertAvailableToWastage(batch: BatchListItem) {
    if (batch.quantityAvailable <= 0) return;
    setBusyBatchId(batch.id);
    setActionError("");
    try {
      await batchUsageApi.waste(batch.id, {
        quantity: batch.quantityAvailable,
        reason: "Converted remaining available inventory to wastage",
      });
      onConverted();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Could not record wastage.");
    } finally {
      setBusyBatchId(null);
    }
  }

  if (!batches.length) {
    return (
      <p className="py-8 text-center text-sm font-bold text-[var(--ftf-muted)]">
        No batch inventory yet
      </p>
    );
  }

  return (
    <DashboardListShell footerHref="/admin/batches" footerLabel="View all inventory">
      {actionError ? <p className="mb-4 text-sm font-bold text-red-700">{actionError}</p> : null}
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--ftf-border)] text-xs uppercase tracking-wide text-[var(--ftf-muted)]">
              <th className="px-2 py-3 font-bold">Batch Code</th>
              <th className="px-2 py-3 font-bold">Crop</th>
              <th className="px-2 py-3 font-bold">Farm</th>
              <th className="px-2 py-3 font-bold">Farmer</th>
              <th className="px-2 py-3 font-bold">Received</th>
              <th className="px-2 py-3 font-bold">Sold</th>
              <th className="px-2 py-3 font-bold">Wasted</th>
              <th className="px-2 py-3 font-bold">Available</th>
              <th className="px-2 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr className="border-b border-[var(--ftf-border)]/70" key={batch.id}>
                <td className="px-2 py-3 font-bold">{batch.batchCode}</td>
                <td className="px-2 py-3">{batch.cropName}</td>
                <td className="px-2 py-3">{batch.farmName ?? "Not available"}</td>
                <td className="px-2 py-3">{batch.farmerName ?? "Not available"}</td>
                <td className="px-2 py-3">
                  {quantity.format(batch.quantityReceived)} {batch.unit}
                </td>
                <td className="px-2 py-3">
                  {quantity.format(batch.quantitySold)} {batch.unit}
                </td>
                <td className="px-2 py-3">
                  {quantity.format(batch.quantityWasted)} {batch.unit}
                </td>
                <td className="px-2 py-3">
                  {quantity.format(batch.quantityAvailable)} {batch.unit}
                </td>
                <td className="px-2 py-3">
                  <div className="flex flex-wrap gap-2">
                    <ButtonLink href={`/admin/batches/${batch.id}`} variant="secondary">
                      View Batch
                    </ButtonLink>
                    <Button
                      disabled={busyBatchId === batch.id || batch.quantityAvailable <= 0}
                      onClick={() => void convertAvailableToWastage(batch)}
                      variant="danger"
                    >
                      {busyBatchId === batch.id ? "Converting..." : "Convert Available to Wastage"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {batches.map((batch) => (
          <article
            className="rounded-xl border border-[var(--ftf-border)] bg-white/55 p-4"
            key={batch.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">{batch.batchCode}</p>
                <p className="text-sm text-[var(--ftf-muted)]">{batch.cropName}</p>
              </div>
              <span className="ftf-stamp">
                {quantity.format(batch.quantityAvailable)} {batch.unit}
              </span>
            </div>
            <dl className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ftf-muted)]">Farm</dt>
                <dd className="font-bold">{batch.farmName ?? "Not available"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ftf-muted)]">Farmer</dt>
                <dd className="font-bold">{batch.farmerName ?? "Not available"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ftf-muted)]">Received / Sold / Wasted</dt>
                <dd className="text-right font-bold">
                  {quantity.format(batch.quantityReceived)} / {quantity.format(batch.quantitySold)}{" "}
                  / {quantity.format(batch.quantityWasted)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <ButtonLink href={`/admin/batches/${batch.id}`} variant="secondary">
                View Batch
              </ButtonLink>
              <Button
                disabled={busyBatchId === batch.id || batch.quantityAvailable <= 0}
                onClick={() => void convertAvailableToWastage(batch)}
                variant="danger"
              >
                {busyBatchId === batch.id ? "Converting..." : "Convert Available to Wastage"}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </DashboardListShell>
  );
}

export function DashboardSummaryView({
  highWastage,
  summary,
}: {
  highWastage: Batch[];
  summary: AdminDashboardResponse;
}) {
  const [expandedCard, setExpandedCard] = useState<DashboardCardId | null>(null);
  const [payments, setPayments] = useState<BatchListItem[] | null>(null);
  const [pendingVerifications, setPendingVerifications] = useState<
    DashboardVerificationItem[] | null
  >(null);
  const [upcomingVerifications, setUpcomingVerifications] = useState<
    DashboardVerificationItem[] | null
  >(null);
  const [inventory, setInventory] = useState<BatchListItem[] | null>(null);
  const [loadingCard, setLoadingCard] = useState<DashboardCardId | null>(null);
  const [cardErrors, setCardErrors] = useState<Partial<Record<DashboardCardId, string>>>({});

  const loadCard = useCallback(
    async (cardId: DashboardCardId, force = false) => {
      const loaded =
        cardId === "payments"
          ? payments
          : cardId === "pendingVerifications"
            ? pendingVerifications
            : cardId === "upcomingVerifications"
              ? upcomingVerifications
              : inventory;
      if (!force && loaded !== null) return;

      setLoadingCard(cardId);
      setCardErrors((current) => ({ ...current, [cardId]: undefined }));
      try {
        if (cardId === "payments") setPayments(await dashboardApi.pendingPayments());
        if (cardId === "pendingVerifications")
          setPendingVerifications(await dashboardApi.pendingVerifications());
        if (cardId === "upcomingVerifications")
          setUpcomingVerifications(await dashboardApi.upcomingVerifications());
        if (cardId === "inventory") setInventory(await dashboardApi.batchInventory());
      } catch (caught) {
        setCardErrors((current) => ({
          ...current,
          [cardId]: caught instanceof Error ? caught.message : "Could not load this list.",
        }));
      } finally {
        setLoadingCard(null);
      }
    },
    [inventory, payments, pendingVerifications, upcomingVerifications],
  );

  useEffect(() => {
    if (expandedCard) void loadCard(expandedCard);
  }, [expandedCard, loadCard]);

  function toggleCard(cardId: DashboardCardId) {
    setExpandedCard((current) => (current === cardId ? null : cardId));
  }

  function renderExpanded(cardId: DashboardCardId) {
    if (loadingCard === cardId) return <LoadingState label="Loading details..." />;
    if (cardErrors[cardId]) {
      return (
        <CardInlineError
          message={cardErrors[cardId]!}
          onRetry={() => void loadCard(cardId, true)}
        />
      );
    }

    if (cardId === "payments") return <PendingPaymentsList batches={payments ?? []} />;
    if (cardId === "pendingVerifications")
      return <PendingVerificationsList items={pendingVerifications ?? []} />;
    if (cardId === "upcomingVerifications")
      return <UpcomingVerificationsList items={upcomingVerifications ?? []} />;
    return (
      <BatchInventoryList
        batches={inventory ?? []}
        onConverted={() => void loadCard("inventory", true)}
      />
    );
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Pending Farmer Payments"
          note={`${summary.payments.pendingCount} batches`}
          tone="clay"
          value={money.format(summary.payments.pendingAmount || 0)}
        />
        <MetricCard
          label="Pending Verifications"
          note="Needs review"
          tone="kraft"
          value={summary.verifications.pendingCount}
        />
        <MetricCard
          label="Upcoming Verifications"
          note="Scheduled"
          tone="green"
          value={summary.verifications.upcomingCount}
        />
        <MetricCard
          label="Batch Inventory"
          note="Available"
          tone="green"
          value={quantity.format(summary.inventory.totalAvailableQuantity || 0)}
        />
        <MetricCard
          href="/admin/farmers"
          label="Total Farmers"
          note="Active"
          tone="kraft"
          value={summary.secondaryCounts.farmers}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ExpandableDashboardCard
          badge={<span className="ftf-stamp">{summary.payments.pendingCount}</span>}
          expanded={expandedCard === "payments"}
          id="payments"
          onToggle={toggleCard}
          subtitle={
            <>
              <span className="font-bold text-[var(--ftf-text)]">
                {money.format(summary.payments.pendingAmount || 0)}
              </span>
              <span> · {summary.payments.pendingCount} batches pending payment</span>
            </>
          }
          title="Pending Farmer Payments"
        >
          {expandedCard === "payments" ? renderExpanded("payments") : null}
        </ExpandableDashboardCard>

        <ExpandableDashboardCard
          badge={<span className="ftf-stamp">{summary.verifications.pendingCount}</span>}
          expanded={expandedCard === "pendingVerifications"}
          id="pendingVerifications"
          onToggle={toggleCard}
          subtitle={`${summary.verifications.pendingCount} farms need verification review`}
          title="Pending Verifications"
        >
          {expandedCard === "pendingVerifications" ? renderExpanded("pendingVerifications") : null}
        </ExpandableDashboardCard>

        <ExpandableDashboardCard
          badge={<span className="ftf-stamp">{summary.verifications.upcomingCount}</span>}
          expanded={expandedCard === "upcomingVerifications"}
          id="upcomingVerifications"
          onToggle={toggleCard}
          subtitle={`${summary.verifications.upcomingCount} scheduled visits`}
          title="Upcoming Verifications"
        >
          {expandedCard === "upcomingVerifications"
            ? renderExpanded("upcomingVerifications")
            : null}
        </ExpandableDashboardCard>

        <ExpandableDashboardCard
          badge={
            <span className="ftf-stamp">
              {quantity.format(summary.inventory.totalAvailableQuantity || 0)}
            </span>
          }
          expanded={expandedCard === "inventory"}
          id="inventory"
          onToggle={toggleCard}
          subtitle={`${quantity.format(summary.inventory.totalAvailableQuantity || 0)} units available across batches`}
          title="Batch Inventory"
        >
          {expandedCard === "inventory" ? renderExpanded("inventory") : null}
        </ExpandableDashboardCard>
      </div>

      <div className="mt-4">
        <Card>
          <h2 className="text-2xl font-bold">High Wastage Batches</h2>
          <div className="mt-5 divide-y divide-[var(--ftf-border)]">
            {highWastage.length ? (
              highWastage.map((batch) => (
                <Link
                  className="flex items-center justify-between gap-4 py-3"
                  href={`/admin/batches/${batch.id}`}
                  key={batch.id}
                >
                  <span className="font-bold">
                    {batch.batchCode} · {batch.cropName}
                  </span>
                  <span className="ftf-stamp">
                    {batch.quantityWasted} {batch.unit} wasted
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-[var(--ftf-muted)]">
                No wastage recorded.
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MetricCard
          href="/admin/farmers"
          label="Farmers"
          note="Profiles"
          tone="green"
          value={summary.secondaryCounts.farmers}
        />
        <MetricCard
          href="/admin/farms"
          label="Farms"
          note="Registered holdings"
          tone="kraft"
          value={summary.secondaryCounts.farms}
        />
        <MetricCard
          href="/admin/batches"
          label="Batches"
          note="Received crop lots"
          tone="green"
          value={summary.secondaryCounts.batches}
        />
      </div>
    </>
  );
}
