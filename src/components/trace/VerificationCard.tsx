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

function yesNo(value: boolean | null | undefined): string | null {
  if (value == null) return null;
  return value ? "Yes" : "No";
}

export function VerificationCard({
  evidence,
  verification,
}: {
  evidence?: PublicTraceMedia[] | null;
  verification?: PublicTraceVerification | null;
}) {
  if (!verification) return null;

  const checklist = parseChecklist(verification.checklistJson);
  const publicEvidence = evidence?.filter((item) => item.isPublic !== false) ?? [];

  return (
    <TraceAccordionCard
      accent="bg-emerald-50 text-emerald-800"
      icon={<LeafIcon className="h-9 w-9" />}
      openContent={
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.2fr_1fr]">
          <dl>
            <FieldRow
              label="Verification Type"
              value={toTitleCase(verification.verificationType)}
            />
            <FieldRow label="Chemical-Free Claim" value={yesNo(verification.chemicalFreeClaim)} />
            <FieldRow
              label="Agroecology Verified"
              value={yesNo(verification.agroecologyVerified)}
            />
            <FieldRow label="Last Verified" value={formatDate(verification.verificationDate)} />
            {verification.nextVerificationDue ? (
              <FieldRow label="Next Due" value={formatDate(verification.nextVerificationDue)} />
            ) : null}
          </dl>
          {checklist.length || verification.observations ? (
            <div>
              <h3 className="mb-3 font-black text-stone-950">Verification checklist</h3>
              {checklist.length ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {checklist.map((item) => (
                    <li
                      className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-950"
                      key={item}
                    >
                      <CheckIcon className="h-4 w-4 text-emerald-700" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              {verification.observations ? (
                <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-950">
                  <p className="font-black">Field officer notes</p>
                  <p className="mt-1 leading-6">{verification.observations}</p>
                </div>
              ) : null}
            </div>
          ) : null}
          {publicEvidence.length ? (
            <div>
              <h3 className="mb-3 font-black text-stone-950">Verification evidence</h3>
              <div className="grid grid-cols-2 gap-3">
                {publicEvidence.slice(0, 4).map((media, index) => (
                  <MediaTile
                    alt={media.caption || `Verification evidence ${index + 1}`}
                    className="aspect-[4/3]"
                    key={`${media.id ?? index}`}
                    media={media}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      }
      summary={
        <>
          <p>
            Last verified on{" "}
            <span className="font-bold text-stone-950">
              {formatDate(verification.verificationDate)}
            </span>
          </p>
          <p className="mt-1 inline-flex items-center gap-2 font-bold text-emerald-800">
            <CheckIcon className="h-4 w-4" />
            Farm practices independently reviewed
          </p>
        </>
      }
      title="Agroecology Verification"
    />
  );
}
