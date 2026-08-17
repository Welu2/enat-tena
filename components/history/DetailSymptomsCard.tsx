import { Activity } from "lucide-react";
import { RawSymptom } from "@/types/history";
import { DetailSectionCard } from "@/components/history/DetailSectionCard";
import { DetailBulletItem } from "@/components/history/DetailBulletItem";

interface DetailSymptomsCardProps {
  title: string;
  symptoms: RawSymptom[];
  language: string;
}

export function DetailSymptomsCard({
  title,
  symptoms,
  language,
}: DetailSymptomsCardProps) {
  const emptyLabel = language === "am"
    ? "ምንም ምልክት አልተመዘገበም"
    : "No symptoms recorded.";
  const confirmedLabel = language === "am" ? "ተረጋግጧል" : "Confirmed";

  return (
    <DetailSectionCard
      title={title}
      icon={<Activity className="w-4 h-4 stroke-current" />}
    >
      {symptoms.length > 0 ? (
        symptoms.map((symptom, index) => (
          <DetailBulletItem
            key={`${symptom.raw_text}-${index}`}
            title={symptom.raw_text}
            subtitle={symptom.confirmed ? confirmedLabel : undefined}
          />
        ))
      ) : (
        <p className="text-xs text-brand-subtle">{emptyLabel}</p>
      )}
    </DetailSectionCard>
  );
}