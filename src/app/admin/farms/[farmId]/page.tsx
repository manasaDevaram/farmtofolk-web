import { FarmDetailView } from "@/components/admin/AdminViews";

export default async function FarmPage({ params }: { params: Promise<{ farmId: string }> }) {
  const { farmId } = await params;
  return <FarmDetailView farmId={farmId} />;
}
