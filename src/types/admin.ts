export type Nullable<T> = T | null;

export type UserRole = "ADMIN" | "FIELD_OFFICER" | "FARMER";

export type UserAccount = {
  id: string;
  name: string;
  email: Nullable<string>;
  phone: Nullable<string>;
  role: UserRole;
  gender: Nullable<string>;
  address: Nullable<string>;
  active: boolean;
};

export type LoginResponse = {
  token: string;
  user: UserAccount;
};

export type InternalUserRole = "ADMIN" | "FIELD_OFFICER";

export type InternalUserResponse = {
  id: string;
  name: string;
  email: Nullable<string>;
  phone: Nullable<string>;
  role: UserRole;
  active: boolean;
};

export type CreateInternalUserRequest = {
  name: string;
  email: string;
  phone: string;
  role: InternalUserRole;
  active?: boolean;
  initialPassword: string;
};

export type UpdateInternalUserRequest = {
  name?: string;
  email?: string;
  phone?: string;
  active?: boolean;
};

export type UpdateInternalUserRoleRequest = { role: InternalUserRole };

export type UpdateUserStatusRequest = { active: boolean };

export type AdminDashboardResponse = {
  payments: { pendingAmount: number; pendingCount: number };
  verifications: { pendingCount: number; upcomingCount: number };
  inventory: {
    totalAvailableQuantity: number;
    totalSoldQuantity: number;
    totalWastedQuantity: number;
  };
  secondaryCounts: { farmers: number; farms: number; batches: number };
};

