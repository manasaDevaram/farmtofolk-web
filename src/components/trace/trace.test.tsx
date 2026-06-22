import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PublicTracePage from "@/app/trace/[publicToken]/page";
import { ErrorState } from "./ErrorState";
import { FarmMediaCard } from "./FarmMediaCard";
import { FarmerCard } from "./FarmerCard";
import { MoneyBreakdownCard } from "./MoneyBreakdownCard";
import { ProductDetailsCard } from "./ProductDetailsCard";
import { TrustSummaryCard } from "./TrustSummaryCard";
import { VerificationCard } from "./VerificationCard";
import { getPublicTrace } from "@/lib/api";
import type { PublicTraceResponse } from "@/types/public-trace";

vi.mock("@/lib/api", () => ({
  getPublicTrace: vi.fn(async () => sampleTrace),
}));

const sampleTrace: PublicTraceResponse = {
  batch: {
    bestBeforeDate: "2026-06-30",
    batchCode: "BATCH-001",
    cropName: "Tomatoes",
    createdAt: "2026-06-20T00:00:00Z",
    farmId: "farm-1",
    farmerId: "farmer-1",
    harvestDate: "2026-06-20",
    id: "batch-1",
    packedDate: "2026-06-21",
    quantity: 120,
    status: "READY",
    unit: "kg",
    updatedAt: "2026-06-21T00:00:00Z",
    variety: "Desi Hybrid",
  },
  farmer: {
    active: true,
    bio: "Ramesh has been practicing natural farming for over 12 years.",
    createdAt: "2026-01-01T00:00:00Z",
    district: "Mysore",
    farmerCode: "FARM-0007",
    id: "farmer-1",
    introVideoUrl: null,
    joinedDate: "2026-01-01",
    name: "Ramesh Gowda",
    phone: "+919876543210",
    profilePhotoUrl: null,
    state: "Karnataka",
    updatedAt: "2026-06-01T00:00:00Z",
    village: "Nanjangud",
  },
  farm: {
    createdAt: "2026-01-01T00:00:00Z",
    district: "Mysore",
    farmName: "Sanjeevini Natural Farm",
    farmerId: "farmer-1",
    farmingType: "NATURAL_FARMING",
    id: "farm-1",
    latitude: null,
    longitude: null,
    sizeAcres: 3,
    state: "Karnataka",
    updatedAt: "2026-06-01T00:00:00Z",
    village: "Nanjangud",
  },
  farmMedia: [],
  latestVerification: {
    agroecologyVerified: true,
    chemicalFreeClaim: true,
    checklistJson: JSON.stringify({ noSyntheticPesticides: true }),
    createdAt: "2026-05-17T00:00:00Z",
    farmId: "farm-1",
    id: "verification-1",
    nextVerificationDue: "2026-11-17",
    status: "VERIFIED",
    updatedAt: "2026-05-17T00:00:00Z",
    verificationType: "FIELD_VISIT",
    verificationDate: "2026-05-17",
    verifiedByUserId: null,
    observations: "Farm practices are in line with agroecological principles.",
  },
  priceBreakdown: {
    batchId: "batch-1",
    consumerPrice: 80,
    createdAt: "2026-06-21T00:00:00Z",
    currency: "INR",
    farmerPrice: 52,
    id: "price-1",
    organizationCost: 5,
    packingCost: 8,
    platformCost: 5,
    priceUnit: "kg",
    transportCost: 10,
    updatedAt: "2026-06-21T00:00:00Z",
  },
  qrCode: {
    batchId: "batch-1",
    expiresAt: null,
    generatedAt: "2026-06-21T00:00:00Z",
    id: "qr-1",
    isActive: true,
    publicToken: "token-123",
    qrImageUrl: null,
    qrType: "PUBLIC_TRACE",
  },
  scanCount: 12,
  traceEvents: [],
  verificationEvidence: [],
};

