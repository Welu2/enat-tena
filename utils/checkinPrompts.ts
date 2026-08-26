import { CheckInStage } from "@/types/api";

export interface StagePromptConfig {
  categoryAm: string;
  categoryEn: string;
  defaultPromptAm: string;
  defaultPromptEn: string;
}

export const CHECKIN_PROMPTS: Record<string, StagePromptConfig> = {
  symptoms: {
    categoryAm: "የአደጋ ምልክቶች እና ህመም",
    categoryEn: "DANGER SIGNS & SYMPTOMS",
    defaultPromptAm:
      "ዛሬ ጽኑ ራስ ምታት፣ የዓይን ብዥታ፣ ደም መፍሰስ፣ ፈሳሽ መፍሰስ ወይም ከፍተኛ የሆድ ህመም ተሰምቶዎታል?",
    defaultPromptEn:
      "Did you experience any severe headache, blurred vision, vaginal bleeding, fluid leakage, or abdominal pain today?",
  },
  food: {
    categoryAm: "የተመጣጠነ ምግብ እና አመጋገብ",
    categoryEn: "NUTRITION & DIET",
    defaultPromptAm:
      "ዛሬ ምን ምን አይነት ምግቦችን ተመገቡ? ቢያንስ አንድ ተጨማሪ የተመጣጠነ ምግብ ወስደዋል?",
    defaultPromptEn:
      "What foods did you eat today? Did you have an additional nutrient-dense meal?",
  },
  supplement: {
    categoryAm: "የቅድመ ወሊድ እንክብሎች",
    categoryEn: "PRENATAL SUPPLEMENTS",
    defaultPromptAm:
      "የዛሬውን የብረት እና ፎሊክ አሲድ (IFA) ወይም የካልሲየም እንክብል ወስደዋል?",
    defaultPromptEn:
      "Did you take your prescribed daily Iron-Folic Acid (IFA) or Calcium supplement today?",
  },
  closing: {
    categoryAm: "አጠቃላይ ስሜት እና ጥያቄዎች",
    categoryEn: "CLOSING & QUESTIONS",
    defaultPromptAm:
      "ሌላ የሚያስጨንቅዎት ማንኛውም የጤና ለውጥ፣ ህመም ወይም ጥያቄ አለዎት?",
    defaultPromptEn:
      "Do you have any other questions, concerns, or symptoms you would like to report?",
  },
};

export function resolveActivePrompt(
  stage: string,
  lang: string,
  backendPromptAm?: string,
  localizedDict?: Record<string, string>
): string {
  const config = CHECKIN_PROMPTS[stage] || CHECKIN_PROMPTS.symptoms;

  if (lang === "en") {
    if (stage === "symptoms") return localizedDict?.symptomsQuestion || config.defaultPromptEn;
    if (stage === "food") return localizedDict?.foodQuestion || config.defaultPromptEn;
    if (stage === "supplement") return localizedDict?.supplementsCheckinQuestion || config.defaultPromptEn;
    return localizedDict?.otherQuestion || config.defaultPromptEn;
  }

  return backendPromptAm || config.defaultPromptAm;
}