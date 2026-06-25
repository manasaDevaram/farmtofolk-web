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
} from "@/types/admin";
import { Button, Card, Field, inputClass } from "./AdminPrimitives";

type SubmitState = { error?: string; success?: string };

const today = () => new Date().toISOString().slice(0, 10);

// FarmerForm validates the required profile fields before calling the backend.
export function FarmerForm({
  initial,
  onSubmit,
}: {
  initial?: Farmer | null;
  onSubmit: (payload: FarmerPayload, active: boolean) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<SubmitState>({});
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

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState({});
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!form.name || !form.phone || !form.village || !form.district || !form.state || !form.joinedDate) {
      setState({ error: "Please fill all required farmer fields." });
      return;
    }
    if (phoneDigits.length !== 10) {
      setState({ error: "Phone number must contain exactly 10 digits." });
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ ...form, phone: phoneDigits }, active);
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
          <TextField label="Name" required value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <TextField label="Phone" required value={form.phone} onChange={(phone) => setForm({ ...form, phone })} help="10 digits only" />
          <TextField label="Joined Date" required type="date" value={form.joinedDate} onChange={(joinedDate) => setForm({ ...form, joinedDate })} />
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Location</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField label="Village" required value={form.village} onChange={(village) => setForm({ ...form, village })} />
          <TextField label="District" required value={form.district} onChange={(district) => setForm({ ...form, district })} />
          <TextField label="State" required value={form.state} onChange={(state) => setForm({ ...form, state })} />
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Profile</h2>
        <Field label="Bio">
          <textarea className={`${inputClass} min-h-28`} value={form.bio ?? ""} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
        </Field>
        <label className="mt-4 flex items-center gap-2 text-sm font-bold">
          <input checked={active} onChange={(event) => setActive(event.target.checked)} type="checkbox" />
          Active farmer
        </label>
      </Card>
      <SubmitBar saving={saving} state={state} />
    </form>
  );
}

