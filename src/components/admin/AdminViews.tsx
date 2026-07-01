"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SignedMedia } from "@/components/SignedMedia";
import {
  batchApi,
  dashboardApi,
  evidenceApi,
  farmApi,
  farmerApi,
  listAllBatches,
  listAllFarms,
  mediaApi,
  priceApi,
  qrApi,
  traceEventApi,
  verificationApi,
} from "@/lib/admin-api";
import type {
  Batch,
  BatchPayload,
  BatchWithRelations,
  DashboardSummary,
  Farm,
  Farmer,
  FarmMedia,
  FarmVerification,
  FarmWithFarmer,
  PriceBreakdown,
  PriceBreakdownPayload,
  QrCode,
  TraceEvent,
  TraceEventPayload,
  VerificationEvidence,
  VerificationPayload,
} from "@/types/admin";
import { cleanMediaUrl } from "@/lib/media-url";
import { BatchForm, FarmerForm, FarmForm } from "./AdminForms";
import {
  AdminShell,
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  InfoGrid,
  LoadingState,
  PageHeader,
  StatusBadge,
  inputClass,
} from "./AdminPrimitives";

const fmt = (value?: string | number | null) => value || "Not available";
const today = () => new Date().toISOString().slice(0, 10);
const nowLocal = () => new Date().toISOString().slice(0, 16);
const isVideoFile = (type?: string | null, url?: string | null) =>
  Boolean(type?.toLowerCase().includes("video") || url?.match(/\.(mp4|mov|webm)(\?|$)/i));
const isImageFile = (type?: string | null, url?: string | null) =>
  Boolean(type?.toLowerCase().includes("image") || url?.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i));

// AdminHomeView is the operator entry point for the complete data flow.
export function AdminHomeView() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSummary(await dashboardApi.summary());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell>
      <PageHeader
        actions={
          <>
            <ButtonLink href="/admin/farmers/new">Add Farmer</ButtonLink>
            <ButtonLink href="/admin/farms/new" variant="secondary">
              Add Farm
            </ButtonLink>
            <ButtonLink href="/admin/batches/new" variant="secondary">
              Add Batch
            </ButtonLink>
          </>
        }
        description="Here is what is happening across your farm network today."
        eyebrow="Farm network"
        title="Admin Dashboard"
      />
      {loading ? <LoadingState label="Gathering today's farm records..." /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {summary ? <DashboardSummaryView summary={summary} /> : null}
    </AdminShell>
  );
}

function DashboardSummaryView({ summary }: { summary: DashboardSummary }) {
  const money = new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency",
  });
  const recentVerificationCount = summary.recentVerifications.length;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          href="/admin/farmers"
          label="Total farmers"
          note={`${summary.activeFarmers} active`}
          tone="green"
          value={summary.totalFarmers}
        />
        <MetricCard
          href="/admin/farms"
          label="Total farms"
          note="Registered holdings"
          tone="kraft"
          value={summary.totalFarms}
        />
        <MetricCard
          href="/admin/batches"
          label="Total batches"
          note="Traceable produce lots"
          tone="green"
          value={summary.totalBatches}
        />
        <MetricCard
          label="Pending payments"
          note={`${summary.pendingPaymentBatchCount} batches`}
          tone="clay"
          value={money.format(summary.pendingPaymentsAmount || 0)}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--ftf-green-700)]">
                Field activity
              </p>
              <h2 className="mt-1 text-2xl font-bold">Recent verifications</h2>
            </div>
            <span className="ftf-stamp">{recentVerificationCount} recent</span>
          </div>
          <div className="mt-5 divide-y divide-[var(--ftf-border)]">
            {summary.recentVerifications.length ? (
              summary.recentVerifications.map((verification) => (
                <div className="flex items-center justify-between gap-4 py-3" key={verification.id}>
                  <div>
                    <p className="font-bold">
                      {verification.verificationType || "Farm verification"}
                    </p>
                    <p className="mt-0.5 text-sm text-[var(--ftf-muted)]">
                      {verification.verificationDate}
                    </p>
                  </div>
                  <span className="ftf-stamp">{verification.status || "Recorded"}</span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-[var(--ftf-muted)]">
                No recent verification activity.
              </p>
            )}
          </div>
        </Card>

        <Card className="ftf-kraft-card">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[var(--ftf-soil)]">
            Traceability reach
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className="ftf-display text-5xl font-bold text-[var(--ftf-green-900)]">
                {summary.totalQrCodes}
              </p>
              <p className="mt-1 font-bold text-[var(--ftf-soil)]">QR codes generated</p>
            </div>
            <div
              className="grid h-20 w-20 grid-cols-4 gap-1 rounded-xl border border-[var(--ftf-soil)]/20 bg-white/40 p-2"
              aria-hidden="true"
            >
              {Array.from({ length: 16 }, (_, index) => (
                <span
                  className={
                    index % 3 === 0 || index === 6 || index === 11
                      ? "bg-[var(--ftf-green-900)]"
                      : "bg-transparent"
                  }
                  key={index}
                />
              ))}
            </div>
          </div>
          <p className="mt-6 text-sm leading-6 text-[var(--ftf-soil)]/75">
            Each code gives customers a direct path to the farmer, farm, verification evidence, and
            batch journey.
          </p>
        </Card>
      </div>
    </>
  );
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
  const className =
    "ftf-card flex min-h-32 items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(59,45,25,.12)]";
  return href ? (
    <Link className={className} href={href}>
      {content}
    </Link>
  ) : (
    <section className={className}>{content}</section>
  );
}

