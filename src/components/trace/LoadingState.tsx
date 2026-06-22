import { LeafIcon } from "./trace-utils";

export function LoadingState() {
  return (
    <main className="min-h-screen bg-[#f8f3e9] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-white/70 p-5 shadow-[0_18px_60px_rgba(50,45,34,0.10)] sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <LeafIcon className="h-7 w-7" />
          </span>
          <div>
            <p className="text-xl font-black text-emerald-950">FarmToFolk</p>
            <p className="text-sm text-stone-600">
              Loading your trace details...
            </p>
          </div>
        </div>
        <div className="mt-8 h-64 animate-pulse rounded-[1.75rem] bg-stone-100" />
        <div className="mt-4 space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              className="h-28 animate-pulse rounded-[1.75rem] bg-white"
              key={item}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
