import { BatchDetailView } from "@/components/admin/AdminViews";

export default async function BatchPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  return <BatchDetailView batchId={batchId} />;
}
