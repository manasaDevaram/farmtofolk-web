import { Suspense } from "react";
import { BatchFormView } from "@/components/admin/AdminViews";
import { LoadingState } from "@/components/admin/AdminPrimitives";

export default function NewBatchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <BatchFormView />
    </Suspense>
  );
}
