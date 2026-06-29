import { Suspense } from "react";
import { FarmFormView } from "@/components/admin/AdminViews";
import { LoadingState } from "@/components/admin/AdminPrimitives";

export default async function EditFarmPage({ params }: { params: Promise<{ farmId: string }> }) {
  const { farmId } = await params;
  return (
    <Suspense fallback={<LoadingState />}>
      <FarmFormView farmId={farmId} />
    </Suspense>
  );
}
