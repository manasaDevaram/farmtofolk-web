import type { PublicTraceMedia } from "@/types/public-trace";

export function formatDate(value?: string | null): string {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatCurrency(value?: number | null): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "Not available";

  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    style: "currency",
  }).format(value);
}

export function formatNumber(value?: number | null): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "Not available";
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatPercent(part?: number | null, total?: number | null): string {
  if (
    typeof part !== "number" ||
    typeof total !== "number" ||
    Number.isNaN(part) ||
    Number.isNaN(total) ||
    total <= 0
  ) {
    return "N/A";
  }

  const percent = (part / total) * 100;
  return `${Number.isInteger(percent) ? percent : percent.toFixed(1)}%`;
}

export function compactLocation(
  ...parts: Array<string | null | undefined>
): string {
  const location = parts.filter(Boolean).join(", ");
  return location || "Location not available";
}

export function mediaSrc(media?: PublicTraceMedia | null): string | null {
  if (!media) return null;
  if ("fileUrl" in media) return media.fileUrl;
  return media.mediaUrl;
}

export function isVideo(media?: PublicTraceMedia | null): boolean {
  if (!media) return false;
  const mediaType = "fileType" in media ? media.fileType : media.mediaType;
  return mediaType.toLowerCase().includes("video");
}

export function toTitleCase(value?: string | null): string {
  if (!value) return "Not available";
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function FieldRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-100 py-2 last:border-0">
      <dt className="text-sm text-stone-500">{label}</dt>
      <dd className="text-right text-sm font-semibold text-stone-900">
        {value || "Not available"}
      </dd>
    </div>
  );
}

export function MediaTile({
  alt,
  className = "",
  media,
}: {
  alt: string;
  className?: string;
  media?: PublicTraceMedia | null;
}) {
  const src = mediaSrc(media);

  return (
    <div
      aria-label={alt}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-lime-50 to-amber-100 bg-cover bg-center ${className}`}
      role="img"
      style={src ? { backgroundImage: `url(${src})` } : undefined}
    >
      {!src ? (
        <div className="flex h-full min-h-20 items-center justify-center text-3xl text-emerald-800">
          <LeafIcon className="h-8 w-8" />
        </div>
      ) : null}
      {isVideo(media) ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/15">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-emerald-800 shadow-sm">
            <PlayIcon className="h-4 w-4 translate-x-0.5" />
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function LeafIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M20 4c-7.5.4-12.8 3.3-15.1 8.3C2.8 16.8 5.5 20 9.4 20c5.5 0 9.8-5.2 10.6-16Z"
        fill="currentColor"
        opacity=".95"
      />
      <path
        d="M5 19c4.4-5.8 8.1-8.7 13-11"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function CheckIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
    </svg>
  );
}

export function ChevronIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function PlayIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}
