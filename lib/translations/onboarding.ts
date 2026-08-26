export function getOnboardingText(lang: string) {
  const isAm = lang === "am";

  return {
    steps: {
      step1: isAm ? "እርግዝና እና አድራሻ" : "Dating & Demographics",
      step2: isAm ? "ያለፉ እርግዝናዎች" : "Obstetric History",
      step3: isAm ? "የጤና ሁኔታ" : "Medical History",
      step4: isAm ? "ማሟያ እና ፈቃድ" : "Supplements & Voice",
    },
    voiceReader: {
      readAloud: isAm ? "ጥያቄዎችን አድምጥ" : "Read Aloud",
      stop: isAm ? "አቁም" : "Stop Voice",
    },
    audioPrompts: {
      1: isAm
        ? "እባክዎ ዕድሜዎን፣ የመኖሪያ አካባቢዎን እና የመጨረሻ የወር አበባዎን ቀን ያስገቡ።"
        : "Please enter your age, area of residence, and your Last Normal Menstrual Period date.",
      2: isAm
        ? "ስለ ቀደምት እርግዝናዎችዎ፣ የቀዶ ህክምና ወይም ያጋጠሙ ችግሮችን ይንገሩን።"
        : "Tell us about your previous pregnancies, any complications, or C-sections.",
      3: isAm
        ? "የሚታወቅ የደም ግፊት፣ ስኳር ወይም የሚወስዱት መድኃኒት ካለ ይምረጡ።"
        : "Do you have any existing medical conditions or current prescription medications?",
      4: isAm
        ? "የሚወስዷቸውን የቫይታሚን ወይም የብረት ማሟያዎችን ይምረጡ፤ እንዲሁም የድምፅ ፍተሻ ፈቃድ ይስጡ።"
        : "Select any vitamins or iron supplements you take and enable microphone access for voice check-ins.",
    },
    step1: {
      title: isAm ? "የእርግዝና መረጃዎን እናስተካክል" : "Let's date your pregnancy",
      subtitle: isAm
        ? "ይህ የልጅዎን ዕድገት እና የክትትል ቀኖችን ለማስላት ይረዳል"
        : "This helps calculate your gestational age and WHO ANC schedule.",
      ageLabel: isAm ? "ዕድሜ (በዓመት)" : "Age (years)",
      agePlaceholder: isAm ? "ለምሳሌ 26" : "e.g. 26",
      areaLabel: isAm ? "የመኖሪያ አካባቢ" : "Residence Area",
      urban: isAm ? "ከተማ (Urban)" : "Urban",
      rural: isAm ? "ገጠር (Rural)" : "Rural",
      hospitalLabel: isAm ? "የመረጡት የጤና ተቋም / ሆስፒታል" : "Preferred Hospital / Facility",
      hospitalPlaceholder: isAm ? "ለምሳሌ ቅዱስ ጳውሎስ ሆስፒታል" : "e.g. St. Paul's Hospital Millennium Medical College",
      datingMethodLabel: isAm ? "የእርግዝና ስሌት ዘዴ" : "Pregnancy Calculation Method",
      lnmpMethod: isAm ? "የመጨረሻ የወር አበባ ቀን (LNMP)" : "Last Menstrual Period (LNMP)",
      ultrasoundMethod: isAm ? "የአልትራሳውንድ ምርመራ" : "Ultrasound Dating",
      manualMethod: isAm ? "ሳምንት በእጅ አስገባ" : "Manual Week Input",
      lnmpDateLabel: isAm ? "የመጨረሻ የወር አበባ የመጀመሪያ ቀን" : "First Day of Last Menstrual Period",
      manualWeeksLabel: isAm ? "የእርግዝና ሳምንት" : "Gestational Weeks",
      manualDaysLabel: isAm ? "ቀናት" : "Days",
      livePreviewTitle: isAm ? "የተሰላ የእርግዝና ሁኔታ" : "Live Pregnancy Calculation",
      eddLabel: isAm ? "የመውለጃ ቀን (EDD):" : "Estimated Due Date:",
      gaLabel: isAm ? "የእርግዝና ዕድሜ:" : "Gestational Age:",
    },
    step2: {
      title: isAm ? "የቀደምት እርግዝናዎች ታሪክ" : "Obstetric History",
      subtitle: isAm
        ? "ለደህንነትዎ ቅድመ ጥንቃቄ ለማድረግ ይረዳል"
        : "Helps tailor risk assessments for your current pregnancy.",
      gravidaLabel: isAm ? "ጠቅላላ የእርግዝና ብዛት (የአሁኑን ጨምሮ)" : "Total Pregnancies (including current)",
      paraLabel: isAm ? "በህይወት የተወለዱ ልጆች ብዛት" : "Live Births",
      cSectionLabel: isAm ? "የቀዶ ጥገና (C-Section) ወሊድ አጋጥሞዎታል?" : "Have you ever had a Cesarean delivery?",
      childLossLabel: isAm ? "በእርግዝና ወቅት ወይም ከተወለደ በኋላ የሞተ ልጅ አለ?" : "Any history of stillbirth or neonatal loss?",
      complicationsLabel: isAm ? "ያጋጠሙ የቀድሞ ችግሮች (ካሉ ይምረጡ)" : "Past Pregnancy Complications",
      complications: {
        preterm_birth: isAm ? "ያለጊዜው መወለድ (Preterm)" : "Preterm Birth (< 37 weeks)",
        pre_eclampsia: isAm ? "ፕሪ-ኤክላምፕሲያ (ከፍተኛ የደም ግፊት)" : "Pre-eclampsia / Toxemia",
        postpartum_hemorrhage: isAm ? "ከወሊድ በኋላ ደም መፍሰስ" : "Postpartum Hemorrhage (PPH)",
        gestational_diabetes: isAm ? "የእርግዝና ወቅት ስኳር በሽታ" : "Gestational Diabetes",
      },
    },
    step3: {
      title: isAm ? "የጤና ሁኔታ እና መድኃኒቶች" : "Medical History & Medications",
      subtitle: isAm
        ? "ለተገቢው ክትትል የሚታወቁ የጤና እክሎችን ይመዝግቡ"
        : "Record pre-existing conditions and current daily medications.",
      conditionsLabel: isAm ? "የሚታወቁ የጤና ሁኔታዎች" : "Known Medical Conditions",
      conditions: {
        hypertension: isAm ? "የደም ግፊት (Chronic Hypertension)" : "Chronic Hypertension",
        diabetes: isAm ? "የስኳር በሽታ (Pre-existing Diabetes)" : "Pre-existing Diabetes",
        anemia: isAm ? "የደም ማነስ (Anemia)" : "Anemia / Low Iron",
        cardiac_disease: isAm ? "የልብ ህመም" : "Cardiac Disease",
        other: isAm ? "ሌላ" : "Other",
      },
      customConditionLabel: isAm ? "ሌላ የጤና ሁኔታ ካለ ይጥቀሱ" : "Specify Other Medical Condition",
      customConditionPlaceholder: isAm ? "ለምሳሌ አስም" : "e.g. Mild Asthma",
      malariaLabel: isAm ? "የወባ በሽታ ባለበት አካባቢ ይኖራሉ?" : "Do you live in or frequently visit a malaria-endemic area?",
      medsLabel: isAm ? "በአሁኑ ሰዓት የሚወስዷቸው መድኃኒቶች" : "Current Daily Medications",
      medsPlaceholder: isAm ? "ለምሳሌ Methyldopa 250mg daily" : "e.g. Methyldopa 250mg daily, Aspirin 81mg",
    },
    step4: {
      title: isAm ? "ማሟያዎች እና የድምፅ ፈቃድ" : "Supplements & Voice Intake",
      subtitle: isAm
        ? "የቀን ማስታወሻዎችን ለማዘጋጀት እና በድምፅ ለመመዝገብ"
        : "Set up daily supplement reminders and enable voice check-ins.",
      takingSupplementsLabel: isAm ? "በአሁኑ ወቅት ማሟያ ወይም ቫይታሚን ይወስዳሉ?" : "Are you currently taking any prenatal supplements?",
      supplementsListLabel: isAm ? "የሚወስዷቸውን ማሟያዎች ይምረጡ:" : "Select your supplements:",
      supplements: {
        ifa: isAm ? "አይረን እና ፎሊክ አሲድ (IFA)" : "Iron & Folic Acid (IFA)",
        calcium: isAm ? "ካልሲየም (Calcium)" : "Calcium Supplement",
        mmn: isAm ? "ባለብዙ ማይክሮኒውትሪየንት (MMN)" : "Multiple Micronutrients (MMN)",
      },
      micCardTitle: isAm ? "የአማርኛ ድምፅ ፍተሻ (Voice Check-in)" : "Amharic Voice Check-in",
      micCardDesc: isAm
        ? "EnatAI ሳምንታዊ እና የቀን ምልክቶችን በድምፅ እንድትመዘግቡ ማይክሮፎን ይጠቀማል።"
        : "EnatAI uses your microphone for effortless spoken check-ins in Amharic.",
    },
    validation: {
      invalidAge: isAm ? "እባክዎ ትክክለኛ ዕድሜ ያስገቡ (12-60)" : "Please enter a valid age (12-60).",
      missingLnmpDate: isAm ? "እባክዎ የመጨረሻ የወር አበባ ቀንዎን ይምረጡ" : "Please select your LNMP date.",
      missingManualWeeks: isAm ? "እባክዎ የእርግዝና ሳምንትዎን ያስገቡ" : "Please enter your gestational weeks.",
      missingUltrasound: isAm ? "እባክዎ የአልትራሳውንድ መረጃዎን ያስገቡ" : "Please complete ultrasound details.",
    },
    actions: {
      continue: isAm ? "ቀጥል" : "Continue",
      back: isAm ? "ተመለስ" : "Back",
      allowMic: isAm ? "የማይክሮፎን ፈቃድ ስጥና ጨርስ" : "Allow Microphone & Finish",
      skipVoice: isAm ? "የድምፅ ፈቃድ ዝለልና ጨርስ" : "Skip Voice Permission & Finish",
      saving: isAm ? "መረጃዎን በመመዝገብ ላይ..." : "Registering Maternal Profile...",
    },
    toasts: {
      success: isAm ? "የእርግዝና መረጃዎ በተሳካ ሁኔታ ተመዝግቧል!" : "Maternal profile registered successfully!",
      error: isAm ? "መረጃውን ማስቀመጥ አልተቻለም። እባክዎ እንደገና ይሞክሩ።" : "Failed to register profile. Please try again.",
    },
  };
}