import type { ReactNode } from "react";

export function LeafMark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 44 44">
      <path d="M22 37V19" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
      <path d="M21 21C12 21 7 16 7 7c9 0 15 5 14 14Z" fill="currentColor" opacity=".9" />
      <path d="M23 27c10 0 16-6 16-16-10 0-17 6-16 16Z" fill="currentColor" opacity=".7" />
      <path d="m22 20-8-8m9 14 9-9" stroke="var(--ftf-paper-light)" strokeLinecap="round" strokeWidth="1.3" />
    </svg>
  );
}

export function BotanicalCorner({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 120 120">
      <path d="M18 102C34 78 43 54 44 20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M43 48C32 45 25 39 20 30C31 31 39 37 43 48Z" fill="currentColor" opacity=".22" />
      <path d="M38 68C28 66 20 60 15 52C27 53 35 58 38 68Z" fill="currentColor" opacity=".18" />
      <path d="M46 36C57 31 66 23 72 12C73 25 62 35 46 36Z" fill="currentColor" opacity=".18" />
      <path d="M45 58C58 54 68 46 75 34C76 49 64 58 45 58Z" fill="currentColor" opacity=".22" />
      <path d="M43 82C56 79 66 72 73 61C75 75 61 85 43 82Z" fill="currentColor" opacity=".18" />
    </svg>
  );
}

export function LeafDivider() {
  return <div aria-hidden="true" className="ftf-leaf-divider"><span /></div>;
}

export function Seedling({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 64 64">
      <path d="M32 52V27" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
      <path d="M31 32C18 32 12 25 12 13c12 0 20 7 19 19Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.5" />
      <path d="M33 38c13 0 20-7 20-20-13 0-21 8-20 20Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.5" />
      <path d="M19 53h27" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

export function EmptyBasket({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 80 80">
      <path d="m18 32 6 30h32l6-30H18Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.5" />
      <path d="M29 36c0-14 22-14 22 0" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
      <path d="M32 22c-7-1-11-5-12-11 7 0 11 4 12 11Zm3 2c8-1 13-6 14-14-8 1-13 6-14 14Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M28 43v12m12-12v12m12-12v12" stroke="currentColor" strokeLinecap="round" opacity=".5" strokeWidth="2" />
    </svg>
  );
}

export function FtfIconCircle({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "clay" | "kraft" }) {
  return <div className={`ftf-watercolor-icon ftf-tone-${tone}`}>{children}</div>;
}
