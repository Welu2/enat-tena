import { Header } from "@/components/Header";
import { formatSyncedDate } from "@/lib/dateUtils";
import { toSupportedLanguage } from "@/types/report";

interface HomeGreetingProps {
  displayName: string;
  greetingText: string;
  language: string;
}

export function HomeGreeting({
  displayName,
  greetingText,
  language,
}: HomeGreetingProps) {
  const validLang = toSupportedLanguage(language);
  const formattedToday = formatSyncedDate(new Date(), validLang);
  const avatarLetter = (displayName.trim() || "U").charAt(0).toUpperCase();

  return (
    <div className="relative pt-16 md:pt-16 px-6 sm:px-7">
      <Header />
      <div className="flex items-center justify-between mt-2">
        <div>
          <p className="text-xs text-brand-subtle font-medium">
            {formattedToday.full}
          </p>
          <h1 className="text-2xl font-extrabold text-brand-text">
            {greetingText} <span className="font-bold">{displayName}</span>
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#E0EBE6] text-brand-green font-bold flex items-center justify-center text-sm shadow-xs uppercase">
          {avatarLetter}
        </div>
      </div>
    </div>
  );
}