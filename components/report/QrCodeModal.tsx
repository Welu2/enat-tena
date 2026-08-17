import { X, Share2 } from "lucide-react";

interface QrModalProps {
  isOpen: boolean;
  qrCodeUrl?: string;
  shareSlug?: string;
  publicDoctorUrl: string;
  language: string;
  onClose: () => void;
  onShare: () => void;
}

export function QrCodeModal({
  isOpen,
  qrCodeUrl,
  shareSlug,
  publicDoctorUrl,
  language,
  onClose,
  onShare,
}: QrModalProps) {
  if (!isOpen) return null;
  const qrTarget = qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      publicDoctorUrl
    )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl p-6 w-full max-w-sm relative text-center space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-brand-subtle hover:text-brand-text p-1 cursor-pointer"
        >
          <X size={20} />
        </button>
        <div className="space-y-1 pt-2">
          <h3 className="text-base font-bold text-brand-text">
            {language === "am" ? "የሀኪም መመልከቻ QR ኮድ" : "Clinician Review QR"}
          </h3>
          <p className="text-xs text-brand-subtle">
            {language === "am"
              ? "ሀኪምዎ ይህንን QR ኮድ ስካን በማድረግ ሙሉ ሪፖርትዎን ማየት ይችላሉ።"
              : "Let your healthcare provider scan this code to review your summary."}
          </p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-[#E4DCD0] inline-block shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrTarget}
            alt="Clinician QR Code"
            className="w-44 h-44 mx-auto rounded-lg object-contain"
          />
        </div>
        <p className="text-[11px] font-mono text-brand-subtle uppercase">
          Slug: {shareSlug}
        </p>
        <button
          type="button"
          onClick={onShare}
          className="w-full py-3 rounded-2xl bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 size={14} />
          <span>{language === "am" ? "ሊንኩን አጋራ" : "Share Web Link"}</span>
        </button>
      </div>
    </div>
  );
}