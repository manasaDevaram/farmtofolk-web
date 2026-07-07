"use client";

import { useState } from "react";
import { LeafIcon } from "./trace-utils";
import {
  BRAND_FOOTER_TEXT,
  BRAND_TRACE_SHARE_TEXT,
  BRAND_TRACE_TITLE,
} from "@/lib/constants";

export function TraceFooter() {
  const [copied, setCopied] = useState(false);

  async function shareTrace() {
    const shareData = {
      text: BRAND_TRACE_SHARE_TEXT,
      title: BRAND_TRACE_TITLE,
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <footer className="mt-6">
      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-[#f8f3e9] to-lime-50 p-5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-800">
              <LeafIcon className="h-9 w-9" />
            </span>
            <div>
              <p className="text-lg font-black text-stone-950">
                Thank you! Your choice supports farmers and builds a better food future.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold text-emerald-950">
                <span>Agroecological Farming</span>
                <span>Smallholder Farmers</span>
                <span>Chemical-Free Food System</span>
              </div>
            </div>
          </div>
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-stone-400 bg-white px-6 font-black text-emerald-950 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
            onClick={shareTrace}
            type="button"
          >
            <span aria-hidden="true">♡</span>
            {copied ? "Copied" : "Share"}
          </button>
        </div>
      </div>
      <p className="mt-6 text-center text-sm font-medium text-stone-500">
        {BRAND_FOOTER_TEXT}
      </p>
    </footer>
  );
}
