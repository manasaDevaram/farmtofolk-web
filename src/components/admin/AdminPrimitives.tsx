"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BotanicalCorner, EmptyBasket, LeafMark } from "@/components/assets/FarmToFolkAssets";
import { clearSession } from "@/lib/auth-session";

const navigation = [
  { href: "/admin", icon: "⌂", label: "Dashboard" },
  { href: "/admin/farmers", icon: "♙", label: "Farmers" },
  { href: "/admin/farms", icon: "⌂", label: "Farms" },
  { href: "/admin/batches", icon: "▣", label: "Batches" },
  { href: "/admin/users", icon: "♟", label: "Users" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function signOut() {
    clearSession();
    router.replace("/login");
  }

  return (
    <div className="ftf-paper min-h-screen text-[var(--ftf-text)] md:grid md:grid-cols-[230px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-[var(--ftf-border)] bg-[rgba(252,250,245,.86)] px-4 py-5 backdrop-blur md:flex md:flex-col">
        <Link className="flex items-center gap-2 px-2 text-[var(--ftf-green-900)]" href="/admin">
          <LeafMark className="h-10 w-10" />
          <span className="ftf-display text-xl font-bold">FarmToFolk</span>
        </Link>
        <p className="mt-1 px-3 text-[10px] font-semibold tracking-wide text-[var(--ftf-muted)]">
          TRACEABILITY LEDGER
        </p>

        <nav aria-label="Admin navigation" className="mt-9 space-y-1.5">
          {navigation.map((item) => (
            <NavLink
              active={isActivePath(pathname, item.href)}
              href={item.href}
              icon={item.icon}
              key={item.href}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-[var(--ftf-border)] pt-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--ftf-sage)] font-bold text-[var(--ftf-green-900)]">
              A
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">Administrator</p>
              <p className="truncate text-xs text-[var(--ftf-muted)]">Admin workspace</p>
            </div>
          </div>
          <button
            className="ftf-focus w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-[var(--ftf-muted)] transition hover:bg-[var(--ftf-sage)]"
            onClick={signOut}
            type="button"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-4 pb-24 pt-5 sm:px-6 md:pb-8 lg:px-8">
        <div className="mx-auto max-w-[1180px]">{children}</div>
      </main>

      <nav
        aria-label="Mobile admin navigation"
        className="fixed inset-x-3 bottom-3 z-40 flex justify-around rounded-2xl border border-[var(--ftf-border)] bg-[rgba(31,61,37,.96)] p-2 text-white shadow-xl backdrop-blur md:hidden"
      >
        {navigation.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              className={`ftf-focus flex min-w-16 flex-col items-center rounded-xl px-2 py-1 text-[10px] font-bold ${active ? "bg-white/16 text-white" : "text-white/70"}`}
              href={item.href}
              key={item.href}
            >
              <span aria-hidden="true" className="text-lg leading-5">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function isActivePath(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

function NavLink({
  active,
  children,
  href,
  icon,
}: {
  active: boolean;
  children: ReactNode;
  href: string;
  icon: string;
}) {
  return (
    <Link
      className={`ftf-focus flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${active ? "bg-[var(--ftf-sage)] text-[var(--ftf-green-900)]" : "text-[var(--ftf-muted)] hover:bg-white/65 hover:text-[var(--ftf-text)]"}`}
      href={href}
    >
      <span aria-hidden="true" className="grid h-6 w-6 place-items-center text-base">
        {icon}
      </span>
      {children}
    </Link>
  );
}

export function PageHeader({
  actions,
  eyebrow,
  title,
  description,
}: {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <header className="relative mb-5 overflow-hidden border-b border-[var(--ftf-border)] px-1 pb-5 pt-2 sm:flex sm:items-end sm:justify-between sm:gap-5">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ftf-green-700)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-3xl font-bold leading-tight text-[var(--ftf-text)] sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ftf-muted)] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">{actions}</div>
      ) : null}
      <BotanicalCorner className="ftf-botanical-corner h-24 w-24" />
    </header>
  );
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link className={buttonClass(variant)} href={href}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  disabled,
  onClick,
  type = "button",
  variant = "primary",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <button className={buttonClass(variant)} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  );
}

function buttonClass(variant: "primary" | "secondary" | "danger") {
  const base =
    "ftf-focus inline-flex min-h-10 items-center justify-center rounded-[var(--ftf-radius-input)] px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";
  if (variant === "danger")
    return `${base} border border-red-200 bg-red-50 text-red-700 hover:bg-red-100`;
  if (variant === "secondary")
    return `${base} border border-[var(--ftf-border)] bg-white/65 text-[var(--ftf-text)] hover:bg-white`;
  return `${base} bg-[var(--ftf-green-900)] text-white hover:bg-[var(--ftf-green-700)]`;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`ftf-card p-5 ${className}`}>{children}</section>;
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <Card>
      <div className="flex items-center gap-3 text-[var(--ftf-muted)]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--ftf-sage)] border-t-[var(--ftf-green-700)]" />
        <p className="font-bold">{label}</p>
      </div>
    </Card>
  );
}

export function EmptyState({
  action,
  message,
  title = "Nothing here yet",
}: {
  action?: ReactNode;
  message: string;
  title?: string;
}) {
  return (
    <Card className="text-center">
      <EmptyBasket className="mx-auto h-20 w-20 text-[var(--ftf-green-700)] opacity-65" />
      <h2 className="mt-2 text-xl font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-[var(--ftf-muted)]">{message}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </Card>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Card className="border-red-200 bg-red-50/70">
      <h2 className="font-bold text-red-900">Something went wrong</h2>
      <p className="mt-2 text-sm text-red-800">{message}</p>
      {onRetry ? (
        <div className="mt-4">
          <Button onClick={onRetry} variant="danger">
            Try again
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

export function Field({
  error,
  help,
  label,
  required,
  children,
}: {
  children: ReactNode;
  error?: string;
  help?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[var(--ftf-text)]">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      <div className="mt-1.5">{children}</div>
      {help ? <p className="mt-1 text-xs text-[var(--ftf-muted)]">{help}</p> : null}
      {error ? <p className="mt-1 text-xs font-bold text-red-700">{error}</p> : null}
    </label>
  );
}

export const inputClass =
  "ftf-focus min-h-11 w-full rounded-[var(--ftf-radius-input)] border border-[var(--ftf-border)] bg-white/70 px-3 py-2 text-sm outline-none transition focus:border-[var(--ftf-green-500)]";

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`ftf-stamp ${active ? "" : "border-stone-300 bg-stone-100/70 text-stone-600"}`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function InfoGrid({ items }: { items: Array<{ label: string; value?: ReactNode }> }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          className="rounded-xl border border-[var(--ftf-border)] bg-white/45 p-4"
          key={item.label}
        >
          <dt className="text-xs font-bold uppercase tracking-wide text-[var(--ftf-muted)]">
            {item.label}
          </dt>
          <dd className="mt-1 font-bold text-[var(--ftf-text)]">{item.value || "Not available"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ConfirmDialog({
  message,
  onCancel,
  onConfirm,
  title,
}: {
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(45,43,38,.45)] p-4 backdrop-blur-sm">
      <Card className="max-w-md">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-2 text-[var(--ftf-muted)]">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger">
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}
