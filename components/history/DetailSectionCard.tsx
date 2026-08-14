import { ReactNode } from "react";

interface DetailSectionCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

export function DetailSectionCard({ icon, title, children }: DetailSectionCardProps) {
  return (
    <div className="bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-sm">
      {/* Card Header with Icon Badge */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#E8EFEA] text-brand-green flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <h3 className="text-sm sm:text-base font-bold text-brand-text">{title}</h3>
      </div>

      <div className="border-t border-[#EDE5DA] pt-3 space-y-3">
        {children}
      </div>
    </div>
  );
}