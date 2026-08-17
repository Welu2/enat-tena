import { Utensils } from "lucide-react";
import { RawFoodLog } from "@/types/history";
import { DetailSectionCard } from "@/components/history/DetailSectionCard";
import { DetailBulletItem } from "@/components/history/DetailBulletItem";

interface DetailFoodCardProps {
  title: string;
  foodLogs: RawFoodLog[];
  language: string;
}

export function DetailFoodCard({
  title,
  foodLogs,
  language,
}: DetailFoodCardProps) {
  const emptyLabel = language === "am"
    ? "የምግብ መረጃ አልተመዘገበም"
    : "No food information recorded.";
  const confirmedLabel = language === "am" ? "ተረጋግጧል" : "Confirmed";

  return (
    <DetailSectionCard
      title={title}
      icon={<Utensils className="w-4 h-4 stroke-current" />}
    >
      {foodLogs.length > 0 ? (
        foodLogs.map((log, index) => (
          <DetailBulletItem
            key={`${log.raw_text}-${index}`}
            title={log.raw_text}
            subtitle={log.confirmed ? confirmedLabel : undefined}
          />
        ))
      ) : (
        <p className="text-xs text-brand-subtle">{emptyLabel}</p>
      )}
    </DetailSectionCard>
  );
}