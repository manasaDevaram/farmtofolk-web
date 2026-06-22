"use client";

import { LeafIcon } from "./trace-utils";

export function ErrorState({
  message = "We could not load this trace page right now.",
  reset,
}: {
  message?: string;
  reset?: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#f8f3e9] px-4 py-6 sm:px-6">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-stone-200 bg-white p-6 text-center shadow-[0_18px_60px_rgba(50,45,34,0.10)] sm:p-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-800">
            <LeafIcon className="h-9 w-9" />
          </span>
          <h1 className="mt-5 text-3xl font-black text-stone-950">
            Trace details unavailable
          </h1>
          <p className="mx-auto mt-3 max-w-md leading-7 text-stone-600">
            {message}
          </p>
          {reset ? (
            <button
              className="mt-6 rounded-2xl bg-emerald-800 px-6 py-3 font-black text-white transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
              onClick={reset}
              type="button"
            >
              Try again
            </button>
          ) : null}
        </section>
      </div>
    </main>
  );
}
