"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronIcon } from "./trace-utils";

export function TraceAccordionCard({
  accent = "bg-emerald-100 text-emerald-800",
  children,
  defaultOpen = false,
  icon,
  openContent,
  summary,
  title,
}: {
  accent?: string;
  children?: ReactNode;
  defaultOpen?: boolean;
  icon: ReactNode;
  openContent: ReactNode;
  summary: ReactNode;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className="trace-card overflow-hidden rounded-2xl border border-[var(--ftf-border)] bg-white shadow-[0_8px_24px_rgba(13,74,48,0.07)]">
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="ftf-focus flex w-full cursor-pointer items-center gap-4 rounded-2xl px-4 py-3 text-left outline-none transition hover:bg-[var(--ftf-sage)]/35 sm:px-5 sm:py-4"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full sm:h-16 sm:w-16 ${accent}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--ftf-text)]">
            {title}
          </h2>
          <div className="mt-0.5 text-sm leading-5 text-[var(--ftf-muted)]">
            {summary}
          </div>
          {children}
        </div>
        <ChevronIcon
          className={`h-6 w-6 shrink-0 text-stone-800 transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen ? (
        <div
          className="border-t border-stone-100 px-4 pb-4 pt-3 sm:px-5 sm:pb-5"
          id={contentId}
        >
          {openContent}
        </div>
      ) : null}
    </section>
  );
}
