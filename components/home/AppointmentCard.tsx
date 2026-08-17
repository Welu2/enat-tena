import { Calendar } from "lucide-react";

interface AppointmentCardProps {
  label: string;
  daysAwayText: string;
  notSetText: string;
  daysAway: number | null;
}

export function AppointmentCard({
  label,
  daysAwayText,
  notSetText,
  daysAway,
}: AppointmentCardProps) {
  const isSet = daysAway !== null;

  return (
    <div className="bg-[#FAF7F2] border border-[#E4DCD0] p-4 rounded-3xl space-y-2 shadow-xs">
      <div className="w-8 h-8 rounded-xl bg-[#E8EFEA] text-brand-green flex items-center justify-center">
        <Calendar size={16} />
      </div>
      <div>
        <p className="text-[11px] text-brand-subtle font-medium">{label}</p>
        <p className="text-2xl font-black text-brand-green leading-none mt-0.5">
          {isSet ? daysAway : "--"}
        </p>
        <p className="text-[11px] text-brand-subtle mt-0.5">
          {isSet ? daysAwayText : notSetText}
        </p>
      </div>
    </div>
  );
}