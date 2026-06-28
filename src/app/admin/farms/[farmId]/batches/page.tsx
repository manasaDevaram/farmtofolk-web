import { BatchesListView } from "@/components/admin/AdminViews";

export default async function FarmBatchesPage({ params }: { params: Promise<{ farmId: string }> }) {
  const { farmId } = await params;
  return <BatchesListView farmId={farmId} />;
}
