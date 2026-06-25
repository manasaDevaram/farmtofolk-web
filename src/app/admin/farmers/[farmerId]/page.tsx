import { FarmerDetailView } from "@/components/admin/AdminViews";

export default async function FarmerPage({
  params,
}: {
  params: Promise<{ farmerId: string }>;
}) {
  const { farmerId } = await params;
  return <FarmerDetailView farmerId={farmerId} />;
}
