"use client";

import { useState } from "react";
import { cleanMediaUrl } from "@/lib/media-url";

export function SignedMedia({
  alt,
  className,
  kind,
  onReload,
  presentation = "default",
  src,
}: {
  alt: string;
  className: string;
  kind: "image" | "video";
  onReload?: () => void;
  presentation?: "default" | "background";
  src?: string | null;
}) {
  const cleanUrl = cleanMediaUrl(src);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const failed = cleanUrl === failedUrl;

  if (!cleanUrl) return null;

  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-stone-100 p-3 text-center`}>
        <button
          className="rounded-xl bg-white px-3 py-2 text-xs font-black text-emerald-900 shadow-sm"
          onClick={() => (onReload ? onReload() : window.location.reload())}
          type="button"
        >
          Reload media
        </button>
      </div>
    );
  }

  if (kind === "video") {
    return (
      <video
        autoPlay={presentation === "background"}
        className={className}
        controls={presentation === "default"}
        loop={presentation === "background"}
        muted={presentation === "background"}
        onError={() => setFailedUrl(cleanUrl)}
        playsInline
        src={cleanUrl}
      />
    );
  }

  return (
    // Pre-signed URLs are supplied by the API and may use changing external S3 hosts.
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} className={className} onError={() => setFailedUrl(cleanUrl)} src={cleanUrl} />
  );
}
