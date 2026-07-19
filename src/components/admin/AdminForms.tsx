"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import type { Batch, BatchPayload, Farm, Farmer, FarmerPayload, FarmPayload } from "@/types/admin";
import { Button, Card, CreatableCombobox, Field, inputClass } from "./AdminPrimitives";

type SubmitState = { error?: string; success?: string };

const today = () => new Date().toISOString().slice(0, 10);

type FarmFormState = Omit<
  FarmPayload,
  "latitude" | "longitude" | "altitudeMeters" | "sizeAcres"
> & {
  latitude: string;
  longitude: string;
  altitudeMeters: string;
  sizeAcres: string;
};

type BatchFormState = Omit<BatchPayload, "quantityReceived" | "farmerPricePerUnit"> & {
  quantityReceived: string;
  farmerPricePerUnit: string;
};

// FarmerForm validates the required profile fields before calling the backend.
export function FarmerForm({
  initial,
  onSubmit,
}: {
  initial?: Farmer | null;
  onSubmit: (payload: FarmerPayload, active: boolean) => Promise<void>;
}) {
  const isAddMode = !initial;
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
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
        <label className="mt-4 flex items-center gap-2 text-sm font-bold">
          <input
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            type="checkbox"
          />
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
      await onSubmit({
        ...form,
        latitude: optionalNumber(form.latitude),
        longitude: optionalNumber(form.longitude),
        altitudeMeters: optionalNumber(form.altitudeMeters),
        sizeAcres,
      });
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
          <TextField
            label="Farming Type"
            required
            value={form.farmingType}
            onChange={(farmingType) => setForm({ ...form, farmingType })}
            help="Example: NATURAL_FARMING"
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

// BatchForm guides the operator through farmer -> farm -> batch creation.
export function BatchForm({
  cropOptions,
  farms,
  farmers,
  initial,
  lockedFarmId,
  lockedFarmerId,
  onSubmit,
  varietyOptions,
}: {
  cropOptions?: string[];
  farms: Farm[];
  farmers: Farmer[];
  initial?: Batch | null;
  lockedFarmId?: string | null;
  lockedFarmerId?: string | null;
  onSubmit: (payload: BatchPayload) => Promise<void>;
  varietyOptions?: string[];
}) {
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<SubmitState>({});
  const [form, setForm] = useState<BatchFormState>({
    cropName: initial?.cropName ?? "",
    farmId: initial?.farmId ?? lockedFarmId ?? "",
    farmerId: initial?.farmerId ?? lockedFarmerId ?? "",
    harvestDate: initial?.harvestDate ?? today(),
    receivedDate: initial?.receivedDate ?? today(),
    quantityReceived: initial?.quantityReceived == null ? "" : String(initial.quantityReceived),
    farmerPricePerUnit:
      initial?.farmerPricePerUnit == null ? "" : String(initial.farmerPricePerUnit),
    paymentStatus: initial?.paymentStatus ?? "UNPAID",
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

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState({});
    if (
      !form.farmerId ||
      !form.farmId ||
      !form.cropName ||
      !form.unit ||
      !form.harvestDate ||
      !form.receivedDate ||
      !form.status
    ) {
      setState({ error: "Please fill all required batch fields." });
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
        ...form,
        quantityReceived,
        farmerPricePerUnit,
        variety: form.variety || null,
      });
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
            label="Quantity Received"
            required
            type="number"
            placeholder="Quantity Received"
            value={form.quantityReceived}
            onChange={(quantityReceived) => setForm({ ...form, quantityReceived })}
          />
          <TextField
            label="Unit"
            required
            value={form.unit}
            onChange={(unit) => setForm({ ...form, unit })}
          />
          <Field label="Status" required>
            <select
              className={inputClass}
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            >
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
            <select
              className={inputClass}
              disabled={Boolean(lockedFarmerId)}
              value={form.farmerId}
              onChange={(event) => setForm({ ...form, farmerId: event.target.value, farmId: "" })}
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
              value={form.farmId}
              onChange={(event) => setForm({ ...form, farmId: event.target.value })}
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
      </Card>
      <Card>
        <h2 className="text-xl font-black">Receiving & Pricing</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField
            label="Harvest Date"
            required
            type="date"
            value={form.harvestDate}
            onChange={(harvestDate) => setForm({ ...form, harvestDate })}
          />
          <TextField
            label="Received Date"
            required
            type="date"
            value={form.receivedDate}
            onChange={(receivedDate) => setForm({ ...form, receivedDate })}
          />
          <TextField
            label="Farmer Price Per Unit"
            required
            type="number"
            placeholder="Farmer Price Per Unit"
            value={form.farmerPricePerUnit}
            onChange={(farmerPricePerUnit) => setForm({ ...form, farmerPricePerUnit })}
          />
          <Field label="Payment Status" required>
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

function optionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isNonNegative(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}
