import type { PublicTraceMedia, PublicTraceVerification } from "@/types/public-trace";
import { TraceAccordionCard } from "./TraceAccordionCard";
import { CheckIcon, FieldRow, formatDate, LeafIcon, MediaTile, toTitleCase } from "./trace-utils";

function parseChecklist(checklistJson?: string | null): string[] {
  if (!checklistJson) return [];

  try {
    const parsed = JSON.parse(checklistJson) as unknown;

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object" && "label" in item) {
            return String(item.label);
          }
          if (item && typeof item === "object" && "name" in item) {
            return String(item.name);
          }
          return null;
        })
        .filter((item): item is string => Boolean(item));
    }

    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed)
        .filter(([, value]) => Boolean(value))
        .map(([key]) => toTitleCase(key));
    }
  } catch {
    return [];
  }

  return [];
}

export function VerificationCard({
  evidence,
  verification,
}: {
  evidence?: PublicTraceMedia[] | null;
  verification?: PublicTraceVerification | null;
}) {
  const checklist = parseChecklist(verification?.checklistJson);
  const verificationDate = verification?.verificationDate;
  const publicEvidence = evidence?.filter((item) => item.isPublic !== false) ?? [];
  const status = verification?.status?.trim().toUpperCase();
  const isVerified = status === "VERIFIED" || status === "APPROVED";
  const isPending = status === "PENDING";
  const isRejected = status === "REJECTED";
  const chemicalFreeValue =
    verification?.chemicalFreeClaim == null
      ? null
      : isPending
        ? verification.chemicalFreeClaim
          ? "Claimed — pending review"
          : "Not claimed"
        : verification.chemicalFreeClaim
          ? "Yes"
          : "No";
  const agroecologyValue = isPending
    ? "Pending review"
    : isRejected
      ? "Not verified"
      : verification?.agroecologyVerified == null
        ? null
        : verification.agroecologyVerified
          ? "Yes"
          : "No";

  return (
    <TraceAccordionCard
      accent={isVerified ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}
      icon={<LeafIcon className="h-9 w-9" />}
      openContent={
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.2fr_1fr]">
          <dl>
            <FieldRow label="Status" value={toTitleCase(verification?.status)} />
            <FieldRow
              label="Verification Type"
              value={toTitleCase(verification?.verificationType)}
            />
            <FieldRow
              label="Chemical-Free Claim"
              value={chemicalFreeValue}
            />
            <FieldRow
              label="Agroecology Verified"
              value={agroecologyValue}
            />
            <FieldRow
              label={isVerified ? "Verification Date" : "Submitted Date"}
              value={formatDate(verificationDate)}
            />
            <FieldRow label="Next Due" value={formatDate(verification?.nextVerificationDue)} />
          </dl>
          <div>
            <h3 className="mb-3 font-black text-stone-950">Verification checklist</h3>
            {checklist.length ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {checklist.map((item) => (
                  <li
                    className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${isVerified ? "bg-emerald-50 text-emerald-950" : "bg-amber-50 text-amber-950"}`}
                    key={item}
                  >
                    {isVerified ? (
                      <CheckIcon className="h-4 w-4 text-emerald-700" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                    )}
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                No checklist details available.
              </p>
            )}
            {verification?.observations ? (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-950">
                <p className="font-black">Field officer notes</p>
                <p className="mt-1 leading-6">{verification.observations}</p>
              </div>
            ) : null}
          </div>
          <div>
            <h3 className="mb-3 font-black text-stone-950">Public evidence</h3>
            <div className="grid grid-cols-2 gap-3">
              {publicEvidence.slice(0, 4).map((media, index) => (
                <MediaTile
                  alt={media.caption || `Verification evidence ${index + 1}`}
                  className="aspect-[4/3]"
                  key={`${media.id ?? index}`}
                  media={media}
                />
              ))}
              {!publicEvidence.length ? (
                <p className="col-span-full rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                  Public evidence photos are not available yet.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      }
      summary={
        <>
          <p>
            Latest status:{" "}
            <span className="font-bold text-stone-950">{toTitleCase(verification?.status)}</span>
          </p>
          <p
            className={`mt-1 inline-flex items-center gap-2 font-bold ${isVerified ? "text-emerald-800" : isRejected ? "text-red-700" : "text-amber-800"}`}
          >
            {isVerified ? <CheckIcon className="h-4 w-4" /> : <span aria-hidden="true">●</span>}
            {isVerified
              ? `Verified on ${formatDate(verificationDate)}`
              : isRejected
                ? `Not approved · reviewed on ${formatDate(verificationDate)}`
                : isPending
                  ? `Submitted on ${formatDate(verificationDate)} · awaiting review`
                  : `Recorded on ${formatDate(verificationDate)}`}
          </p>
        </>
      }
      title="Agroecology Verification"
    />
  );
}
