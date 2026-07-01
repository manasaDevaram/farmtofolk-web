import { API_BASE_URL } from "@/lib/api-config";
import { clearSession, getSessionToken } from "@/lib/auth-session";
import type {
  Batch,
  BatchPayload,
  BatchWithRelations,
  BatchUsage,
  CreateBatchUsagePayload,
  CreateBatchWastePayload,
  Farm,
  Farmer,
  FarmerPayload,
  FarmMedia,
  FarmPayload,
  FarmListItem,
  FarmVerification,
  FarmWithFarmer,
  QrCode,
  TraceEvent,
  TraceEventPayload,
  VerificationEvidence,
  VerificationPayload,
  BatchListItem,
  CreateInternalUserRequest,
  AdminDashboardResponse,
  FarmerDashboardSummaryResponse,
  InternalUserResponse,
  LoginResponse,
  UpdateInternalUserRequest,
  UpdateInternalUserRoleRequest,
  UpdateUserStatusRequest,
} from "@/types/admin";

async function request<T>(
  path: string,
  init: RequestInit = {},
  options: { optional404?: boolean; publicRequest?: boolean } = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  let response: Response;

  try {
    const headers = new Headers(init.headers);
    const token = getSessionToken();

    if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    response = await fetch(url, {
      ...init,
      headers,
    });
  } catch (error) {
    console.error("Admin API network error", { error, url });
    throw new Error("Backend unavailable. Please make sure the API server is running.");
  }

  if (options.optional404 && response.status === 404) {
    return null as T;
  }

  const message = response.ok ? "" : await readErrorMessage(response);

  if (response.status === 401 && !options.publicRequest) {
    clearSession();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
    throw new Error(message || "Your session has expired. Please sign in again.");
  }

  if (response.status === 403) {
    throw new Error(message || "Access denied");
  }

  if (!response.ok) {
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const asJson = (body: unknown) => JSON.stringify(body);

async function readErrorMessage(response: Response) {
  const fallback = `Request failed with status ${response.status}`;
  const rawBody = await response.text();
  if (!rawBody.trim()) return fallback;

  try {
    const body = JSON.parse(rawBody) as {
      detail?: string;
      error?: string;
      errors?: unknown;
      message?: string;
      title?: string;
    };
    const directMessage = body.message ?? body.detail ?? body.error ?? body.title;
    if (directMessage) return directMessage;

    if (Array.isArray(body.errors)) {
      const messages = body.errors
        .map((error) => {
          if (typeof error === "string") return error;
          if (error && typeof error === "object") {
            const value = error as { defaultMessage?: string; message?: string };
            return value.defaultMessage ?? value.message;
          }
          return undefined;
        })
        .filter(Boolean);
      if (messages.length) return messages.join(". ");
    }

    if (body.errors && typeof body.errors === "object") {
      const messages = Object.values(body.errors)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value): value is string => typeof value === "string");
      if (messages.length) return messages.join(". ");
    }
  } catch {
    if (!rawBody.trimStart().startsWith("<")) return rawBody.trim();
  }

  return fallback;
}

export const authApi = {
  login: (emailOrPhone: string, password: string) =>
    request<LoginResponse>(
      "/api/auth/login",
      {
        body: asJson({ emailOrPhone, password }),
        method: "POST",
      },
      { publicRequest: true },
    ),
};

export const dashboardApi = {
  summary: () =>
    request<AdminDashboardResponse>("/api/admin/dashboard", {
      cache: "no-store",
    }),
  pendingPayments: () => request<Batch[]>("/api/admin/dashboard/pending-payments"),
  pendingVerifications: () =>
    request<FarmVerification[]>("/api/admin/dashboard/pending-verifications"),
  upcomingVerifications: () =>
    request<FarmVerification[]>("/api/admin/dashboard/upcoming-verifications"),
  batchInventory: () => request<Batch[]>("/api/admin/dashboard/batch-inventory"),
  highWastageBatches: () => request<Batch[]>("/api/admin/dashboard/high-wastage-batches"),
};

export const adminUserApi = {
  create: (payload: CreateInternalUserRequest) =>
    request<InternalUserResponse>("/api/admin/users", {
      body: asJson(payload),
      method: "POST",
    }),
  get: (userId: string) => request<InternalUserResponse>(`/api/admin/users/${userId}`),
  list: () => request<InternalUserResponse[]>("/api/admin/users"),
  update: (userId: string, payload: UpdateInternalUserRequest) =>
    request<InternalUserResponse>(`/api/admin/users/${userId}`, {
      body: asJson(payload),
      method: "PATCH",
    }),
  updateRole: (userId: string, payload: UpdateInternalUserRoleRequest) =>
    request<InternalUserResponse>(`/api/admin/users/${userId}/role`, {
      body: asJson(payload),
      method: "PATCH",
    }),
  updateStatus: (userId: string, payload: UpdateUserStatusRequest) =>
    request<InternalUserResponse>(`/api/admin/users/${userId}/status`, {
      body: asJson(payload),
      method: "PATCH",
    }),
};

