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
    <section className="rounded-[1.75rem] border border-stone-200/80 bg-white shadow-[0_12px_35px_rgba(50,45,34,0.08)]">
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center gap-4 rounded-[1.75rem] p-4 text-left outline-none transition hover:bg-emerald-50/40 focus-visible:ring-4 focus-visible:ring-emerald-200 sm:gap-6 sm:p-6"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl sm:h-20 sm:w-20 ${accent}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-black tracking-tight text-stone-950 sm:text-2xl">
            {title}
          </h2>
          <div className="mt-1 text-sm leading-6 text-stone-700 sm:text-base">
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
          className="border-t border-stone-100 px-4 pb-5 pt-4 sm:px-6 sm:pb-6"
          id={contentId}
        >
          {openContent}
        </div>
      ) : null}
    </section>
  );
}
