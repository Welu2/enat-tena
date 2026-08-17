import { Volume2, VolumeX } from "lucide-react";

interface CheckinStagePromptProps {
  categoryLabel: string;
  activePrompt: string;
  language: string;
  isPlayingAudio: boolean;
  onToggleAudio: () => void;
}

export function CheckinStagePrompt({
  categoryLabel,
  activePrompt,
  language,
  isPlayingAudio,
  onToggleAudio,
}: CheckinStagePromptProps) {
  const audioBtnClass = isPlayingAudio
    ? "bg-brand-green text-white animate-pulse"
    : "bg-[#EAE4D9] text-brand-text hover:bg-brand-green hover:text-white";

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold tracking-wider text-brand-subtle uppercase">
          {categoryLabel}
        </p>

        {language === "am" && (
          <button
            type="button"
            onClick={onToggleAudio}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${audioBtnClass}`}
            title="Listen to question"
          >
            {isPlayingAudio ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        )}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-brand-text mt-1 leading-snug">
        {activePrompt}
      </h2>
    </div>
  );
}