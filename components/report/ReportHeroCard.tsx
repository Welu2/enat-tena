import { Header } from "@/components/Header";
import { RefreshCw, QrCode, Share2 } from "lucide-react";

interface ReportHeroCardProps {
  title: string;
  subtitle: string;
  patientLabel: string;
  patientName: string;
  periodLabel: string;
  periodRange: string;
  shareLabel: string;
  hasSummary: boolean;
  isGenerating: boolean;
  onRegenerate: () => void;
  onOpenQR: () => void;
  onShare: () => void;
}

export function ReportHeroCard({
  title,
  subtitle,
  patientLabel,
  patientName,
  periodLabel,
  periodRange,
  shareLabel,
  hasSummary,
  isGenerating,
  onRegenerate,
  onOpenQR,
  onShare,
}: ReportHeroCardProps) {
  return (
    <div className="bg-[#2B5140] text-white px-6 sm:px-7 pt-16 pb-6 relative">
      <Header />
      <div className="flex items-start justify-between mt-2">
        <div>
          <p className="text-[11px] font-bold tracking-wider uppercase text-white/70">
            {subtitle}
          </p>
          <h1 className="text-2xl font-extrabold text-white mt-0.5">
            {title}
          </h1>
        </div>
        {hasSummary && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRegenerate}
              disabled={isGenerating}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer disabled:opacity-50"
              title="Regenerate Report"
            >
              <RefreshCw
                size={15}
                className={isGenerating ? "animate-spin" : ""}
              />
            </button>
            <button
              type="button"
              onClick={onOpenQR}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer"
              title="Show QR Code"
            >
              <QrCode size={16} />
            </button>
            <button
              type="button"
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm active:scale-95 transition-all cursor-pointer"
            >
              <Share2 size={13} />
              <span>{shareLabel}</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
          <p className="text-[10px] font-bold text-white/65 uppercase tracking-wider">
            {patientLabel}
          </p>
          <p className="text-sm font-bold text-white mt-0.5 truncate">
            {patientName}
          </p>
        </div>
        <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
          <p className="text-[10px] font-bold text-white/65 uppercase tracking-wider">
            {periodLabel}
          </p>
          <p className="text-sm font-bold text-white mt-0.5 truncate">
            {periodRange}
          </p>
        </div>
      </div>
    </div>
  );
}