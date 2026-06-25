import Link from "next/link";
import type { ReactNode } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e7f6df_0,#f8f3e9_34%,#fffaf0_100%)] px-4 py-5 text-stone-950 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <nav className="sticky top-4 z-20 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-white/70 bg-white/90 px-4 py-3 shadow-[0_18px_60px_rgba(34,65,33,0.10)] backdrop-blur">
          <Link className="flex items-center gap-3 text-xl font-black text-emerald-950" href="/admin">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-800">FTF</span>
            <span>
              FarmToFolk Admin
              <span className="block text-xs font-bold text-stone-500">Traceability cockpit</span>
            </span>
          </Link>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            <NavLink href="/admin/farmers">Farmers</NavLink>
            <NavLink href="/admin/farms">Farms</NavLink>
            <NavLink href="/admin/batches">Batches</NavLink>
            <NavLink href="/">Public Home</NavLink>
          </div>
        </nav>
        {children}
      </div>
    </main>
  );
}

function NavLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link
      className="rounded-full bg-emerald-50 px-4 py-2 text-emerald-900 transition hover:bg-emerald-100"
      href={href}
    >
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
    <header className="mb-5 flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(34,65,33,0.08)] sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-sm font-black uppercase tracking-wide text-emerald-700">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-stone-600">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
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
    <button
      className={buttonClass(variant)}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

function buttonClass(variant: "primary" | "secondary" | "danger") {
  const base =
    "inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-2 text-sm font-black transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";
  if (variant === "danger") {
    return `${base} bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-200`;
  }
  if (variant === "secondary") {
    return `${base} border border-stone-200 bg-white text-stone-800 hover:bg-stone-50 focus-visible:ring-emerald-200`;
  }
  return `${base} bg-emerald-800 text-white hover:bg-emerald-900 focus-visible:ring-emerald-200`;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[1.75rem] border border-white/75 bg-white/95 p-5 shadow-[0_14px_45px_rgba(34,65,33,0.07)] ${className}`}
    >
      {children}
    </section>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <Card>
      <p className="animate-pulse font-bold text-stone-600">{label}</p>
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
      <h2 className="text-xl font-black">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-stone-600">{message}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </Card>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-red-100 bg-red-50">
      <h2 className="font-black text-red-900">Something went wrong</h2>
      <p className="mt-2 text-red-800">{message}</p>
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
      <span className="text-sm font-black text-stone-800">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>
      <div className="mt-1">{children}</div>
      {help ? <p className="mt-1 text-xs text-stone-500">{help}</p> : null}
      {error ? <p className="mt-1 text-xs font-bold text-red-700">{error}</p> : null}
    </label>
  );
}

export const inputClass =
  "min-h-11 w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
        active ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function InfoGrid({
  items,
}: {
  items: Array<{ label: string; value?: ReactNode }>;
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div className="rounded-2xl bg-stone-50 p-4" key={item.label}>
          <dt className="text-xs font-black uppercase text-stone-500">
            {item.label}
          </dt>
          <dd className="mt-1 font-bold text-stone-950">
            {item.value || "Not available"}
          </dd>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <Card className="max-w-md">
        <h2 className="text-xl font-black">{title}</h2>
        <p className="mt-2 text-stone-600">{message}</p>
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
