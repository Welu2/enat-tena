import { Language } from "@/lib/i18n";

interface Props {
    currentLang: Language;
    onSelect: (lang: Language) => void;
}

export function LanguageToggle({ currentLang, onSelect }: Props) {
    return (
        <div className="inline-flex bg-[#E0D8CA] p-1 rounded-xl items-center border border-[#D5CDBD]">
            <button
                type="button"
                onClick={() => onSelect("am")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${currentLang === "am"
                        ? "bg-brand-green text-white shadow-sm"
                        : "text-brand-subtle hover:text-brand-text"
                    }`}
            >
                አም
            </button>
            <button
                type="button"
                onClick={() => onSelect("en")}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${currentLang === "en"
                        ? "bg-brand-green text-white shadow-sm"
                        : "text-brand-subtle hover:text-brand-text"
                    }`}
            >
                EN
            </button>
        </div>
    );
}