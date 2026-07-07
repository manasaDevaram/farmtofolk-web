export type Nullable<T> = T | null;

export type PublicTraceMediaType = "IMAGE" | "VIDEO" | "image" | "video" | string;

export interface PublicTraceQrCode {
  id: string;
  batchId: string;
  publicToken: string;
  qrImageUrl: Nullable<string>;
  qrType: string;
  isActive: boolean;
  generatedAt: string;
  expiresAt: Nullable<string>;
}

export interface PublicTraceBatch {
  id: string;
  batchCode: string;
  cropName: string;
  variety: string;
  quantityReceived: number;
  unit: string;
  harvestDate: string;
  receivedDate: string;
  farmerPricePerUnit: number;
  consumerPricePerUnit: number;
  operationalCostPerUnit?: number;
  farmToConsumerCostPerUnit?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicTraceFarmer {
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
}

export interface PublicTraceFarm {
  id: string;
  farmerId: string;
  farmName: string;
  village: string;
  district: string;
  state: string;
  latitude: Nullable<number>;
  longitude: Nullable<number>;
  altitudeMeters: Nullable<number>;
  sizeAcres: Nullable<number>;
  farmingType: Nullable<string>;
  createdAt: string;
  updatedAt: string;
}

export interface PublicTraceVerification {
  id: string;
  farmId: string;
  verificationDate: string;
  verifiedByUserId: Nullable<string>;
  verificationType: Nullable<string>;
  status: Nullable<string>;
  chemicalFreeClaim: Nullable<boolean>;
  agroecologyVerified: Nullable<boolean>;
  checklistJson: Nullable<string>;
  observations: Nullable<string>;
  nextVerificationDue: Nullable<string>;
  createdAt: string;
  updatedAt: string;
}

export interface PublicTraceVerificationEvidence {
  id: string;
  verificationId: string;
  fileType: PublicTraceMediaType;
  fileUrl: string;
  fileHash: Nullable<string>;
  caption: Nullable<string>;
  isPublic: boolean;
  capturedAt: Nullable<string>;
  uploadedByUserId: Nullable<string>;
  createdAt: string;
}

export interface PublicTraceFarmMedia {
  id: string;
  farmId: string;
  mediaType: PublicTraceMediaType;
  mediaUrl: string;
  caption: Nullable<string>;
  isPublic: boolean;
  createdAt: string;
}

export type PublicTraceMedia = PublicTraceFarmMedia | PublicTraceVerificationEvidence;

export interface PublicTraceEvent {
  id: string;
  batchId: string;
  eventType: string;
  eventTime: string;
  location: Nullable<string>;
  description: Nullable<string>;
  actorUserId: Nullable<string>;
  metadataJson: Nullable<string>;
  createdAt: string;
}

export interface PublicTraceResponse {
  qrCode: PublicTraceQrCode;
  batch: PublicTraceBatch;
  farmer: PublicTraceFarmer;
  farm: PublicTraceFarm;
  priceBreakdown?: Nullable<{
    consumerPrice: number;
    farmerPrice: number;
    wastageCost: number;
    packagingCost: number;
    operationalCost: number;
    margin: number;
    currency: string;
    priceUnit: string;
  }>;
  latestVerification: Nullable<PublicTraceVerification>;
  verificationEvidence: PublicTraceVerificationEvidence[];
  farmMedia: PublicTraceFarmMedia[];
  traceEvents: PublicTraceEvent[];
}
