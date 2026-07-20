import { Suspense } from "react";
import { SowingBatchFormView } from "@/components/admin/AdminViews";
import { LoadingState } from "@/components/admin/AdminPrimitives";

export default function NewSowingBatchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SowingBatchFormView />
    </Suspense>
  );
}