describe("public trace page", () => {
  it("renders product title", async () => {
    const Page = await PublicTracePage({
      params: Promise.resolve({ publicToken: "token-123" }),
    });

    render(Page);

    expect(
      screen.getByRole("heading", { name: /Organic Tomatoes/i }),
    ).toBeInTheDocument();
    expect(getPublicTrace).toHaveBeenCalledWith("token-123");
  });

  it("renders without scan analytics when backend omits scanCount", async () => {
    vi.mocked(getPublicTrace).mockResolvedValueOnce({
      ...sampleTrace,
      scanCount: undefined as unknown as number,
    });

    const Page = await PublicTracePage({
      params: Promise.resolve({ publicToken: "token-without-count" }),
    });

    render(Page);

    expect(
      screen.getByRole("heading", { name: /Organic Tomatoes/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Scanned/i)).not.toBeInTheDocument();
  });

  it("renders farmer card summary", () => {
    render(<FarmerCard farmer={sampleTrace.farmer} />);

    expect(screen.getByText("Ramesh Gowda")).toBeInTheDocument();
    expect(screen.getByText(/Mysore, Karnataka/i)).toBeInTheDocument();
  });

  it("opens farmer accordion and shows bio", async () => {
    render(<FarmerCard farmer={sampleTrace.farmer} />);

    fireEvent.click(screen.getByRole("button", { name: /Farmer/i }));

    expect(
      screen.getByText(/practicing natural farming for over 12 years/i),
    ).toBeInTheDocument();
  });

  it("calculates farmer percentage correctly", () => {
    render(<MoneyBreakdownCard priceBreakdown={sampleTrace.priceBreakdown} />);

    expect(screen.getByText(/Farmer gets/i)).toHaveTextContent("65%");
  });

  it("shows N/A for money percentages when consumer price is missing", () => {
    render(
      <MoneyBreakdownCard
        priceBreakdown={{ ...sampleTrace.priceBreakdown, consumerPrice: 0 }}
      />,
    );

    expect(screen.getByText(/Farmer gets/i)).toHaveTextContent("N/A");
  });

  it("parses verification checklist JSON and renders observations", () => {
    render(
      <VerificationCard
        evidence={[
          {
            caption: "Public compost evidence",
            capturedAt: null,
            createdAt: "2026-05-17T00:00:00Z",
            fileHash: null,
            fileType: "IMAGE",
            fileUrl: "https://example.com/public.jpg",
            id: "evidence-1",
            isPublic: true,
            uploadedByUserId: null,
            verificationId: "verification-1",
          },
          {
            caption: "Private internal evidence",
            capturedAt: null,
            createdAt: "2026-05-17T00:00:00Z",
            fileHash: null,
            fileType: "IMAGE",
            fileUrl: "https://example.com/private.jpg",
            id: "evidence-2",
            isPublic: false,
            uploadedByUserId: null,
            verificationId: "verification-1",
          },
        ]}
        verification={{
          ...sampleTrace.latestVerification!,
          checklistJson: JSON.stringify({
            noSyntheticPesticides: true,
            waterConservation: true,
          }),
          observations: "No synthetic chemicals observed.",
        }}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Agroecology Verification/i }),
    );

    expect(screen.getByText("No Synthetic Pesticides")).toBeInTheDocument();
    expect(screen.getByText("Water Conservation")).toBeInTheDocument();
    expect(screen.getByText("No synthetic chemicals observed.")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Public compost evidence" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "Private internal evidence" }),
    ).not.toBeInTheDocument();
  });

  it("shows checklist fallback when checklist JSON is invalid", () => {
    render(
      <VerificationCard
        verification={{
          ...sampleTrace.latestVerification!,
          checklistJson: "{not-json",
        }}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Agroecology Verification/i }),
    );

    expect(screen.getByText("No checklist details available.")).toBeInTheDocument();
  });

  it("shows farm media preview count for hidden media", () => {
    render(
      <FarmMediaCard
        farmMedia={[1, 2, 3, 4, 5].map((item) => ({
          caption: `Farm media ${item}`,
          createdAt: "2026-06-01T00:00:00Z",
          farmId: "farm-1",
          id: `media-${item}`,
          isPublic: true,
          mediaType: "IMAGE",
          mediaUrl: `https://example.com/${item}.jpg`,
        }))}
      />,
    );

    expect(screen.getByText("+2")).toBeInTheDocument();
  });

  it("renders product details and trace events inside the accordion", () => {
    render(
      <ProductDetailsCard
        batch={sampleTrace.batch}
        traceEvents={[
          {
            actorUserId: null,
            batchId: "batch-1",
            createdAt: "2026-06-21T00:00:00Z",
            description: "Packed at collection center.",
            eventTime: "2026-06-21",
            eventType: "PACKED",
            id: "event-1",
            location: "Mysore",
            metadataJson: null,
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /About This Product/i }));

    expect(screen.getByText("Desi Hybrid")).toBeInTheDocument();
    expect(screen.getByText("Packed")).toBeInTheDocument();
    expect(screen.getByText("Packed at collection center.")).toBeInTheDocument();
    expect(screen.getByText("Mysore")).toBeInTheDocument();
  });

  it("renders trust badges without showing an arbitrary numeric score", () => {
    render(<TrustSummaryCard trace={sampleTrace} />);

    fireEvent.click(screen.getByRole("button", { name: /Trust Summary/i }));

    expect(screen.getByText("Farmer Verified")).toBeInTheDocument();
    expect(screen.getByText("Data Integrity Ready")).toBeInTheDocument();
    expect(screen.queryByText(/94\s*\/\s*100/)).not.toBeInTheDocument();
  });

  it("renders error state when API fails", () => {
    render(<ErrorState message="Trace lookup failed." reset={() => undefined} />);

    expect(
      screen.getByRole("heading", { name: /Trace details unavailable/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Trace lookup failed.")).toBeInTheDocument();
  });
});
