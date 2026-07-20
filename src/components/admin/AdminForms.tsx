"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import type {
  Batch,
  BatchPayload,
  Farm,
  Farmer,
  FarmerPayload,
  FarmPayload,
  ProcuredBatchPayload,
  SowingBatchPayload,
} from "@/types/admin";
import { Button, Card, CreatableCombobox, Field, inputClass } from "./AdminPrimitives";

type SubmitState = { error?: string; success?: string };

const today = () => new Date().toISOString().slice(0, 10);

const DEFAULT_FARMING_TYPES = [
  "NATURAL_FARMING",
  "ORGANIC",
  "REGENERATIVE",
  "PERMACULTURE",
  "BIODYNAMIC",
  "CONVENTIONAL",
  "MIXED",
];

const FARMING_TYPE_STORAGE_KEY = "ftf.farming-types";

export function mergeFarmingTypeOptions(existingValues: string[] = []) {
  let stored: string[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(FARMING_TYPE_STORAGE_KEY);
      stored = raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      stored = [];
    }
  }
  return [...new Set([...DEFAULT_FARMING_TYPES, ...stored, ...existingValues].filter(Boolean))].sort(
    (a, b) => a.localeCompare(b),
  );
}

export function rememberFarmingType(value: string) {
  const normalized = value.trim();
  if (!normalized || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(FARMING_TYPE_STORAGE_KEY);
    const stored = raw ? (JSON.parse(raw) as string[]) : [];
    if (stored.some((item) => item.toLowerCase() === normalized.toLowerCase())) return;
    localStorage.setItem(
      FARMING_TYPE_STORAGE_KEY,
      JSON.stringify([...stored, normalized].sort((a, b) => a.localeCompare(b))),
    );
  } catch {
    // Ignore storage failures; options still come from defaults and loaded farms.
  }
}

export function farmerPayloadKey(payload: FarmerPayload, active: boolean) {
  return JSON.stringify({ ...payload, active });
}

export function fileFingerprint(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

const ADD_FARMER_DRAFT_KEY = "ftf.add-farmer-draft";

export type AddFarmerDraft = {
  farmerId: string;
  phone: string;
  savedPayloadKey: string;
  uploadedPhotoFingerprint: string | null;
  uploadedVideoFingerprint: string | null;
};

export function loadAddFarmerDraft(): AddFarmerDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ADD_FARMER_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as AddFarmerDraft) : null;
  } catch {
    return null;
  }
}

export function persistAddFarmerDraft(draft: AddFarmerDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ADD_FARMER_DRAFT_KEY, JSON.stringify(draft));
}

export function clearAddFarmerDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ADD_FARMER_DRAFT_KEY);
}

type FarmFormState = Omit<
  FarmPayload,
  "latitude" | "longitude" | "altitudeMeters" | "sizeAcres"
> & {
  latitude: string;
  longitude: string;
  altitudeMeters: string;
  sizeAcres: string;
};

type ProcuredBatchFormState = Omit<ProcuredBatchPayload, "quantityReceived" | "farmerPricePerUnit"> & {
  quantityReceived: string;
  farmerPricePerUnit: string;
};

type SowingBatchFormState = Omit<SowingBatchPayload, "acresSown"> & {
  acresSown: string;
};

