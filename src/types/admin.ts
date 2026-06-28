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

export type DashboardSummary = {
  totalFarmers: number;
  activeFarmers: number;
  totalFarms: number;
  totalBatches: number;
  pendingPaymentsAmount: number;
  pendingPaymentBatchCount: number;
  recentVerifications: number | FarmVerification[];
  totalQrCodes: number;
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

export type FarmerPayload = Omit<
  Farmer,
  "id" | "active" | "createdAt" | "updatedAt"
>;

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

export type Batch = {
  id: string;
  batchCode: string;
  farmId: string;
  farmerId: string;
  cropName: string;
  variety: Nullable<string>;
  quantity: number;
  unit: string;
  harvestDate: string;
  packedDate: Nullable<string>;
  bestBeforeDate: Nullable<string>;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type BatchPayload = Omit<Batch, "id" | "createdAt" | "updatedAt">;

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

export type TraceEventPayload = Omit<
  TraceEvent,
  "id" | "batchId" | "createdAt"
>;

export type PriceBreakdown = {
  id: string;
  batchId: string;
  consumerPrice: number;
  farmerPrice: number;
  transportCost: Nullable<number>;
  packingCost: Nullable<number>;
  organizationCost: Nullable<number>;
  platformCost: Nullable<number>;
  currency: string;
  priceUnit: string;
  createdAt: string;
  updatedAt: string;
};

export type PriceBreakdownPayload = Omit<
  PriceBreakdown,
  "id" | "batchId" | "createdAt" | "updatedAt"
>;

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

export type FarmWithFarmer = Farm & { farmer?: Farmer; farmerName?: string };
export type BatchWithRelations = Batch & {
  farmer?: Farmer;
  farm?: Farm;
  farmerName?: string;
  farmName?: string;
};
export type FarmListItem = Farm & { farmerName?: string };
export type BatchListItem = Batch & { farmerName?: string; farmName?: string };
