import { LeafMark } from "@/components/assets/FarmToFolkAssets";

export default function FarmerHomePage() {
  return (
    <main className="ftf-paper min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center gap-3 text-[var(--ftf-green-900)]">
          <LeafMark className="h-11 w-11" />
          <div>
            <p className="ftf-display text-2xl font-bold">FarmToFolk Farmer</p>
            <p className="text-sm text-[var(--ftf-muted)]">Your farms, batches, and payments</p>
          </div>
        </header>
        <section className="ftf-card mt-8 p-6">
          <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
          <p className="mt-2 text-[var(--ftf-muted)]">
            Your farm and batch records will appear here from the farmer dashboard API.
          </p>
        </section>
      </div>
    </main>
  );
}
