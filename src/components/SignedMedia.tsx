"use client";

import { useState } from "react";
import { cleanMediaUrl } from "@/lib/media-url";

export function SignedMedia({
  alt,
  className,
  kind,
  loadOnActivate = false,
  loading = "lazy",
  onReload,
  priority = false,
  presentation = "default",
  src,
  thumbnailSrc,
}: {
  alt: string;
  className: string;
  kind: "image" | "video";
  loadOnActivate?: boolean;
  loading?: "lazy" | "eager";
  onReload?: () => void;
  priority?: boolean;
  presentation?: "default" | "background";
  src?: string | null;
  thumbnailSrc?: string | null;
}) {
  const cleanUrl = cleanMediaUrl(src);
  const cleanThumbnail = cleanMediaUrl(thumbnailSrc);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [activated, setActivated] = useState(!loadOnActivate);
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
    if (!activated) {
      return (
        <button
          aria-label={`Play ${alt}`}
          className={`${className} relative flex items-center justify-center bg-stone-950 text-white`}
          onClick={() => setActivated(true)}
          type="button"
        >
          {cleanThumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" src={cleanThumbnail} />
          ) : null}
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-emerald-900 shadow-sm">
            ▶
          </span>
        </button>
      );
    }

    return (
      <video
        autoPlay={presentation === "background"}
        className={className}
        controls={presentation === "default"}
        loop={presentation === "background"}
        muted={presentation === "background"}
        onError={() => setFailedUrl(cleanUrl)}
        playsInline
        preload="none"
        src={cleanUrl}
      />
    );
  }

  const imageSrc = cleanThumbnail ?? cleanUrl;

  return (
    // Pre-signed URLs are supplied by the API and may use changing external S3 hosts.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={className}
      decoding="async"
      loading={priority ? "eager" : loading}
      onError={() => setFailedUrl(cleanUrl)}
      src={imageSrc}
    />
  );
}