export const internalUserApi = adminUserApi;

export const farmerDashboardApi = {
  summary: () =>
    request<FarmerDashboardSummaryResponse>("/api/farmer-dashboard/me", {
      cache: "no-store",
    }),
};

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
  uploadIntroVideo: (farmerId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<Farmer>(`/api/farmers/${farmerId}/intro-video/upload`, {
      body: formData,
      method: "POST",
    });
  },
  uploadProfilePhoto: (farmerId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<Farmer>(`/api/farmers/${farmerId}/profile-photo/upload`, {
      body: formData,
      method: "POST",
    });
  },
};

// Farm APIs cover both global farm lookup and farmer-scoped farm lookup.
export const farmApi = {
  create: (payload: FarmPayload) =>
    request<Farm>("/api/farms", { body: asJson(payload), method: "POST" }),
  get: (farmId: string) => request<Farm>(`/api/farms/${farmId}`),
  list: () => request<FarmListItem[]>("/api/farms"),
  listByFarmer: (farmerId: string) => request<Farm[]>(`/api/farmers/${farmerId}/farms`),
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
  list: () => request<BatchListItem[]>("/api/batches"),
  listByFarm: (farmId: string) => request<Batch[]>(`/api/farms/${farmId}/batches`),
  listByFarmer: (farmerId: string) => request<Batch[]>(`/api/farmers/${farmerId}/batches`),
  update: (batchId: string, payload: BatchPayload) =>
    request<Batch>(`/api/batches/${batchId}`, {
      body: asJson(payload),
      method: "PUT",
    }),
};

export const batchUsageApi = {
  list: (batchId: string) => request<BatchUsage[]>(`/api/batches/${batchId}/usage`),
  create: (batchId: string, payload: CreateBatchUsagePayload) =>
    request<BatchUsage>(`/api/batches/${batchId}/usage`, {
      body: asJson(payload),
      method: "POST",
    }),
  waste: (batchId: string, payload: CreateBatchWastePayload) =>
    request<BatchUsage>(`/api/batches/${batchId}/waste`, {
      body: asJson(payload),
      method: "POST",
    }),
};

// Farm media APIs handle gallery upload, listing, and deletion.
export const mediaApi = {
  delete: (mediaId: string) => request<void>(`/api/farm-media/${mediaId}`, { method: "DELETE" }),
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

export const evidenceApi = {
  delete: (evidenceId: string) =>
    request<void>(`/api/evidence/${evidenceId}`, { method: "DELETE" }),
  list: (verificationId: string) =>
    request<VerificationEvidence[]>(`/api/verifications/${verificationId}/evidence`),
  upload: (verificationId: string, file: File, caption: string, isPublic: boolean) => {
    const formData = new FormData();
    formData.append("file", file);
    if (caption.trim()) formData.append("caption", caption.trim());
    formData.append("isPublic", String(isPublic));
    return request<VerificationEvidence>(`/api/verifications/${verificationId}/evidence/upload`, {
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
  list: (farmId: string) => request<FarmVerification[]>(`/api/farms/${farmId}/verifications`),
};

// Trace event APIs build the customer-visible batch journey.
export const traceEventApi = {
  create: (batchId: string, payload: TraceEventPayload) =>
    request<TraceEvent>(`/api/batches/${batchId}/trace-events`, {
      body: asJson(payload),
      method: "POST",
    }),
  list: (batchId: string) => request<TraceEvent[]>(`/api/batches/${batchId}/trace-events`),
};

// QR APIs generate and fetch the public trace token for a batch.
export const qrApi = {
  create: (batchId: string) =>
    request<QrCode>(`/api/batches/${batchId}/qr-code`, { method: "POST" }),
  get: (batchId: string) =>
    request<QrCode | null>(`/api/batches/${batchId}/qr-code`, {}, { optional404: true }),
};

// Aggregate all farms with farmer details for friendly admin lists.
export async function listAllFarms(): Promise<FarmWithFarmer[]> {
  const [farmers, farms] = await Promise.all([farmerApi.list(), farmApi.list()]);
  const farmerMap = new Map(farmers.map((farmer) => [farmer.id, farmer]));
  return farms.map((farm) => ({ ...farm, farmer: farmerMap.get(farm.farmerId) }));
}

// Aggregate all batches with farmer and farm names for friendly admin lists.
export async function listAllBatches(): Promise<BatchWithRelations[]> {
  const [farmers, farms, batches] = await Promise.all([
    farmerApi.list(),
    listAllFarms(),
    batchApi.list(),
  ]);
  const farmerMap = new Map(farmers.map((farmer) => [farmer.id, farmer]));
  const farmMap = new Map(farms.map((farm) => [farm.id, farm]));
  return batches.map((batch) => ({
    ...batch,
    farm: farmMap.get(batch.farmId),
    farmer: farmerMap.get(batch.farmerId),
  }));
}
