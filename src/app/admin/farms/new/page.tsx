import { Suspense } from "react";
import { FarmFormView } from "@/components/admin/AdminViews";
import { LoadingState } from "@/components/admin/AdminPrimitives";

export default function NewFarmPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <FarmFormView />
    </Suspense>
  );
}
