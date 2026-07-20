import { Suspense } from "react";
import { ProcuredBatchFormView } from "@/components/admin/AdminViews";
import { LoadingState } from "@/components/admin/AdminPrimitives";

export default function NewProcuredBatchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProcuredBatchFormView />
    </Suspense>
  );
}
