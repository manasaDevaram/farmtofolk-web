import { AdminShell, ButtonLink, Card, PageHeader } from "@/components/admin/AdminPrimitives";

export default function NewBatchPage() {
  return (
    <AdminShell>
      <PageHeader title="Add Batch" />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">Sowing batch</h2>
          <p className="mt-2 text-sm text-stone-600">
            Register crop planted on a farm. Creates the QR sticker for this crop cycle.
          </p>
          <div className="mt-4">
            <ButtonLink href="/admin/batches/new/sowing">Add sowing batch</ButtonLink>
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Procurement batch</h2>
          <p className="mt-2 text-sm text-stone-600">
            Record produce received from a farm and link it to an existing sowing batch.
          </p>
          <div className="mt-4">
            <ButtonLink href="/admin/batches/new/procured" variant="secondary">
              Add procurement batch
            </ButtonLink>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
