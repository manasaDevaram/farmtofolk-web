import { FarmerFormView } from "@/components/admin/AdminViews";

export default async function EditFarmerPage({
  params,
}: {
  params: Promise<{ farmerId: string }>;
}) {
  const { farmerId } = await params;
  return <FarmerFormView farmerId={farmerId} />;
}
