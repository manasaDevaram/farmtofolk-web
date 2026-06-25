import { Suspense } from "react";
import { BatchFormView } from "@/components/admin/AdminViews";
import { LoadingState } from "@/components/admin/AdminPrimitives";

export default async function EditBatchPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  return (
    <Suspense fallback={<LoadingState />}>
      <BatchFormView batchId={batchId} />
    </Suspense>
  );
}
