export interface WeekMilestone {
  week: number;
  sizeAm: string;
  sizeEn: string;
  weightGrams: number;
  lengthCm: number;
  emoji: string;
  milestoneAm: string;
  milestoneEn: string;
  maternalTipAm: string;
  maternalTipEn: string;
}

export const PREGNANCY_MILESTONES: Record<number, WeekMilestone> = {
  4: {
    week: 4,
    sizeAm: "የፖፒ ፍሬ (Poppy Seed)",
    sizeEn: "Poppy seed (0.1 cm)",
    weightGrams: 1,
    lengthCm: 0.1,
    emoji: "🌱",
    milestoneAm: "የልጅዎ የነርቭ እና የደም ዝውውር ስርዓት መፈጠር ጀምሯል።",
    milestoneEn: "The neural tube and early circulatory system are beginning to develop.",
    maternalTipAm: "ፎሊክ አሲድ (Folic Acid) በየቀኑ መውሰድዎን አይርሱ።",
    maternalTipEn: "Take your daily folic acid supplement to support neural development.",
  },
  8: {
    week: 8,
    sizeAm: "የወይን ፍሬ (Grape)",
    sizeEn: "Grape (1.6 cm / 1g)",
    weightGrams: 1,
    lengthCm: 1.6,
    emoji: "🍇",
    milestoneAm: "ትናንሽ እጆች፣ ጣቶች እና የዐይን ሽፋሽፍቶች እየታዩ ነው።",
    milestoneEn: "Tiny fingers, toes, and facial features are starting to form.",
    maternalTipAm: "ብዙ ውሃ ይጠጡ፤ ማቅለሽለሽ ካለ ቀለል ያሉ ምግቦችን በትንሽ በትንሹ ይመገቡ።",
    maternalTipEn: "Stay hydrated and eat small, frequent meals if experiencing nausea.",
  },
  12: {
    week: 12,
    sizeAm: "የሎሚ መጠን (Lime)",
    sizeEn: "Lime (5.4 cm / 14g)",
    weightGrams: 14,
    lengthCm: 5.4,
    emoji: "🍋",
    milestoneAm: "የልጅዎ የውስጥ አካላት በሙሉ ተፈጥረዋል፤ የልብ ምት በግልጽ ይሰማል።",
    milestoneEn: "All vital organs are formed and baby's heart beats vigorously.",
    maternalTipAm: "የመጀመሪያው የቅድመ ወሊድ ክትትል (ANC 1) ጊዜ ደርሷል።",
    maternalTipEn: "Time for your 1st Antenatal Care (ANC) booking visit!",
  },
  16: {
    week: 16,
    sizeAm: "የአቦካዶ መጠን (Avocado)",
    sizeEn: "Avocado (11.6 cm / 100g)",
    weightGrams: 100,
    lengthCm: 11.6,
    emoji: "🥑",
    milestoneAm: "ልጅዎ የፊት ገጽታዎችን ማሳየት እና ጣቱን መጥባት ጀምሯል።",
    milestoneEn: "Baby can make facial expressions and may start sucking their thumb.",
    maternalTipAm: "የአይረን እና ፎሊክ አሲድ (IFA) እንክብል መውሰድዎን በየቀኑ ያረጋግጡ።",
    maternalTipEn: "Ensure daily intake of Iron & Folic Acid to prevent anemia.",
  },
  20: {
    week: 20,
    sizeAm: "የሙዝ መጠን (Banana)",
    sizeEn: "Banana (25 cm / 300g)",
    weightGrams: 300,
    lengthCm: 25.0,
    emoji: "🍌",
    milestoneAm: "ልጅዎ የእርስዎን ድምፅ እና የልብ ምት በደንብ መስማት ይችላል።",
    milestoneEn: "Baby can hear your voice and heartbeat clearly. Flutters turn to kicks!",
    maternalTipAm: "የእርግዝና ግማሽ መንገድ ደርሰዋል! ከልጅዎ ጋር ያውሩ እና ዘና ይበሉ።",
    maternalTipEn: "You are halfway through! Talk or sing gently to your baby.",
  },
  24: {
    week: 24,
    sizeAm: "የፓፓያ መጠን (Papaya)",
    sizeEn: "Papaya (30 cm / 600g)",
    weightGrams: 600,
    lengthCm: 30.0,
    emoji: "🥭",
    milestoneAm: "የልጅዎ የጣዕም ስሜቶች እያደጉ ነው፤ እንቅስቃሴያቸው እየጠነከረ ነው።",
    milestoneEn: "Taste buds are developing and baby responds to touch and sound.",
    maternalTipAm: "ካልሲየም እና በፕሮቲን የበለፀገ ምግብ (እንቁላል፣ ወተት፣ ሽሮ) ያዘውትሩ።",
    maternalTipEn: "Boost calcium and protein intake for healthy bone and tissue growth.",
  },
  28: {
    week: 28,
    sizeAm: "የእንቁላል ተክል / ጎመን (Eggplant)",
    sizeEn: "Eggplant (37 cm / 1 kg)",
    weightGrams: 1000,
    lengthCm: 37.0,
    emoji: "🍆",
    milestoneAm: "ልጅዎ ዓይኑን መክፈት እና ማየት ይችላል፤ ህልም ማየት ጀምሯል።",
    milestoneEn: "Baby can open and blink their eyes and may experience REM dream sleep.",
    maternalTipAm: "ወደ 3ኛው የእርግዝና ወቅት (3rd Trimester) እንኳን በደህና መጡ!",
    maternalTipEn: "Welcome to the 3rd Trimester! Sleep on your left side to boost circulation.",
  },
  32: {
    week: 32,
    sizeAm: "የኮኮናት መጠን (Coconut)",
    sizeEn: "Coconut (42 cm / 1.7 kg)",
    weightGrams: 1700,
    lengthCm: 42.0,
    emoji: "🥥",
    milestoneAm: "የልጅዎ አጥንቶች እየጠነከሩ ነው፤ የሰውነት ሙቀትን በራሱ ማስተካከል ይችላል።",
    milestoneEn: "Bones are fully hardening and baby practices breathing movements.",
    maternalTipAm: "የእግር እብጠት ካለ እግርዎን ከፍ አድርገው ያሳርፉ እና ምቹ ጫማ ያድርጉ።",
    maternalTipEn: "Elevate your feet when resting to reduce normal ankle swelling.",
  },
  36: {
    week: 36,
    sizeAm: "የአናናስ መጠን (Pineapple)",
    sizeEn: "Pineapple (47 cm / 2.6 kg)",
    weightGrams: 2600,
    lengthCm: 47.0,
    emoji: "🍍",
    milestoneAm: "ሳንባዎቻቸው ሙሉ በሙሉ ደርሰዋል፤ ለመወለድ ዝግጅት እያደረጉ ነው።",
    milestoneEn: "Lungs are mature and baby is settling head-down into the pelvis.",
    maternalTipAm: "የሆስፒታል ቦርሳዎን እና የትራንስፖርት እቅድዎን ያዘጋጁ።",
    maternalTipEn: "Pack your hospital bag and confirm your delivery facility plan.",
  },
  40: {
    week: 40,
    sizeAm: "የሐብሐብ መጠን (Watermelon)",
    sizeEn: "Watermelon (51 cm / 3.4 kg)",
    weightGrams: 3400,
    lengthCm: 51.0,
    emoji: "🍉",
    milestoneAm: "ልጅዎ ሙሉ በሙሉ አድጓል፤ ዓለምን ለመቀላቀል ዝግጁ ነው!",
    milestoneEn: "Fully developed, full term, and ready to meet you!",
    maternalTipAm: "የምጥ ምልክቶች (የሆድ ቁርጠት፣ የፈሳሽ መፍሰስ) ሲጀምሩ ወዲያው ወደ ሆስፒታል ይሂዱ።",
    maternalTipEn: "Head to your maternity hospital as soon as labor contractions begin.",
  },
};

export function getMilestoneForWeek(weeks: number): WeekMilestone {
  const boundedWeek = Math.max(4, Math.min(40, weeks));
  const keys = Object.keys(PREGNANCY_MILESTONES)
    .map(Number)
    .sort((a, b) => a - b);

  // Find nearest defined milestone
  let closest = keys[0];
  for (const k of keys) {
    if (boundedWeek >= k) {
      closest = k;
    }
  }

  const base = PREGNANCY_MILESTONES[closest];
  return {
    ...base,
    week: boundedWeek,
  };
}