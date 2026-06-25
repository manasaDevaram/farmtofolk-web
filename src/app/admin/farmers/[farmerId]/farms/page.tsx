import { FarmsListView } from "@/components/admin/AdminViews";

export default async function FarmerFarmsPage({
  params,
}: {
  params: Promise<{ farmerId: string }>;
}) {
  const { farmerId } = await params;
  return <FarmsListView farmerId={farmerId} />;
}
