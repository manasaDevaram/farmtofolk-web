"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronIcon } from "./trace-utils";

export function TraceAccordionCard({
  accent = "bg-emerald-100 text-emerald-800",
  children,
  icon,
  openContent,
  summary,
  title,
}: {
  accent?: string;
  children?: ReactNode;
  icon: ReactNode;
  openContent: ReactNode;
  summary: ReactNode;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <section className="rounded-2xl border border-[var(--ftf-border)] bg-[var(--ftf-paper-light)] shadow-[0_10px_28px_rgba(65,49,29,0.08)]">
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="ftf-focus flex w-full cursor-pointer items-center gap-4 rounded-2xl p-4 text-left outline-none transition hover:bg-[var(--ftf-sage)]/35 sm:gap-6 sm:p-6"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl sm:h-20 sm:w-20 ${accent}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--ftf-text)] sm:text-2xl">
            {title}
          </h2>
          <div className="mt-1 text-sm leading-6 text-[var(--ftf-muted)] sm:text-base">
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
          className="border-t border-[var(--ftf-border)] px-4 pb-5 pt-4 sm:px-6 sm:pb-6"
          id={contentId}
        >
          {openContent}
        </div>
      ) : null}
    </section>
  );
}
