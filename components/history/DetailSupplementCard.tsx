import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { AggregatedSupplement } from "@/types/history";

interface DetailSupplementCardProps {
  sectionTitle: string;
  supplements: AggregatedSupplement[];
  language: string;
}

function SupplementRow({
  item,
  language,
}: {
  item: AggregatedSupplement;
  language: string;
}) {
  const takenLabel = language === "am" ? "ተወስዷል" : "Taken";
  const missedLabel = language === "am" ? "አልተወሰደም" : "Not taken";

  return (
    <div className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
      <span className="text-xs font-semibold text-brand-text">
        {item.name}
      </span>
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
          item.taken ? "text-brand-green" : "text-amber-800"
        }`}
      >
        {item.taken ? (
          <CheckCircle2 size={13} className="text-brand-green" />
        ) : (
          <XCircle size={13} className="text-amber-700" />
        )}
        {item.taken ? takenLabel : missedLabel}
      </span>
    </div>
  );
}

export function DetailSupplementCard({
  sectionTitle,
  supplements,
  language,
}: DetailSupplementCardProps) {
  const emptyLabel = language === "am"
    ? "የተመዘገበ ተጨማሪ መድሃኒት የለም"
    : "No supplement records for this day.";

  return (
    <div className="bg-[#E4ECE7] border border-[#D0DFD6] p-4 rounded-3xl space-y-2.5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-green text-white flex items-center justify-center flex-shrink-0 shadow-sm">
          <ShieldCheck className="w-5 h-5 stroke-current" />
        </div>
        <h3 className="text-sm font-bold text-brand-text">
          {sectionTitle}
        </h3>
      </div>

      {supplements.length > 0 ? (
        <div className="divide-y divide-[#D4E3D9] pt-1">
          {supplements.map((supp) => (
            <SupplementRow
              key={supp.name}
              item={supp}
              language={language}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-brand-subtle">{emptyLabel}</p>
      )}
    </div>
  );
}