export type Farmer = {
  id: string;
  farmerCode: string;
  name: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  bio: Nullable<string>;
  profilePhotoUrl: Nullable<string>;
  introVideoUrl: Nullable<string>;
  joinedDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FarmerPayload = Omit<Farmer, "id" | "active" | "createdAt" | "updatedAt">;

export type FarmerDashboardSummaryResponse = {
  farmer: FarmerResponse;
  farms: FarmerDashboardFarmResponse[];
};

export type FarmerDashboardFarmResponse = {
  farm: FarmResponse;
  batches: FarmerDashboardWorkBatchResponse[];
};

export type FarmerDashboardWorkBatchResponse = {
  batchId: string;
  batchCode: string;
  cropName: string;
  currentTraceStatus?: Nullable<string>;
  batchStatus: Nullable<string>;
  harvestDate: Nullable<string>;
  quantityReceived: Nullable<number>;
  quantitySold: Nullable<number>;
  quantityWasted: Nullable<number>;
  quantityUsedInProduct: Nullable<number>;
  quantityAvailable: Nullable<number>;
  farmerPricePerUnit: Nullable<number>;
  totalFarmerAmount: Nullable<number>;
  paymentStatus: Nullable<string>;
  consumerPricePerUnit: Nullable<number>;
  lastUpdated?: Nullable<string>;
};

export type Farm = {
  id: string;
  farmerId: string;
  farmName: string;
  village: string;
  district: string;
  state: string;
  latitude: Nullable<number>;
  longitude: Nullable<number>;
  sizeAcres: Nullable<number>;
  farmingType: string;
  createdAt: string;
  updatedAt: string;
};

export type FarmPayload = Omit<Farm, "id" | "createdAt" | "updatedAt">;

export type FarmerResponse = Farmer;
export type FarmResponse = Farm;

export type Batch = {
  id: string;
  batchCode: string;
  farmId: string;
  farmerId: string;
  cropName: string;
  variety: Nullable<string>;
  quantityReceived: number;
  quantitySold: number;
  quantityWasted: number;
  quantityUsedInProduct: number;
  quantityAvailable: number;
  unit: string;
  harvestDate: string;
  receivedDate: string;
  farmerPricePerUnit: number;
  totalFarmerAmount: number;
  paymentStatus: string;
  consumerPricePerUnit: number;
  operationalCostPerUnit: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type BatchPayload = {
  batchCode?: string;
  farmerId: string;
  farmId: string;
  cropName: string;
  variety: Nullable<string>;
  quantityReceived: number;
  unit: string;
  harvestDate: string;
  receivedDate: string;
  farmerPricePerUnit: number;
  paymentStatus: string;
  consumerPricePerUnit: number;
  operationalCostPerUnit: number;
  status: string;
};

export type BatchUsageType =
  "SOLD_ONLINE" | "SOLD_OFFLINE" | "CAFE" | "EXPERIENCE_CENTRE" | "USED_IN_PRODUCT" | "WASTED";

export type BatchUsage = {
  id: string;
  batchId: string;
  usageType: BatchUsageType;
  quantity: number;
  pricePerUnit: Nullable<number>;
  customerName: Nullable<string>;
  customerType: Nullable<string>;
  reason: Nullable<string>;
  notes: Nullable<string>;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateBatchUsagePayload = {
  usageType: BatchUsageType;
  quantity: number;
  pricePerUnit?: Nullable<number>;
  customerName?: Nullable<string>;
  customerType?: Nullable<string>;
  reason?: Nullable<string>;
  notes?: Nullable<string>;
  recordedAt?: Nullable<string>;
};

export type CreateBatchWastePayload = Pick<
  CreateBatchUsagePayload,
  "quantity" | "reason" | "notes" | "recordedAt"
>;

export type FarmMedia = {
  id: string;
  farmId: string;
  mediaType: string;
  mediaUrl: string;
  fileKey?: Nullable<string>;
  contentType?: Nullable<string>;
  sizeBytes?: Nullable<number>;
  caption: Nullable<string>;
  isPublic: boolean;
  createdAt: string;
};

export type VerificationEvidence = {
  id: string;
  verificationId: string;
  fileType: string;
  fileUrl: string;
  fileKey?: Nullable<string>;
  fileHash?: Nullable<string>;
  contentType?: Nullable<string>;
  sizeBytes?: Nullable<number>;
  caption: Nullable<string>;
  isPublic: boolean;
  capturedAt: Nullable<string>;
  uploadedByUserId: Nullable<string>;
  createdAt: string;
};

export type FarmVerification = {
  id: string;
  farmId: string;
  verificationDate: string;
  verifiedByUserId: Nullable<string>;
  verificationType: string;
  status: string;
  chemicalFreeClaim: Nullable<boolean>;
  agroecologyVerified: Nullable<boolean>;
  checklistJson: Nullable<string>;
  observations: Nullable<string>;
  nextVerificationDue: Nullable<string>;
  createdAt: string;
  updatedAt: string;
};

export type VerificationPayload = Omit<
  FarmVerification,
  "id" | "farmId" | "createdAt" | "updatedAt"
>;

export type TraceEvent = {
  id: string;
  batchId: string;
  eventType: string;
  eventTime: string;
  location: Nullable<string>;
  description: Nullable<string>;
  actorUserId: Nullable<string>;
  metadataJson: Nullable<string>;
  createdAt: string;
};

export type TraceEventPayload = Omit<TraceEvent, "id" | "batchId" | "createdAt">;

export type QrCode = {
  id: string;
  batchId: string;
  publicToken: string;
  qrImageUrl: Nullable<string>;
  qrType: string;
  isActive: boolean;
  generatedAt: string;
  expiresAt: Nullable<string>;
};

export type PriceBreakdown = {
  id: string;
  batchId: string;
  consumerPrice: number;
  farmerPrice: number;
  wastageCost: number;
  packagingCost: number;
  operationalCost: number;
  margin: number;
  currency: string;
  priceUnit: string;
  createdAt: string;
  updatedAt: string;
};

export type PriceBreakdownPayload = Pick<
  PriceBreakdown,
  | "consumerPrice"
  | "farmerPrice"
  | "wastageCost"
  | "packagingCost"
  | "operationalCost"
  | "currency"
  | "priceUnit"
>;

export type FarmWithFarmer = Farm & { farmer?: Farmer; farmerName?: string };
export type BatchWithRelations = Batch & {
  farmer?: Farmer;
  farm?: Farm;
  farmerName?: string;
  farmName?: string;
};
export type FarmListItem = Farm & { farmerName?: string };
export type BatchListItem = Batch & { farmerName?: string; farmName?: string };

export type DashboardVerificationItem = FarmVerification & {
  farmName?: string;
  farmerName?: string;
  farmVillage?: string;
  village?: string;
  district?: string;
  state?: string;
  location?: string;
  officerName?: string;
  assignedOfficerName?: string;
  verifiedByUserName?: string;
  scheduledDate?: Nullable<string>;
};
