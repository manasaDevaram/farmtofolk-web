import type {
  Batch,
  BatchPayload,
  BatchWithRelations,
  Farm,
  Farmer,
  FarmerPayload,
  FarmMedia,
  FarmPayload,
  FarmVerification,
  FarmWithFarmer,
  PriceBreakdown,
  PriceBreakdownPayload,
  QrCode,
  TraceEvent,
  TraceEventPayload,
  VerificationPayload,
} from "@/types/admin";

const DEFAULT_API_BASE_URL = "http://localhost:8080";

// Resolve the Spring Boot API host from env so local and deployed builds can differ.
function baseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
    DEFAULT_API_BASE_URL
  );
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  options: { optional404?: boolean } = {},
): Promise<T> {
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers:
      init.body instanceof FormData
        ? init.headers
        : { "Content-Type": "application/json", ...init.headers },
  });

  if (options.optional404 && response.status === 404) {
    return null as T;
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = (await response.json()) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      // Keep status-based fallback.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const asJson = (body: unknown) => JSON.stringify(body);

// Farmer APIs cover profile CRUD plus active/inactive status changes.
export const farmerApi = {
  create: (payload: FarmerPayload) =>
    request<Farmer>("/api/farmers", { body: asJson(payload), method: "POST" }),
  get: (farmerId: string) => request<Farmer>(`/api/farmers/${farmerId}`),
  list: () => request<Farmer[]>("/api/farmers"),
  update: (farmerId: string, payload: FarmerPayload) =>
    request<Farmer>(`/api/farmers/${farmerId}`, {
      body: asJson(payload),
      method: "PUT",
    }),
  updateStatus: (farmerId: string, active: boolean) =>
    request<Farmer>(`/api/farmers/${farmerId}/status`, {
      body: asJson({ active }),
      method: "PATCH",
    }),
};

// Farm APIs are scoped around farmers because the backend does not expose GET /api/farms.
export const farmApi = {
  create: (payload: FarmPayload) =>
    request<Farm>("/api/farms", { body: asJson(payload), method: "POST" }),
  get: (farmId: string) => request<Farm>(`/api/farms/${farmId}`),
  listByFarmer: (farmerId: string) =>
    request<Farm[]>(`/api/farmers/${farmerId}/farms`),
  update: (farmId: string, payload: FarmPayload) =>
    request<Farm>(`/api/farms/${farmId}`, {
      body: asJson(payload),
      method: "PUT",
    }),
};

// Batch APIs support create, edit, and farmer/farm scoped batch lookup.
export const batchApi = {
  create: (payload: BatchPayload) =>
    request<Batch>("/api/batches", { body: asJson(payload), method: "POST" }),
  get: (batchId: string) => request<Batch>(`/api/batches/${batchId}`),
  listByFarm: (farmId: string) => request<Batch[]>(`/api/farms/${farmId}/batches`),
  listByFarmer: (farmerId: string) =>
    request<Batch[]>(`/api/farmers/${farmerId}/batches`),
  update: (batchId: string, payload: BatchPayload) =>
    request<Batch>(`/api/batches/${batchId}`, {
      body: asJson(payload),
      method: "PUT",
    }),
};

// Farm media APIs handle gallery upload, listing, and deletion.
export const mediaApi = {
  delete: (mediaId: string) =>
    request<void>(`/api/farm-media/${mediaId}`, { method: "DELETE" }),
  list: (farmId: string) => request<FarmMedia[]>(`/api/farms/${farmId}/media`),
  upload: (farmId: string, file: File, caption: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (caption.trim()) formData.append("caption", caption.trim());
    return request<FarmMedia>(`/api/farms/${farmId}/media/upload`, {
      body: formData,
      method: "POST",
    });
  },
};

// Verification APIs manage field-verification records for a farm.
export const verificationApi = {
  create: (farmId: string, payload: VerificationPayload) =>
    request<FarmVerification>(`/api/farms/${farmId}/verifications`, {
      body: asJson(payload),
      method: "POST",
    }),
  latest: (farmId: string) =>
    request<FarmVerification | null>(
      `/api/farms/${farmId}/latest-verification`,
      {},
      { optional404: true },
    ),
  list: (farmId: string) =>
    request<FarmVerification[]>(`/api/farms/${farmId}/verifications`),
};

// Trace event APIs build the customer-visible batch journey.
export const traceEventApi = {
  create: (batchId: string, payload: TraceEventPayload) =>
    request<TraceEvent>(`/api/batches/${batchId}/trace-events`, {
      body: asJson(payload),
      method: "POST",
    }),
  list: (batchId: string) =>
    request<TraceEvent[]>(`/api/batches/${batchId}/trace-events`),
};

// Price APIs support add/update because each batch has one transparent breakdown.
export const priceApi = {
  create: (batchId: string, payload: PriceBreakdownPayload) =>
    request<PriceBreakdown>(`/api/batches/${batchId}/price-breakdown`, {
      body: asJson(payload),
      method: "POST",
    }),
  get: (batchId: string) =>
    request<PriceBreakdown | null>(
      `/api/batches/${batchId}/price-breakdown`,
      {},
      { optional404: true },
    ),
  update: (batchId: string, payload: PriceBreakdownPayload) =>
    request<PriceBreakdown>(`/api/batches/${batchId}/price-breakdown`, {
      body: asJson(payload),
      method: "PUT",
    }),
};

// QR APIs generate and fetch the public trace token for a batch.
export const qrApi = {
  create: (batchId: string) =>
    request<QrCode>(`/api/batches/${batchId}/qr-code`, { method: "POST" }),
  get: (batchId: string) =>
    request<QrCode | null>(
      `/api/batches/${batchId}/qr-code`,
      {},
      { optional404: true },
    ),
};

// Aggregate all farms by loading every farmer's farms.
export async function listAllFarms(): Promise<FarmWithFarmer[]> {
  const farmers = await farmerApi.list();
  const farms = await Promise.all(
    farmers.map(async (farmer) => {
      try {
        return (await farmApi.listByFarmer(farmer.id)).map((farm) => ({
          ...farm,
          farmer,
        }));
      } catch {
        return [];
      }
    }),
  );
  return farms.flat();
}

// Aggregate all batches by loading every farmer's batches and joining known farm/farmer names.
export async function listAllBatches(): Promise<BatchWithRelations[]> {
  const [farmers, farms] = await Promise.all([farmerApi.list(), listAllFarms()]);
  const farmerMap = new Map(farmers.map((farmer) => [farmer.id, farmer]));
  const farmMap = new Map(farms.map((farm) => [farm.id, farm]));
  const byId = new Map<string, BatchWithRelations>();

  await Promise.all(
    farmers.map(async (farmer) => {
      try {
        const batches = await batchApi.listByFarmer(farmer.id);
        batches.forEach((batch) => {
          byId.set(batch.id, {
            ...batch,
            farm: farmMap.get(batch.farmId),
            farmer: farmerMap.get(batch.farmerId),
          });
        });
      } catch {
        // Keep loading other farmers.
      }
    }),
  );

  return [...byId.values()];
}
