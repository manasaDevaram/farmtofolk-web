import { LeafMark } from "@/components/assets/FarmToFolkAssets";

export default function FieldHomePage() {
  return (
    <main className="ftf-paper min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center gap-3 text-[var(--ftf-green-900)]">
          <LeafMark className="h-11 w-11" />
          <div>
            <p className="ftf-display text-2xl font-bold">FarmToFolk Field</p>
            <p className="text-sm text-[var(--ftf-muted)]">Verification workspace</p>
          </div>
        </header>
        <section className="ftf-card mt-8 p-6">
          <h1 className="text-3xl font-bold">Field Officer Dashboard</h1>
          <p className="mt-2 text-[var(--ftf-muted)]">
            Open farmers and farms to record field verifications and evidence.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--ftf-border)] bg-white/60 p-4">
              <h2 className="font-bold">Farmer records</h2>
              <p className="mt-1 text-sm text-[var(--ftf-muted)]">
                Field access is being connected.
              </p>
            </div>
            <div className="rounded-xl border border-[var(--ftf-border)] bg-white/60 p-4">
              <h2 className="font-bold">Farm verifications</h2>
              <p className="mt-1 text-sm text-[var(--ftf-muted)]">
                Evidence workflow is coming next.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
