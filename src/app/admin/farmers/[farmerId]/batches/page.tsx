import { BatchesListView } from "@/components/admin/AdminViews";

export default async function FarmerBatchesPage({
  params,
}: {
  params: Promise<{ farmerId: string }>;
}) {
  const { farmerId } = await params;
  return <BatchesListView farmerId={farmerId} />;
}
