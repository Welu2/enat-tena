export interface StagePromptConfig {
  am: string;
  en: string;
  categoryAm: string;
  categoryEn: string;
}

export const CHECKIN_PROMPTS: Record<string, StagePromptConfig> = {
  symptoms: {
    am: "ዛሬ ምን ዓይነት የጤና ስሜት ወይም ህመም አጋጠመዎት?",
    en: "How are you feeling today? Any symptoms or discomfort?",
    categoryAm: "የጤና ስሜት / ምልክቶች",
    categoryEn: "SYMPTOMS",
  },
  food: {
    am: "ዛሬ ምን ምን ምግቦችን ተመገቡ?",
    en: "What meals or foods did you eat today?",
    categoryAm: "የምግብ መዝገብ",
    categoryEn: "FOOD",
  },
  supplement: {
    am: "ዛሬ የታዘዘልዎትን መድሃኒት ወስደዋል?",
    en: "Did you take your prescribed supplement today?",
    categoryAm: "የመድሃኒት አወሳሰድ",
    categoryEn: "SUPPLEMENT",
  },
  closing: {
    am: "ሌላ ሊነግሩን የሚፈልጉት ማንኛውም የጤና ስሜት ወይም ጥያቄ አለዎት?",
    en: "Is there anything else you would like to share or ask?",
    categoryAm: "ተጨማሪ መረጃ",
    categoryEn: "CLOSING",
  },
  other: {
    am: "ሌላ ሊነግሩን የሚፈልጉት ማንኛውም የጤና ስሜት ወይም ጥያቄ አለዎት?",
    en: "Is there anything else you would like to share or ask?",
    categoryAm: "ተጨማሪ መረጃ",
    categoryEn: "CLOSING",
  },
};

export function resolveActivePrompt(
  stage: string,
  lang: string,
  promptAm?: string | null,
  t?: Record<string, string>
): string {
  if (lang === "am" && promptAm?.trim()) {
    return promptAm.trim();
  }

  const stageConfig = CHECKIN_PROMPTS[stage] || CHECKIN_PROMPTS.symptoms;

  if (lang === "am") {
    return stageConfig.am;
  }

  return t?.[`${stage}Prompt`] || stageConfig.en;
}