function FarmerFarmFields({
  farmers,
  farms,
  farmerId,
  farmId,
  lockedFarmerId,
  lockedFarmId,
  onChange,
}: {
  farmers: Farmer[];
  farms: Farm[];
  farmerId: string;
  farmId: string;
  lockedFarmerId?: string | null;
  lockedFarmId?: string | null;
  onChange: (next: { farmerId: string; farmId: string }) => void;
}) {
  const selectableFarms = farms.filter(
    (farm) => farm.active !== false && (!farmerId || farm.farmerId === farmerId),
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Farmer" required>
        <select
          className={inputClass}
          disabled={Boolean(lockedFarmerId)}
          value={farmerId}
          onChange={(event) => onChange({ farmerId: event.target.value, farmId: "" })}
        >
          <option value="">Select farmer</option>
          {farmers.map((farmer) => (
            <option key={farmer.id} value={farmer.id}>
              {farmer.name} - {farmer.village}, {farmer.district}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Farm" required>
        <select
          className={inputClass}
          disabled={Boolean(lockedFarmId)}
          value={farmId}
          onChange={(event) => onChange({ farmerId, farmId: event.target.value })}
        >
          <option value="">Select farm</option>
          {selectableFarms.map((farm) => (
            <option key={farm.id} value={farm.id}>
              {farm.farmName}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}

export function SowingBatchForm({
  cropOptions,
  farms,
  farmers,
  lockedFarmId,
  lockedFarmerId,
  onSubmit,
  varietyOptions,
}: {
  cropOptions?: string[];
  farms: Farm[];
  farmers: Farmer[];
  lockedFarmId?: string | null;
  lockedFarmerId?: string | null;
  onSubmit: (payload: SowingBatchPayload) => Promise<void>;
  varietyOptions?: string[];
}) {
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<SubmitState>({});
  const [form, setForm] = useState<SowingBatchFormState>({
    acresSown: "",
    cropName: "",
    farmId: lockedFarmId ?? "",
    farmerId: lockedFarmerId ?? "",
    sowingDate: today(),
    variety: "",
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState({});
    if (!form.farmerId || !form.farmId || !form.cropName || !form.sowingDate) {
      setState({ error: "Please fill all required sowing fields." });
      return;
    }
    const acresSown = Number(form.acresSown);
    if (!Number.isFinite(acresSown) || acresSown <= 0) {
      setState({ error: "Acres sown must be positive." });
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        acresSown,
        cropName: form.cropName,
        farmId: form.farmId,
        farmerId: form.farmerId,
        sowingDate: form.sowingDate,
        variety: form.variety || null,
      });
      setState({ success: "Sowing batch saved. QR code will be ready shortly." });
    } catch (error) {
      setState({ error: error instanceof Error ? error.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <Card>
        <h2 className="text-xl font-black">Sowing details</h2>
        <p className="mt-2 text-sm text-stone-600">
          Register what was planted on the farm. A QR code is created for this crop cycle.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <CreatableCombobox
            label="Crop Name"
            options={cropOptions ?? []}
            placeholder="Choose or add a crop"
            required
            value={form.cropName}
            onChange={(cropName) => setForm({ ...form, cropName })}
          />
          <CreatableCombobox
            label="Variety"
            options={varietyOptions ?? []}
            placeholder="Choose or add a variety"
            value={form.variety ?? ""}
            onChange={(variety) => setForm({ ...form, variety })}
          />
          <TextField
            label="Acres sown"
            required
            type="number"
            placeholder="Acres sown"
            value={form.acresSown}
            onChange={(acresSown) => setForm({ ...form, acresSown })}
          />
          <TextField
            label="Sowing date"
            required
            type="date"
            value={form.sowingDate}
            onChange={(sowingDate) => setForm({ ...form, sowingDate })}
          />
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Farmer & Farm</h2>
        <div className="mt-4">
          <FarmerFarmFields
            farmId={form.farmId}
            farmerId={form.farmerId}
            farms={farms}
            farmers={farmers}
            lockedFarmId={lockedFarmId}
            lockedFarmerId={lockedFarmerId}
            onChange={({ farmerId, farmId }) => setForm({ ...form, farmerId, farmId })}
          />
        </div>
      </Card>
      <SubmitBar saving={saving} state={state} />
    </form>
  );
}

export function ProcuredBatchForm({
  cropOptions,
  farms,
  farmers,
  initial,
  lockedFarmId,
  lockedFarmerId,
  onSubmit,
  sowingBatches,
  varietyOptions,
}: {
  cropOptions?: string[];
  farms: Farm[];
  farmers: Farmer[];
  initial?: Batch | null;
  lockedFarmId?: string | null;
  lockedFarmerId?: string | null;
  onSubmit: (payload: BatchPayload) => Promise<void>;
  sowingBatches: Batch[];
  varietyOptions?: string[];
}) {
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<SubmitState>({});
  const [form, setForm] = useState<ProcuredBatchFormState>({
    cropName: initial?.cropName ?? "",
    farmId: initial?.farmId ?? lockedFarmId ?? "",
    farmerId: initial?.farmerId ?? lockedFarmerId ?? "",
    harvestDate: initial?.harvestDate ?? today(),
    parentBatchId: initial?.parentBatchId ?? "",
    paymentStatus: initial?.paymentStatus ?? "UNPAID",
    quantityReceived: initial?.quantityReceived == null ? "" : String(initial.quantityReceived),
    farmerPricePerUnit:
      initial?.farmerPricePerUnit == null ? "" : String(initial.farmerPricePerUnit),
    receivedDate: initial?.receivedDate ?? today(),
    unit: initial?.unit ?? "kg",
    variety: initial?.variety ?? "",
  });

  const selectableSowingBatches = sowingBatches.filter(
    (batch) => batch.batchType === "SOWING" && (!form.farmId || batch.farmId === form.farmId),
  );

  useEffect(() => {
    if (!form.parentBatchId) return;
    const selected = selectableSowingBatches.find((batch) => batch.id === form.parentBatchId);
    if (!selected) return;
    setForm((current) => ({
      ...current,
      cropName: selected.cropName,
      variety: selected.variety ?? "",
      farmId: selected.farmId,
      farmerId: selected.farmerId,
    }));
  }, [form.parentBatchId, selectableSowingBatches]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState({});
    if (
      !form.farmerId ||
      !form.farmId ||
      !form.parentBatchId ||
      !form.cropName ||
      !form.unit ||
      !form.harvestDate ||
      !form.receivedDate
    ) {
      setState({ error: "Please fill all required procurement fields." });
      return;
    }
    const quantityReceived = Number(form.quantityReceived);
    const farmerPricePerUnit = Number(form.farmerPricePerUnit);
    if (!Number.isFinite(quantityReceived) || quantityReceived <= 0) {
      setState({ error: "Quantity received must be positive." });
      return;
    }
    if (!form.farmerPricePerUnit.trim() || !isNonNegative(farmerPricePerUnit)) {
      setState({ error: "Farmer price per unit cannot be negative." });
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        cropName: form.cropName,
        farmId: form.farmId,
        farmerId: form.farmerId,
        harvestDate: form.harvestDate,
        parentBatchId: form.parentBatchId,
        paymentStatus: form.paymentStatus,
        quantityReceived,
        farmerPricePerUnit,
        receivedDate: form.receivedDate,
        status: initial?.status ?? "RECEIVED",
        unit: form.unit,
        variety: form.variety || null,
      });
      setState({ success: "Procurement batch saved successfully." });
    } catch (error) {
      setState({ error: error instanceof Error ? error.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <Card>
        <h2 className="text-xl font-black">Procurement details</h2>
        <p className="mt-2 text-sm text-stone-600">
          Record produce received today. It links to the sowing batch and updates the same QR code.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Sowing batch" required>
            <select
              className={inputClass}
              value={form.parentBatchId}
              onChange={(event) => setForm({ ...form, parentBatchId: event.target.value })}
            >
              <option value="">Select sowing batch</option>
              {selectableSowingBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.cropName}
                  {batch.variety ? ` (${batch.variety})` : ""} · {batch.acresSown ?? "?"} acres ·
                  sown {batch.sowingDate}
                </option>
              ))}
            </select>
          </Field>
          <CreatableCombobox
            label="Crop Name"
            options={cropOptions ?? []}
            placeholder="Choose or add a crop"
            required
            value={form.cropName}
            onChange={(cropName) => setForm({ ...form, cropName })}
          />
          <CreatableCombobox
            label="Variety"
            options={varietyOptions ?? []}
            placeholder="Choose or add a variety"
            value={form.variety ?? ""}
            onChange={(variety) => setForm({ ...form, variety })}
          />
          <TextField
            label="Quantity received"
            required
            type="number"
            placeholder="Quantity received"
            value={form.quantityReceived}
            onChange={(quantityReceived) => setForm({ ...form, quantityReceived })}
          />
          <TextField
            label="Unit"
            required
            value={form.unit}
            onChange={(unit) => setForm({ ...form, unit })}
          />
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Farmer & Farm</h2>
        <div className="mt-4">
          <FarmerFarmFields
            farmId={form.farmId}
            farmerId={form.farmerId}
            farms={farms}
            farmers={farmers}
            lockedFarmId={lockedFarmId}
            lockedFarmerId={lockedFarmerId}
            onChange={({ farmerId, farmId }) =>
              setForm({ ...form, farmerId, farmId, parentBatchId: "" })
            }
          />
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Receiving & Pricing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField
            label="Harvest date"
            required
            type="date"
            value={form.harvestDate}
            onChange={(harvestDate) => setForm({ ...form, harvestDate })}
          />
          <TextField
            label="Received date"
            required
            type="date"
            value={form.receivedDate}
            onChange={(receivedDate) => setForm({ ...form, receivedDate })}
          />
          <TextField
            label="Farmer price per unit"
            required
            type="number"
            placeholder="Farmer price per unit"
            value={form.farmerPricePerUnit}
            onChange={(farmerPricePerUnit) => setForm({ ...form, farmerPricePerUnit })}
          />
          <Field label="Payment status" required>
            <select
              className={inputClass}
              value={form.paymentStatus}
              onChange={(event) => setForm({ ...form, paymentStatus: event.target.value })}
            >
              <option value="UNPAID">UNPAID</option>
              <option value="PAID">PAID</option>
            </select>
          </Field>
        </div>
      </Card>
      <SubmitBar saving={saving} state={state} />
    </form>
  );
}
export function FarmerForm({
  initial,
  onSubmit,
}: {
  initial?: Farmer | null;
  onSubmit: (
    payload: FarmerPayload,
    active: boolean,
    media?: { profilePhoto?: File | null; introVideo?: File | null },
  ) => Promise<void>;
}) {
  const isAddMode = !initial;
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [state, setState] = useState<SubmitState>({});
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [introVideoFile, setIntroVideoFile] = useState<File | null>(null);
  const profilePhotoPreview = useFilePreview(profilePhotoFile);
  const introVideoPreview = useFilePreview(introVideoFile);
  const [form, setForm] = useState<FarmerPayload>({
    bio: initial?.bio ?? "",
    farmerCode: initial?.farmerCode ?? "",
    introVideoUrl: initial?.introVideoUrl ?? "",
    joinedDate: initial?.joinedDate ?? today(),
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    profilePhotoUrl: initial?.profilePhotoUrl ?? "",
    village: initial?.village ?? "",
    district: initial?.district ?? "",
    state: initial?.state ?? "",
  });
  const [active, setActive] = useState(initial?.active ?? true);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setState({ error: "Geolocation is not available in this browser." });
      return;
    }
    setLocating(true);
    setState({});
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const details = await fetchLocationDetails(
            position.coords.latitude,
            position.coords.longitude,
          );
          setForm((current) => ({
            ...current,
            district: details.district || current.district,
            state: details.state || current.state,
            village: details.village || current.village,
          }));
          setState({ success: "Location details filled. Please verify the address." });
        } catch (error) {
          setState({
            error:
              error instanceof Error ? error.message : "Could not look up your current location.",
          });
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setState({ error: "Could not read current location." });
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState({});
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (
      !form.name ||
      !form.phone ||
      !form.village ||
      !form.district ||
      !form.state ||
      !form.joinedDate
    ) {
      setState({ error: "Please fill all required farmer fields." });
      return;
    }
    if (phoneDigits.length !== 10) {
      setState({ error: "Phone number must contain exactly 10 digits." });
      return;
    }
    setSaving(true);
    try {
      await onSubmit(
        {
          ...form,
          phone: phoneDigits,
          introVideoUrl: null,
          profilePhotoUrl: null,
        },
        active,
        isAddMode
          ? {
              profilePhoto: profilePhotoFile,
              introVideo: introVideoFile,
            }
          : undefined,
      );
      setState({ success: "Farmer saved successfully." });
    } catch (error) {
      setState({ error: error instanceof Error ? error.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <Card>
        <h2 className="text-xl font-black">Basic Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField
            label="Name"
            required
            value={form.name}
            onChange={(name) => setForm({ ...form, name })}
          />
          <TextField
            label="Phone"
            required
            value={form.phone}
            onChange={(phone) =>
              setForm({
                ...form,
                phone: isAddMode ? phone.replace(/\D/g, "").slice(0, 10) : phone,
              })
            }
            help={isAddMode ? "10 digits only" : undefined}
            inputMode={isAddMode ? "numeric" : undefined}
            maxLength={isAddMode ? 10 : undefined}
          />
          <TextField
            label="Joined Date"
            required
            type="date"
            value={form.joinedDate}
            onChange={(joinedDate) => setForm({ ...form, joinedDate })}
          />
        </div>
      </Card>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black">Location</h2>
          {isAddMode ? (
            <Button disabled={locating} onClick={useCurrentLocation} type="button" variant="secondary">
              {locating ? "Finding address..." : "Use current location"}
            </Button>
          ) : null}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField
            label="Village"
            required
            value={form.village}
            onChange={(village) => setForm({ ...form, village })}
          />
          <TextField
            label="District"
            required
            value={form.district}
            onChange={(district) => setForm({ ...form, district })}
          />
          <TextField
            label="State"
            required
            value={form.state}
            onChange={(state) => setForm({ ...form, state })}
          />
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Profile</h2>
        <Field label="Bio">
          <textarea
            className={`${inputClass} min-h-28`}
            value={form.bio ?? ""}
            onChange={(event) => setForm({ ...form, bio: event.target.value })}
          />
        </Field>
        {isAddMode ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <MediaFilePicker
              accept="image/jpeg,image/png,image/webp"
              file={profilePhotoFile}
              label="Profile photo"
              onFile={setProfilePhotoFile}
              previewType="image"
              previewUrl={profilePhotoPreview}
            />
            <MediaFilePicker
              accept="video/mp4,video/quicktime,video/webm"
              file={introVideoFile}
              label="Intro video"
              onFile={setIntroVideoFile}
              previewType="video"
              previewUrl={introVideoPreview}
            />
          </div>
        ) : null}
        <label className="mt-4 flex items-center gap-2 text-sm font-bold">
          <input
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            type="checkbox"
          />
          Active farmer
        </label>
      </Card>
      <SubmitBar
        saving={saving}
        savingLabel={
          isAddMode && (profilePhotoFile || introVideoFile)
            ? "Saving and uploading..."
            : "Saving..."
        }
        state={state}
      />
    </form>
  );
}

// FarmForm supports both free farmer selection and locked farmer deep links.
export function FarmForm({
  farmers,
  farmingTypeOptions,
  initial,
  lockedFarmerId,
  onFarmingTypeUsed,
  onUnlockFarmer,
  onSubmit,
}: {
  farmers: Farmer[];
  farmingTypeOptions?: string[];
  initial?: Farm | null;
  lockedFarmerId?: string | null;
  onFarmingTypeUsed?: (farmingType: string) => void;
  onSubmit: (payload: FarmPayload) => Promise<void>;
  onUnlockFarmer?: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [state, setState] = useState<SubmitState>({});
  const [form, setForm] = useState<FarmFormState>({
    farmerId: initial?.farmerId ?? lockedFarmerId ?? "",
    farmName: initial?.farmName ?? "",
    village: initial?.village ?? "",
    district: initial?.district ?? "",
    state: initial?.state ?? "",
    latitude: initial?.latitude == null ? "" : String(initial.latitude),
    longitude: initial?.longitude == null ? "" : String(initial.longitude),
    altitudeMeters:
      initial?.altitudeMeters == null ? "" : String(initial.altitudeMeters),
    sizeAcres: initial?.sizeAcres == null ? "" : String(initial.sizeAcres),
    farmingType: initial?.farmingType ?? "NATURAL_FARMING",
  });
  const locked = Boolean(lockedFarmerId) && form.farmerId === lockedFarmerId;

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setState({ error: "Geolocation is not available in this browser." });
      return;
    }
    setLocating(true);
    setState({});
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const coordinateFields = {
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
          altitudeMeters:
            position.coords.altitude == null ? "" : position.coords.altitude.toFixed(1),
        };
        setForm((current) => ({ ...current, ...coordinateFields }));
        try {
          const details = await fetchLocationDetails(latitude, longitude);
          setForm((current) => ({
            ...current,
            ...coordinateFields,
            altitudeMeters:
              details.altitudeMeters == null
                ? coordinateFields.altitudeMeters
                : String(Math.round(details.altitudeMeters)),
            district: details.district || current.district,
            state: details.state || current.state,
            village: details.village || current.village,
          }));
          setState({ success: "Location details filled. Please verify the address." });
        } catch (error) {
          setState({
            error:
              error instanceof Error
                ? error.message
                : "Coordinates captured, but address lookup failed.",
          });
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setState({ error: "Could not read current location." });
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState({});
    if (
      !form.farmerId ||
      !form.farmName ||
      !form.village ||
      !form.district ||
      !form.state ||
      !form.farmingType
    ) {
      setState({ error: "Please fill all required farm fields." });
      return;
    }
    const sizeAcres = Number(form.sizeAcres);
    if (!Number.isFinite(sizeAcres) || sizeAcres <= 0) {
      setState({ error: "Farm size must be a positive number." });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        farmingType: form.farmingType.trim(),
        latitude: optionalNumber(form.latitude),
        longitude: optionalNumber(form.longitude),
        altitudeMeters: optionalNumber(form.altitudeMeters),
        sizeAcres,
      };
      await onSubmit(payload);
      onFarmingTypeUsed?.(payload.farmingType);
      setState({ success: "Farm saved successfully." });
    } catch (error) {
      setState({ error: error instanceof Error ? error.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <Card>
        <h2 className="text-xl font-black">Basic Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Farmer" required>
            <div className="flex gap-2">
              <select
                className={inputClass}
                disabled={locked}
                value={form.farmerId}
                onChange={(event) => setForm({ ...form, farmerId: event.target.value })}
              >
                <option value="">Select farmer</option>
                {farmers.map((farmer) => (
                  <option key={farmer.id} value={farmer.id}>
                    {farmer.name} - {farmer.village}, {farmer.district}
                  </option>
                ))}
              </select>
              {locked ? (
                <Button onClick={onUnlockFarmer} type="button" variant="secondary">
                  Change
                </Button>
              ) : null}
            </div>
          </Field>
          <TextField
            label="Farm Name"
            required
            value={form.farmName}
            onChange={(farmName) => setForm({ ...form, farmName })}
          />
          <CreatableCombobox
            label="Farming Type"
            onChange={(farmingType) => setForm({ ...form, farmingType })}
            options={farmingTypeOptions ?? DEFAULT_FARMING_TYPES}
            placeholder="Choose or add a farming type"
            required
            value={form.farmingType}
          />
          <TextField
            label="Size Acres"
            required
            type="number"
            placeholder="Size Acres"
            value={form.sizeAcres}
            onChange={(sizeAcres) => setForm({ ...form, sizeAcres })}
          />
        </div>
      </Card>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black">Location</h2>
          <Button disabled={locating} onClick={useCurrentLocation} variant="secondary">
            {locating ? "Finding address..." : "Use current location"}
          </Button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField
            label="Village"
            required
            value={form.village}
            onChange={(village) => setForm({ ...form, village })}
          />
          <TextField
            label="District"
            required
            value={form.district}
            onChange={(district) => setForm({ ...form, district })}
          />
          <TextField
            label="State"
            required
            value={form.state}
            onChange={(state) => setForm({ ...form, state })}
          />
          <TextField
            label="Latitude"
            type="number"
            placeholder="Latitude"
            value={form.latitude}
            onChange={(latitude) => setForm({ ...form, latitude })}
          />
          <TextField
            label="Longitude"
            type="number"
            placeholder="Longitude"
            value={form.longitude}
            onChange={(longitude) => setForm({ ...form, longitude })}
          />
          <TextField
            help="Approximate elevation above sea level"
            label="Altitude (metres)"
            type="number"
            placeholder="Altitude"
            value={form.altitudeMeters}
            onChange={(altitudeMeters) => setForm({ ...form, altitudeMeters })}
          />
        </div>
        <p className="mt-3 text-xs text-[var(--ftf-muted)]">
          Address data © OpenStreetMap contributors. Elevation data: Open-Meteo / Copernicus.
        </p>
      </Card>
      <SubmitBar saving={saving} state={state} />
    </form>
  );
}

function SubmitBar({
  saving,
  savingLabel = "Saving...",
  state,
}: {
  saving: boolean;
  savingLabel?: string;
  state: SubmitState;
}) {
  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {state.error ? <p className="font-bold text-red-700">{state.error}</p> : null}
        {state.success ? <p className="font-bold text-emerald-700">{state.success}</p> : null}
      </div>
      <Button disabled={saving} type="submit">
        {saving ? savingLabel : "Save"}
      </Button>
    </Card>
  );
}

function TextField({
  help,
  inputMode,
  label,
  maxLength,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: {
  help?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string | number;
}) {
  return (
    <Field help={help} label={label} required={required}>
      <input
        className={inputClass}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

type LocationDetails = {
  altitudeMeters?: number | null;
  district?: string | null;
  message?: string;
  state?: string | null;
  village?: string | null;
};

async function fetchLocationDetails(latitude: number, longitude: number): Promise<LocationDetails> {
  const response = await fetch(
    `/api/location-details?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`,
  );
  const details = (await response.json()) as LocationDetails;
  if (!response.ok) throw new Error(details.message || "Location lookup failed.");
  return details;
}

function MediaFilePicker({
  accept,
  file,
  label,
  onFile,
  previewType,
  previewUrl,
  required = false,
}: {
  accept: string;
  file: File | null;
  label: string;
  onFile: (file: File | null) => void;
  previewType: "image" | "video";
  previewUrl: string | null;
  required?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <p className="text-sm font-black text-stone-900">
        {label}
        {required ? <span className="text-red-700"> *</span> : null}
      </p>
      <div className="mt-3 grid gap-3">
        {previewUrl ? (
          previewType === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={`${label} preview`} className="aspect-square w-full rounded-xl object-cover" src={previewUrl} />
          ) : (
            <video className="aspect-video w-full rounded-xl bg-black object-contain" controls src={previewUrl} />
          )
        ) : (
          <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white text-sm text-stone-500">
            No {label.toLowerCase()} selected
          </div>
        )}
        <input
          accept={accept}
          className={inputClass}
          type="file"
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
        />
        {file ? (
          <Button onClick={() => onFile(null)} type="button" variant="secondary">
            Remove {label.toLowerCase()}
          </Button>
        ) : null}
      </div>
    </div>
  );
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

function optionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}