// FarmersListView loads all farmers and filters them locally for fast admin lookup.
export function FarmersListView() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setFarmers(await farmerApi.list());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load farmers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = farmers.filter((farmer) => {
    const haystack = [farmer.name, farmer.phone, farmer.village, farmer.district, farmer.state]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  async function toggle(farmer: Farmer) {
    await farmerApi.updateStatus(farmer.id, !farmer.active);
    await load();
  }

  return (
    <AdminShell>
      <PageHeader
        actions={<ButtonLink href="/admin/farmers/new">Add Farmer</ButtonLink>}
        description="Search, edit, activate, and drill into farms or batches for each farmer."
        title="Farmers"
      />
      <Card>
        <input
          className={inputClass}
          placeholder="Search by name, phone, village, district..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </Card>
      <div className="mt-4">
        {loading ? <LoadingState label="Loading farmers..." /> : null}
        {error ? <ErrorState message={error} onRetry={load} /> : null}
        {!loading && !error && !filtered.length ? (
          <EmptyState
            action={<ButtonLink href="/admin/farmers/new">Add Farmer</ButtonLink>}
            message="No farmers match your search."
          />
        ) : null}
        {!loading && !error && filtered.length ? (
          <div className="grid gap-3">
            {filtered.map((farmer) => (
              <Card key={farmer.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex gap-4">
                    <MediaThumb type="image" url={farmer.profilePhotoUrl} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-black">{farmer.name}</h2>
                        <StatusBadge active={farmer.active} />
                      </div>
                      <p className="mt-1 font-bold text-stone-600">{farmer.phone}</p>
                      <p className="text-sm text-stone-500">
                        {farmer.village}, {farmer.district}, {farmer.state} - Joined{" "}
                        {farmer.joinedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ButtonLink href={`/admin/farmers/${farmer.id}`} variant="secondary">
                      Open
                    </ButtonLink>
                    <ButtonLink href={`/admin/farmers/${farmer.id}/edit`} variant="secondary">
                      Edit
                    </ButtonLink>
                    <ButtonLink href={`/admin/farmers/${farmer.id}/farms`} variant="secondary">
                      View Farms
                    </ButtonLink>
                    <ButtonLink href={`/admin/farmers/${farmer.id}/batches`} variant="secondary">
                      View Batches
                    </ButtonLink>
                    <Button
                      onClick={() => void toggle(farmer)}
                      variant={farmer.active ? "danger" : "primary"}
                    >
                      {farmer.active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}

// FarmerFormView handles both create and edit modes for farmer records.
export function FarmerFormView({ farmerId }: { farmerId?: string }) {
  const router = useRouter();
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(Boolean(farmerId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!farmerId) return;
    farmerApi
      .get(farmerId)
      .then(setFarmer)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [farmerId]);

  return (
    <AdminShell>
      <PageHeader title={farmerId ? "Edit Farmer" : "Add Farmer"} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error ? (
        <FarmerForm
          initial={farmer}
          onSubmit={async (payload, active) => {
            const saved = farmerId
              ? await farmerApi.update(farmerId, payload)
              : await farmerApi.create(payload);
            if (saved.active !== active) await farmerApi.updateStatus(saved.id, active);
            router.push(`/admin/farmers/${saved.id}`);
          }}
        />
      ) : null}
    </AdminShell>
  );
}

// FarmerDetailView shows one farmer plus their farms and batches.
export function FarmerDetailView({ farmerId }: { farmerId: string }) {
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextFarmer, nextFarms, nextBatches] = await Promise.all([
        farmerApi.get(farmerId),
        farmApi.listByFarmer(farmerId),
        batchApi.listByFarmer(farmerId),
      ]);
      setFarmer(nextFarmer);
      setFarms(nextFarms);
      setBatches(nextBatches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load farmer.");
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell>
      {loading ? <LoadingState label="Loading farmer..." /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {farmer ? (
        <>
          <PageHeader
            actions={
              <>
                <ButtonLink href={`/admin/farmers/${farmer.id}/edit`}>Edit Farmer</ButtonLink>
                <ButtonLink href={`/admin/farms/new?farmerId=${farmer.id}`} variant="secondary">
                  Add Farm
                </ButtonLink>
                <ButtonLink href={`/admin/batches/new?farmerId=${farmer.id}`} variant="secondary">
                  Add Batch
                </ButtonLink>
              </>
            }
            description={`${farmer.village}, ${farmer.district}, ${farmer.state}`}
            title={farmer.name}
          />
          <Card>
            <InfoGrid
              items={[
                { label: "Phone", value: farmer.phone },
                { label: "Joined", value: farmer.joinedDate },
                { label: "Status", value: <StatusBadge active={farmer.active} /> },
                { label: "Bio", value: farmer.bio },
              ]}
            />
          </Card>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <FarmerMediaUpload
              currentUrl={farmer.profilePhotoUrl}
              label="Profile photo"
              accept="image/jpeg,image/png,image/webp"
              onUpload={(file) => farmerApi.uploadProfilePhoto(farmer.id, file)}
              onReload={load}
              onUploaded={setFarmer}
              previewType="image"
            />
            <FarmerMediaUpload
              currentUrl={farmer.introVideoUrl}
              label="Intro video"
              accept="video/mp4,video/quicktime,video/webm"
              onUpload={(file) => farmerApi.uploadIntroVideo(farmer.id, file)}
              onReload={load}
              onUploaded={setFarmer}
              previewType="video"
            />
          </div>
          <RelatedLists farms={farms} batches={batches} />
        </>
      ) : null}
    </AdminShell>
  );
}

function RelatedLists({ batches, farms }: { batches: Batch[]; farms: Farm[] }) {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="text-xl font-black">Farms</h2>
        <div className="mt-3 space-y-2">
          {farms.map((farm) => (
            <Link
              className="block rounded-2xl bg-stone-50 p-3 font-bold hover:bg-emerald-50"
              href={`/admin/farms/${farm.id}`}
              key={farm.id}
            >
              {farm.farmName}
            </Link>
          ))}
          {!farms.length ? <p className="text-stone-500">No farms yet.</p> : null}
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Batches</h2>
        <div className="mt-3 space-y-2">
          {batches.map((batch) => (
            <Link
              className="block rounded-2xl bg-stone-50 p-3 font-bold hover:bg-emerald-50"
              href={`/admin/batches/${batch.id}`}
              key={batch.id}
            >
              {batch.batchCode} - {batch.cropName}
            </Link>
          ))}
          {!batches.length ? <p className="text-stone-500">No batches yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}

// FarmsListView supports both all-farms and farmer-scoped farm lists.
export function FarmsListView({ farmerId }: { farmerId?: string }) {
  const [farms, setFarms] = useState<FarmWithFarmer[]>([]);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (farmerId) {
        const [owner, ownerFarms] = await Promise.all([
          farmerApi.get(farmerId),
          farmApi.listByFarmer(farmerId),
        ]);
        setFarmer(owner);
        setFarms(ownerFarms.map((farm) => ({ ...farm, farmer: owner })));
      } else {
        setFarms(await listAllFarms());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load farms.");
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell>
      <PageHeader
        actions={
          <ButtonLink
            href={farmerId ? `/admin/farms/new?farmerId=${farmerId}` : "/admin/farms/new"}
          >
            Add Farm
          </ButtonLink>
        }
        title={farmer ? `${farmer.name}'s Farms` : "Farms"}
      />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && !error && !farms.length ? <EmptyState message="No farms found." /> : null}
      <div className="grid gap-3">
        {farms.map((farm) => (
          <Card key={farm.id}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black">{farm.farmName}</h2>
                <p className="font-bold text-stone-600">
                  {farm.farmer?.name || farm.farmerName || "Unknown farmer"}
                </p>
                <p className="text-sm text-stone-500">
                  {farm.village}, {farm.district}, {farm.state} - {fmt(farm.sizeAcres)} acres -{" "}
                  {farm.farmingType}
                </p>
                <p className="text-xs text-stone-400">
                  Lat/Lng: {fmt(farm.latitude)} / {fmt(farm.longitude)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href={`/admin/farms/${farm.id}`} variant="secondary">
                  Open
                </ButtonLink>
                <ButtonLink href={`/admin/farms/${farm.id}/edit`} variant="secondary">
                  Edit
                </ButtonLink>
                <ButtonLink href={`/admin/batches/new?farmerId=${farm.farmerId}&farmId=${farm.id}`}>
                  Add Batch
                </ButtonLink>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}

// FarmFormView handles farm create/edit, including farmerId query prefill.
export function FarmFormView({ farmId }: { farmId?: string }) {
  const router = useRouter();
  const search = useSearchParams();
  const farmerId = search.get("farmerId");
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [lockedFarmer, setLockedFarmer] = useState(farmerId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([farmerApi.list(), farmId ? farmApi.get(farmId) : Promise.resolve(null)])
      .then(([nextFarmers, nextFarm]) => {
        setFarmers(nextFarmers);
        setFarm(nextFarm);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [farmId]);

  return (
    <AdminShell>
      <PageHeader title={farmId ? "Edit Farm" : "Add Farm"} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error ? (
        <FarmForm
          farmers={farmers}
          initial={farm}
          lockedFarmerId={lockedFarmer}
          onSubmit={async (payload) => {
            const saved = farmId
              ? await farmApi.update(farmId, payload)
              : await farmApi.create(payload);
            router.push(`/admin/farms/${saved.id}`);
          }}
          onUnlockFarmer={() => setLockedFarmer(null)}
        />
      ) : null}
    </AdminShell>
  );
}

// FarmDetailView combines farm details, media upload, verification, and batches.
export function FarmDetailView({ farmId }: { farmId: string }) {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [media, setMedia] = useState<FarmMedia[]>([]);
  const [verification, setVerification] = useState<FarmVerification | null>(null);
  const [verifications, setVerifications] = useState<FarmVerification[]>([]);
  const [evidence, setEvidence] = useState<VerificationEvidence[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextFarm, nextMedia, nextVerification, nextVerifications, nextBatches] =
        await Promise.all([
          farmApi.get(farmId),
          mediaApi.list(farmId),
          verificationApi.latest(farmId),
          verificationApi.list(farmId),
          batchApi.listByFarm(farmId),
        ]);
      setFarm(nextFarm);
      setMedia(nextMedia);
      setVerification(nextVerification);
      setVerifications(nextVerifications);
      setEvidence(nextVerification ? await evidenceApi.list(nextVerification.id) : []);
      setBatches(nextBatches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load farm.");
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell>
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {farm ? (
        <>
          <PageHeader
            actions={
              <>
                <ButtonLink href={`/admin/farms/${farm.id}/edit`}>Edit Farm</ButtonLink>
                <ButtonLink
                  href={`/admin/batches/new?farmerId=${farm.farmerId}&farmId=${farm.id}`}
                  variant="secondary"
                >
                  Add Batch
                </ButtonLink>
              </>
            }
            title={farm.farmName}
          />
          <Card>
            <InfoGrid
              items={[
                { label: "Location", value: `${farm.village}, ${farm.district}, ${farm.state}` },
                { label: "Size", value: farm.sizeAcres ? `${farm.sizeAcres} acres` : null },
                { label: "Farming Type", value: farm.farmingType },
                { label: "Latitude", value: farm.latitude },
                { label: "Longitude", value: farm.longitude },
                { label: "Latest Verification", value: verification?.status },
              ]}
            />
          </Card>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <FarmMediaPanel
              media={media}
              onDelete={setDeleteId}
              onUploaded={load}
              farmId={farm.id}
            />
            <VerificationPanel
              evidence={evidence}
              farmId={farm.id}
              latest={verification}
              onEvidenceDelete={(id) => evidenceApi.delete(id).then(load)}
              onEvidenceUpload={(file, caption, isPublic) =>
                verification
                  ? evidenceApi.upload(verification.id, file, caption, isPublic).then(load)
                  : Promise.resolve()
              }
              onSaved={load}
              verifications={verifications}
            />
          </div>
          <Card className="mt-4">
            <h2 className="text-xl font-black">Batches From This Farm</h2>
            <div className="mt-3 space-y-2">
              {batches.map((batch) => (
                <Link
                  className="block rounded-2xl bg-stone-50 p-3 font-bold hover:bg-emerald-50"
                  href={`/admin/batches/${batch.id}`}
                  key={batch.id}
                >
                  {batch.batchCode} - {batch.cropName}
                </Link>
              ))}
              {!batches.length ? <p className="text-stone-500">No batches yet.</p> : null}
            </div>
          </Card>
        </>
      ) : null}
      {deleteId ? (
        <ConfirmDialog
          message="This media item will be permanently removed."
          onCancel={() => setDeleteId(null)}
          onConfirm={() => {
            void mediaApi
              .delete(deleteId)
              .then(load)
              .finally(() => setDeleteId(null));
          }}
          title="Delete media?"
        />
      ) : null}
    </AdminShell>
  );
}

function FarmMediaPanel({
  farmId,
  media,
  onDelete,
  onUploaded,
}: {
  farmId: string;
  media: FarmMedia[];
  onDelete: (id: string) => void;
  onUploaded: () => void;
}) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const previewUrl = useFilePreview(file);

  async function upload() {
    if (!file) return;
    setSaving(true);
    try {
      await mediaApi.upload(farmId, file, caption);
      setCaption("");
      setFile(null);
      onUploaded();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h2 className="text-xl font-black">Farm Media</h2>
      <div className="mt-4 grid gap-3">
        <DropUpload
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
          file={file}
          label="Drop farm photo or video here"
          onFile={setFile}
          previewUrl={previewUrl}
        />
        <input
          className={inputClass}
          placeholder="Caption"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
        />
        <Button disabled={!file || saving} onClick={() => void upload()}>
          {saving ? "Uploading..." : "Upload Farm Media"}
        </Button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {media.map((item) => (
          <div className="rounded-2xl bg-stone-50 p-2" key={item.id}>
            <MediaPreview
              className="aspect-square rounded-xl"
              type={item.contentType || item.mediaType}
              url={item.mediaUrl}
            />
            <p className="mt-2 text-xs font-bold">{item.caption || item.mediaType}</p>
            <Button onClick={() => onDelete(item.id)} variant="danger">
              Delete
            </Button>
          </div>
        ))}
        {!media.length ? (
          <p className="col-span-full text-sm text-stone-500">No farm media uploaded yet.</p>
        ) : null}
      </div>
    </Card>
  );
}

function FarmerMediaUpload({
  accept,
  currentUrl,
  label,
  onReload,
  onUpload,
  onUploaded,
  previewType,
}: {
  accept: string;
  currentUrl: string | null;
  label: string;
  onReload: () => void;
  onUpload: (file: File) => Promise<Farmer>;
  onUploaded: (farmer: Farmer) => void;
  previewType: "image" | "video";
}) {
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const previewUrl = useFilePreview(file);
  const displayUrl = previewUrl ?? cleanMediaUrl(currentUrl);

  async function upload() {
    if (!file) return;
    setSaving(true);
    try {
      const updatedFarmer = await onUpload(file);
      setFile(null);
      onUploaded(updatedFarmer);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h2 className="text-xl font-black">{label}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-[140px_1fr]">
        <MediaPreview
          className="aspect-square rounded-2xl"
          onReload={onReload}
          type={previewType}
          url={displayUrl}
        />
        <div className="grid gap-3">
          <DropUpload
            accept={accept}
            file={file}
            label={`Upload ${label.toLowerCase()}`}
            onFile={setFile}
            previewUrl={previewUrl}
          />
          <Button disabled={!file || saving} onClick={() => void upload()}>
            {saving ? "Uploading..." : `Save ${label}`}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function EvidenceUploader({
  evidence,
  onDelete,
  onUpload,
}: {
  evidence: VerificationEvidence[];
  onDelete: (id: string) => Promise<void>;
  onUpload: (file: File, caption: string, isPublic: boolean) => Promise<void>;
}) {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);
  const previewUrl = useFilePreview(file);

  async function upload() {
    if (!file) return;
    setSaving(true);
    try {
      await onUpload(file, caption, isPublic);
      setCaption("");
      setFile(null);
      setIsPublic(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 space-y-3">
      <DropUpload
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,application/pdf"
        file={file}
        label="Drop evidence photo, video, or PDF here"
        onFile={setFile}
        previewUrl={previewUrl}
      />
      <input
        className={inputClass}
        placeholder="Evidence caption"
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
      />
      <label className="flex items-center gap-2 text-sm font-bold">
        <input
          checked={isPublic}
          onChange={(event) => setIsPublic(event.target.checked)}
          type="checkbox"
        />
        Public on customer trace page
      </label>
      <Button disabled={!file || saving} onClick={() => void upload()}>
        {saving ? "Uploading..." : "Upload Evidence"}
      </Button>
      <div className="grid grid-cols-2 gap-3">
        {evidence.map((item) => (
          <div className="rounded-2xl bg-white p-2 shadow-sm" key={item.id}>
            <MediaPreview
              className="aspect-square rounded-xl"
              type={item.contentType || item.fileType}
              url={item.fileUrl}
            />
            <p className="mt-2 text-xs font-bold">{item.caption || item.fileType}</p>
            <p className="text-xs text-stone-500">{item.isPublic ? "Public" : "Private"}</p>
            <Button onClick={() => void onDelete(item.id)} variant="danger">
              Delete
            </Button>
          </div>
        ))}
        {!evidence.length ? (
          <p className="col-span-full text-sm text-stone-500">No evidence uploaded yet.</p>
        ) : null}
      </div>
    </div>
  );
}

function DropUpload({
  accept,
  file,
  label,
  onFile,
  previewUrl,
}: {
  accept: string;
  file: File | null;
  label: string;
  onFile: (file: File | null) => void;
  previewUrl: string | null;
}) {
  return (
    <label
      className="block cursor-pointer rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/70 p-4 text-center transition hover:bg-emerald-50"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onFile(event.dataTransfer.files?.[0] ?? null);
      }}
    >
      <input
        accept={accept}
        className="sr-only"
        type="file"
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
      />
      {previewUrl ? (
        <MediaPreview
          className="mx-auto mb-3 h-28 w-28 rounded-xl"
          type={file?.type}
          url={previewUrl}
        />
      ) : null}
      <span className="font-black text-emerald-950">{file ? file.name : label}</span>
      <span className="mt-1 block text-xs text-emerald-800">Click to browse or drag and drop</span>
    </label>
  );
}

function MediaPreview({
  className,
  onReload,
  type,
  url,
}: {
  className: string;
  onReload?: () => void;
  type?: string | null;
  url?: string | null;
}) {
  const cleanUrl = cleanMediaUrl(url);

  if (!cleanUrl) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-emerald-50 text-sm font-black text-emerald-800`}
      >
        No media
      </div>
    );
  }
  if (isVideoFile(type, cleanUrl)) {
    return (
      <SignedMedia
        alt="Video"
        className={`${className} bg-stone-950 object-cover`}
        kind="video"
        onReload={onReload}
        src={cleanUrl}
      />
    );
  }
  if (isImageFile(type, cleanUrl) || type === "image") {
    return (
      <SignedMedia
        alt="Media preview"
        className={`${className} bg-emerald-100 object-cover`}
        kind="image"
        onReload={onReload}
        src={cleanUrl}
      />
    );
  }
  return (
    <a
      className={`${className} flex items-center justify-center bg-stone-100 p-3 text-center text-sm font-black text-stone-700`}
      href={cleanUrl}
      rel="noreferrer"
      target="_blank"
    >
      Open file
    </a>
  );
}

function MediaThumb({ type, url }: { type: string; url?: string | null }) {
  return <MediaPreview className="h-16 w-16 shrink-0 rounded-2xl" type={type} url={url || null} />;
}

function useFilePreview(file: File | null) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return previewUrl;
}

function VerificationPanel({
  evidence,
  farmId,
  latest,
  onEvidenceDelete,
  onEvidenceUpload,
  onSaved,
  verifications,
}: {
  evidence: VerificationEvidence[];
  farmId: string;
  latest: FarmVerification | null;
  onEvidenceDelete: (id: string) => Promise<void>;
  onEvidenceUpload: (file: File, caption: string, isPublic: boolean) => Promise<void>;
  onSaved: () => void;
  verifications: FarmVerification[];
}) {
  const [form, setForm] = useState<VerificationPayload>({
    agroecologyVerified: true,
    chemicalFreeClaim: true,
    checklistJson: "{}",
    nextVerificationDue: "",
    observations: "",
    status: "VERIFIED",
    verificationDate: today(),
    verificationType: "FIELD_VISIT",
    verifiedByUserId: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setError("");
    try {
      if (form.checklistJson) JSON.parse(form.checklistJson);
      setSaving(true);
      await verificationApi.create(farmId, {
        ...form,
        nextVerificationDue: form.nextVerificationDue || null,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save verification.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <h2 className="text-xl font-black">Verification</h2>
      {latest ? (
        <p className="mt-2 text-sm font-bold text-emerald-800">
          Latest: {latest.status} on {latest.verificationDate}
        </p>
      ) : (
        <p className="mt-2 text-sm text-stone-500">No verification yet.</p>
      )}
      {latest ? (
        <div className="mt-4">
          <h3 className="text-sm font-black uppercase text-stone-500">
            Evidence for latest verification
          </h3>
          <EvidenceUploader
            onDelete={onEvidenceDelete}
            onUpload={onEvidenceUpload}
            evidence={evidence}
          />
        </div>
      ) : null}
      {verifications.length ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-3">
          <h3 className="font-black text-emerald-950">Verification history</h3>
          <div className="mt-2 space-y-2">
            {verifications.map((item) => (
              <div className="rounded-xl bg-white p-3 text-sm" key={item.id}>
                <p className="font-black">
                  {item.status || "Recorded"} - {item.verificationDate}
                </p>
                <p className="text-stone-600">{item.observations || "No observations added."}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="mt-4 grid gap-3">
        <input
          className={inputClass}
          type="date"
          value={form.verificationDate}
          onChange={(event) => setForm({ ...form, verificationDate: event.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Verification type"
          value={form.verificationType}
          onChange={(event) => setForm({ ...form, verificationType: event.target.value })}
        />
        <select
          className={inputClass}
          value={form.status}
          onChange={(event) => setForm({ ...form, status: event.target.value })}
        >
          <option>VERIFIED</option>
          <option>PENDING</option>
          <option>REJECTED</option>
        </select>
        <textarea
          className={`${inputClass} min-h-24`}
          placeholder="Checklist JSON"
          value={form.checklistJson ?? ""}
          onChange={(event) => setForm({ ...form, checklistJson: event.target.value })}
        />
        <textarea
          className={`${inputClass} min-h-24`}
          placeholder="Observations"
          value={form.observations ?? ""}
          onChange={(event) => setForm({ ...form, observations: event.target.value })}
        />
        <input
          className={inputClass}
          type="date"
          value={form.nextVerificationDue ?? ""}
          onChange={(event) => setForm({ ...form, nextVerificationDue: event.target.value })}
        />
        <label className="flex gap-2 text-sm font-bold">
          <input
            checked={Boolean(form.chemicalFreeClaim)}
            onChange={(event) => setForm({ ...form, chemicalFreeClaim: event.target.checked })}
            type="checkbox"
          />{" "}
          Chemical-free claim
        </label>
        <label className="flex gap-2 text-sm font-bold">
          <input
            checked={Boolean(form.agroecologyVerified)}
            onChange={(event) => setForm({ ...form, agroecologyVerified: event.target.checked })}
            type="checkbox"
          />{" "}
          Agroecology verified
        </label>
        {error ? <p className="font-bold text-red-700">{error}</p> : null}
        <Button disabled={saving} onClick={() => void save()}>
          {saving ? "Saving..." : "Add Verification"}
        </Button>
      </div>
    </Card>
  );
}

// BatchesListView supports all, farmer-scoped, and farm-scoped batch lists.
export function BatchesListView({ farmId, farmerId }: { farmId?: string; farmerId?: string }) {
  const [batches, setBatches] = useState<BatchWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (farmId) setBatches((await batchApi.listByFarm(farmId)) as BatchWithRelations[]);
      else if (farmerId)
        setBatches((await batchApi.listByFarmer(farmerId)) as BatchWithRelations[]);
      else setBatches(await listAllBatches());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load batches.");
    } finally {
      setLoading(false);
    }
  }, [farmId, farmerId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell>
      <PageHeader
        actions={<ButtonLink href="/admin/batches/new">Add Batch</ButtonLink>}
        title="Batches"
      />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {!loading && !error && !batches.length ? <EmptyState message="No batches found." /> : null}
      <div className="grid gap-3">
        {batches.map((batch) => (
          <Card key={batch.id}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-black">{batch.batchCode}</h2>
                <p className="font-bold text-stone-600">
                  {batch.cropName} - {batch.variety || "No variety"} - {batch.quantity} {batch.unit}
                </p>
                <p className="text-sm text-stone-500">
                  {batch.farmer?.name || batch.farmerName || "Unknown farmer"} /{" "}
                  {batch.farm?.farmName || batch.farmName || "Unknown farm"}
                </p>
                <p className="text-xs text-stone-400">
                  Harvest {batch.harvestDate} - Packed {fmt(batch.packedDate)} - Best before{" "}
                  {fmt(batch.bestBeforeDate)} - {batch.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href={`/admin/batches/${batch.id}`} variant="secondary">
                  Open
                </ButtonLink>
                <ButtonLink href={`/admin/batches/${batch.id}/edit`} variant="secondary">
                  Edit
                </ButtonLink>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}

// BatchFormView handles batch create/edit with optional farmer/farm query prefill.
export function BatchFormView({ batchId }: { batchId?: string }) {
  const router = useRouter();
  const search = useSearchParams();
  const lockedFarmerId = search.get("farmerId");
  const lockedFarmId = search.get("farmId");
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      farmerApi.list(),
      listAllFarms(),
      batchId ? batchApi.get(batchId) : Promise.resolve(null),
    ])
      .then(([nextFarmers, nextFarms, nextBatch]) => {
        setFarmers(nextFarmers);
        setFarms(nextFarms);
        setBatch(nextBatch);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [batchId]);

  return (
    <AdminShell>
      <PageHeader title={batchId ? "Edit Batch" : "Add Batch"} />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error ? (
        <BatchForm
          farmers={farmers}
          farms={farms}
          initial={batch}
          lockedFarmerId={lockedFarmerId}
          lockedFarmId={lockedFarmId}
          onSubmit={async (payload: BatchPayload) => {
            const saved = batchId
              ? await batchApi.update(batchId, payload)
              : await batchApi.create(payload);
            router.push(`/admin/batches/${saved.id}`);
          }}
        />
      ) : null}
    </AdminShell>
  );
}

// BatchDetailView manages timeline, price breakdown, and QR generation for a batch.
export function BatchDetailView({ batchId }: { batchId: string }) {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [price, setPrice] = useState<PriceBreakdown | null>(null);
  const [qr, setQr] = useState<QrCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextBatch, nextEvents, nextPrice, nextQr] = await Promise.all([
        batchApi.get(batchId),
        traceEventApi.list(batchId),
        priceApi.get(batchId),
        qrApi.get(batchId),
      ]);
      const [nextFarmer, nextFarm] = await Promise.all([
        farmerApi.get(nextBatch.farmerId),
        farmApi.get(nextBatch.farmId),
      ]);
      setBatch(nextBatch);
      setEvents(nextEvents);
      setFarm(nextFarm);
      setFarmer(nextFarmer);
      setPrice(nextPrice);
      setQr(nextQr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load batch.");
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminShell>
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={load} /> : null}
      {batch ? (
        <>
          <PageHeader
            actions={<ButtonLink href={`/admin/batches/${batch.id}/edit`}>Edit Batch</ButtonLink>}
            title={batch.batchCode}
          />
          <Card>
            <InfoGrid
              items={[
                { label: "Crop", value: batch.cropName },
                { label: "Farmer", value: farmer?.name },
                { label: "Farm", value: farm?.farmName },
                { label: "Variety", value: batch.variety },
                { label: "Quantity", value: `${batch.quantity} ${batch.unit}` },
                { label: "Harvest Date", value: batch.harvestDate },
                { label: "Packed Date", value: batch.packedDate },
                { label: "Best Before", value: batch.bestBeforeDate },
                { label: "Status", value: batch.status },
              ]}
            />
          </Card>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <TraceEventPanel batchId={batch.id} events={events} onSaved={load} />
            <PricePanel batchId={batch.id} price={price} onSaved={load} />
            <QrPanel batchId={batch.id} qr={qr} onSaved={load} />
          </div>
        </>
      ) : null}
    </AdminShell>
  );
}

function TraceEventPanel({
  batchId,
  events,
  onSaved,
}: {
  batchId: string;
  events: TraceEvent[];
  onSaved: () => void;
}) {
  const [form, setForm] = useState<TraceEventPayload>({
    actorUserId: null,
    description: "",
    eventTime: nowLocal(),
    eventType: "HARVESTED",
    location: "",
    metadataJson: "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await traceEventApi
      .create(batchId, {
        ...form,
        eventTime: new Date(form.eventTime).toISOString(),
        actorUserId: form.actorUserId || null,
        location: form.location || null,
        description: form.description || null,
        metadataJson: form.metadataJson || null,
      })
      .finally(() => setSaving(false));
    onSaved();
  }

  return (
    <Card>
      <h2 className="text-xl font-black">Trace Events</h2>
      <div className="mt-3 space-y-2">
        {events.map((event) => (
          <div className="rounded-2xl bg-stone-50 p-3" key={event.id}>
            <p className="font-black">{event.eventType}</p>
            <p className="text-sm text-stone-600">
              {event.eventTime} - {event.location}
            </p>
            <p className="text-sm">{event.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2">
        <select
          className={inputClass}
          value={form.eventType}
          onChange={(event) => setForm({ ...form, eventType: event.target.value })}
        >
          {["HARVESTED", "PACKED", "RECEIVED_AT_MARKET", "SOLD"].map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
        <input
          className={inputClass}
          type="datetime-local"
          value={form.eventTime}
          onChange={(event) => setForm({ ...form, eventTime: event.target.value })}
        />
        <input
          className={inputClass}
          placeholder="Location"
          value={form.location ?? ""}
          onChange={(event) => setForm({ ...form, location: event.target.value })}
        />
        <textarea
          className={`${inputClass} min-h-20`}
          placeholder="Description"
          value={form.description ?? ""}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
        />
        <textarea
          className={`${inputClass} min-h-20`}
          placeholder="Metadata JSON"
          value={form.metadataJson ?? ""}
          onChange={(event) => setForm({ ...form, metadataJson: event.target.value })}
        />
        <Button disabled={saving} onClick={() => void save()}>
          {saving ? "Saving..." : "Add Trace Event"}
        </Button>
      </div>
    </Card>
  );
}

function PricePanel({
  batchId,
  onSaved,
  price,
}: {
  batchId: string;
  onSaved: () => void;
  price: PriceBreakdown | null;
}) {
  const [form, setForm] = useState<PriceBreakdownPayload>({
    consumerPrice: 0,
    farmerPrice: 0,
    transportCost: 0,
    packingCost: 0,
    organizationCost: 0,
    platformCost: 0,
    currency: "INR",
    priceUnit: "kg",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (price) {
      setForm({
        consumerPrice: price.consumerPrice,
        farmerPrice: price.farmerPrice,
        transportCost: price.transportCost ?? 0,
        packingCost: price.packingCost ?? 0,
        organizationCost: price.organizationCost ?? 0,
        platformCost: price.platformCost ?? 0,
        currency: price.currency,
        priceUnit: price.priceUnit,
      });
    }
  }, [price]);

  async function save() {
    setSaving(true);
    const action = price ? priceApi.update : priceApi.create;
    await action(batchId, form).finally(() => setSaving(false));
    onSaved();
  }

  return (
    <Card>
      <h2 className="text-xl font-black">Price Breakdown</h2>
      <div className="mt-3 grid gap-2">
        {(
          [
            "consumerPrice",
            "farmerPrice",
            "transportCost",
            "packingCost",
            "organizationCost",
            "platformCost",
          ] as const
        ).map((key) => (
          <input
            className={inputClass}
            key={key}
            min={0}
            placeholder={key}
            type="number"
            value={form[key] ?? 0}
            onChange={(event) => setForm({ ...form, [key]: Number(event.target.value) })}
          />
        ))}
        <input
          className={inputClass}
          value={form.currency}
          onChange={(event) => setForm({ ...form, currency: event.target.value })}
        />
        <input
          className={inputClass}
          value={form.priceUnit}
          onChange={(event) => setForm({ ...form, priceUnit: event.target.value })}
        />
        <Button disabled={saving} onClick={() => void save()}>
          {saving ? "Saving..." : price ? "Update Price" : "Add Price"}
        </Button>
      </div>
    </Card>
  );
}

function QrPanel({
  batchId,
  onSaved,
  qr,
}: {
  batchId: string;
  onSaved: () => void;
  qr: QrCode | null;
}) {
  const [saving, setSaving] = useState(false);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const traceUrl = qr ? `${origin}/trace/${qr.publicToken}` : "";

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  async function generate() {
    setSaving(true);
    await qrApi.create(batchId).finally(() => setSaving(false));
    onSaved();
  }

  async function copyTraceUrl() {
    if (!traceUrl) return;
    await navigator.clipboard.writeText(traceUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Card>
      <h2 className="text-xl font-black">QR Code</h2>
      {qr ? (
        <div className="mt-3 space-y-3">
          {qr.qrImageUrl ? (
            <div className="rounded-3xl bg-white p-3 shadow-inner">
              <MediaPreview
                className="mx-auto aspect-square w-48 rounded-2xl"
                type="image"
                url={qr.qrImageUrl}
              />
            </div>
          ) : null}
          <p className="text-sm font-bold text-stone-600">Public trace URL</p>
          <Link
            className="block break-all rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900"
            href={`/trace/${qr.publicToken}`}
          >
            {traceUrl}
          </Link>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void copyTraceUrl()} variant="secondary">
              {copied ? "Copied" : "Copy URL"}
            </Button>
            <ButtonLink href={`/trace/${qr.publicToken}`} variant="secondary">
              Open Trace Page
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <p className="mb-3 text-stone-600">No QR has been generated for this batch.</p>
          <Button disabled={saving} onClick={() => void generate()}>
            {saving ? "Generating..." : "Generate QR Code"}
          </Button>
        </div>
      )}
    </Card>
  );
}