// FarmForm supports both free farmer selection and locked farmer deep links.
export function FarmForm({
  farmers,
  initial,
  lockedFarmerId,
  onUnlockFarmer,
  onSubmit,
}: {
  farmers: Farmer[];
  initial?: Farm | null;
  lockedFarmerId?: string | null;
  onSubmit: (payload: FarmPayload) => Promise<void>;
  onUnlockFarmer?: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<SubmitState>({});
  const [form, setForm] = useState<FarmPayload>({
    farmerId: initial?.farmerId ?? lockedFarmerId ?? "",
    farmName: initial?.farmName ?? "",
    village: initial?.village ?? "",
    district: initial?.district ?? "",
    state: initial?.state ?? "",
    latitude: initial?.latitude ?? null,
    longitude: initial?.longitude ?? null,
    sizeAcres: initial?.sizeAcres ?? null,
    farmingType: initial?.farmingType ?? "NATURAL_FARMING",
  });
  const locked = Boolean(lockedFarmerId) && form.farmerId === lockedFarmerId;

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setState({ error: "Geolocation is not available in this browser." });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setForm({
          ...form,
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        }),
      () => setState({ error: "Could not read current location." }),
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState({});
    if (!form.farmerId || !form.farmName || !form.village || !form.district || !form.state || !form.farmingType) {
      setState({ error: "Please fill all required farm fields." });
      return;
    }
    if (form.sizeAcres == null || form.sizeAcres <= 0) {
      setState({ error: "Farm size must be a positive number." });
      return;
    }
    setSaving(true);
    try {
      await onSubmit(form);
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
              <select className={inputClass} disabled={locked} value={form.farmerId} onChange={(event) => setForm({ ...form, farmerId: event.target.value })}>
                <option value="">Select farmer</option>
                {farmers.map((farmer) => (
                  <option key={farmer.id} value={farmer.id}>{farmer.name} - {farmer.village}, {farmer.district}</option>
                ))}
              </select>
              {locked ? (
                <Button onClick={onUnlockFarmer} type="button" variant="secondary">Change</Button>
              ) : null}
            </div>
          </Field>
          <TextField label="Farm Name" required value={form.farmName} onChange={(farmName) => setForm({ ...form, farmName })} />
          <TextField label="Farming Type" required value={form.farmingType} onChange={(farmingType) => setForm({ ...form, farmingType })} help="Example: NATURAL_FARMING" />
          <TextField label="Size Acres" required type="number" value={form.sizeAcres ?? ""} onChange={(sizeAcres) => setForm({ ...form, sizeAcres: toNumber(sizeAcres) })} />
        </div>
      </Card>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black">Location</h2>
          <Button onClick={useCurrentLocation} variant="secondary">Use current location</Button>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField label="Village" required value={form.village} onChange={(village) => setForm({ ...form, village })} />
          <TextField label="District" required value={form.district} onChange={(district) => setForm({ ...form, district })} />
          <TextField label="State" required value={form.state} onChange={(state) => setForm({ ...form, state })} />
          <TextField label="Latitude" type="number" value={form.latitude ?? ""} onChange={(latitude) => setForm({ ...form, latitude: toNumber(latitude) })} />
          <TextField label="Longitude" type="number" value={form.longitude ?? ""} onChange={(longitude) => setForm({ ...form, longitude: toNumber(longitude) })} />
        </div>
      </Card>
      <SubmitBar saving={saving} state={state} />
    </form>
  );
}

// BatchForm guides the operator through farmer -> farm -> batch creation.
export function BatchForm({
  farms,
  farmers,
  initial,
  lockedFarmId,
  lockedFarmerId,
  onSubmit,
}: {
  farms: Farm[];
  farmers: Farmer[];
  initial?: Batch | null;
  lockedFarmId?: string | null;
  lockedFarmerId?: string | null;
  onSubmit: (payload: BatchPayload) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<SubmitState>({});
  const [form, setForm] = useState<BatchPayload>({
    batchCode: initial?.batchCode ?? "",
    cropName: initial?.cropName ?? "",
    farmId: initial?.farmId ?? lockedFarmId ?? "",
    farmerId: initial?.farmerId ?? lockedFarmerId ?? "",
    harvestDate: initial?.harvestDate ?? today(),
    packedDate: initial?.packedDate ?? "",
    bestBeforeDate: initial?.bestBeforeDate ?? "",
    quantity: initial?.quantity ?? 0,
    status: initial?.status ?? "HARVESTED",
    unit: initial?.unit ?? "kg",
    variety: initial?.variety ?? "",
  });

  const selectableFarms = useMemo(
    () => farms.filter((farm) => !form.farmerId || farm.farmerId === form.farmerId),
    [farms, form.farmerId],
  );

  useEffect(() => {
    if (form.farmId && !selectableFarms.some((farm) => farm.id === form.farmId)) {
      setForm((current) => ({ ...current, farmId: "" }));
    }
  }, [form.farmId, selectableFarms]);

  function generateBatchCode() {
    const crop = (form.cropName || "CROP").replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 8);
    const date = (form.harvestDate || today()).replaceAll("-", "");
    const suffix = Math.floor(100 + Math.random() * 900);
    setForm({ ...form, batchCode: `BATCH-${crop}-${date}-${suffix}` });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState({});
    if (!form.batchCode || !form.farmerId || !form.farmId || !form.cropName || !form.unit || !form.harvestDate || !form.status) {
      setState({ error: "Please fill all required batch fields." });
      return;
    }
    if (!form.quantity || form.quantity <= 0) {
      setState({ error: "Quantity must be positive." });
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ ...form, packedDate: form.packedDate || null, bestBeforeDate: form.bestBeforeDate || null, variety: form.variety || null });
      setState({ success: "Batch saved successfully." });
    } catch (error) {
      setState({ error: error instanceof Error ? error.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <Card>
        <h2 className="text-xl font-black">Batch Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Batch Code" required>
            <div className="flex gap-2">
              <input className={inputClass} value={form.batchCode} onChange={(event) => setForm({ ...form, batchCode: event.target.value })} />
              <Button onClick={generateBatchCode} type="button" variant="secondary">Generate</Button>
            </div>
          </Field>
          <TextField label="Crop Name" required value={form.cropName} onChange={(cropName) => setForm({ ...form, cropName })} />
          <TextField label="Variety" value={form.variety ?? ""} onChange={(variety) => setForm({ ...form, variety })} />
          <TextField label="Quantity" required type="number" value={form.quantity} onChange={(quantity) => setForm({ ...form, quantity: toNumber(quantity) ?? 0 })} />
          <TextField label="Unit" required value={form.unit} onChange={(unit) => setForm({ ...form, unit })} />
          <Field label="Status" required>
            <select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              {["HARVESTED", "PACKED", "READY_FOR_SALE", "SOLD"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </Field>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Farmer & Farm</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Farmer" required>
            <select className={inputClass} disabled={Boolean(lockedFarmerId)} value={form.farmerId} onChange={(event) => setForm({ ...form, farmerId: event.target.value, farmId: "" })}>
              <option value="">Select farmer</option>
              {farmers.map((farmer) => (
                <option key={farmer.id} value={farmer.id}>{farmer.name} - {farmer.village}, {farmer.district}</option>
              ))}
            </select>
          </Field>
          <Field label="Farm" required>
            <select className={inputClass} disabled={Boolean(lockedFarmId)} value={form.farmId} onChange={(event) => setForm({ ...form, farmId: event.target.value })}>
              <option value="">Select farm</option>
              {selectableFarms.map((farm) => (
                <option key={farm.id} value={farm.id}>{farm.farmName}</option>
              ))}
            </select>
          </Field>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black">Dates</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <TextField label="Harvest Date" required type="date" value={form.harvestDate} onChange={(harvestDate) => setForm({ ...form, harvestDate })} />
          <TextField label="Packed Date" type="date" value={form.packedDate ?? ""} onChange={(packedDate) => setForm({ ...form, packedDate })} />
          <TextField label="Best Before Date" type="date" value={form.bestBeforeDate ?? ""} onChange={(bestBeforeDate) => setForm({ ...form, bestBeforeDate })} />
        </div>
      </Card>
      <SubmitBar saving={saving} state={state} />
    </form>
  );
}

function SubmitBar({ saving, state }: { saving: boolean; state: SubmitState }) {
  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {state.error ? <p className="font-bold text-red-700">{state.error}</p> : null}
        {state.success ? <p className="font-bold text-emerald-700">{state.success}</p> : null}
      </div>
      <Button disabled={saving} type="submit">
        {saving ? "Saving..." : "Save"}
      </Button>
    </Card>
  );
}

function TextField({
  help,
  label,
  onChange,
  required,
  type = "text",
  value,
}: {
  help?: string;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string | number;
}) {
  return (
    <Field help={help} label={label} required={required}>
      <input className={inputClass} required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

function toNumber(value: string): number | null {
  if (value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
