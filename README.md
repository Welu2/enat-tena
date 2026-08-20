# Enat Tena (እናት ጤና) — Frontend

Voice-first antenatal care (ANC) web application built for expectant mothers in Ethiopia. Enat Tena provides daily voice check-ins in **Amharic** and **English**, automatic clinical entity extraction, danger sign triage, and clinician summary reports accessible via QR code.

---

## Features

* **Voice Check-in Wizard**
  * 4-step sequential questionnaire: Symptoms, Food intake, Supplement adherence (Iron/Folic acid), and Open closing notes.
  * In-browser `audio/webm` recording with MediaRecorder API.
  * Speech recognition (ASR) and clinical entity extraction via Addis AI.
  * Amharic Text-to-Speech (TTS) audio playback on all questions.
  * Item verification list with voice re-recording and manual inline edit.
  * Instant obstetric danger sign detection and triage alert banners.

* **Clinician Summary & QR Sharing**
  * Automatically aggregates patient history across visits into clinician-ready summaries.
  * Visualizes supplement compliance percentages ($Taken / Tracked$).
  * Lists logged danger signs with exact timestamps and severity levels.
  * Includes standing clinical reminders (e.g., MUAC screening).
  * Generates doctor-facing share links and downloadable QR codes for clinic visits.

* **Check-in History & Daily Logs**
  * Calendar-grouped daily check-ins with symptoms, food logs, and adherence flags.
  * Dedicated check-in inspection page (`/history/[id]`).

* **Interactive Onboarding**
  * Guided onboarding flow for supplements, ANC appointment scheduling, and microphone permissions.
  * Read-aloud voice support on every onboarding step.

---

## Tech Stack

* **Framework:** Next.js (App Router, Turbopack)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Audio & Voice:** Web Audio API, MediaRecorder (`audio/webm`), Addis AI ASR / TTS
* **State Management:** React Context (`LanguageContext`), Custom React Hooks

---

## Project Structure

```text
├── app/
│   ├── checkin/               # 4-stage voice check-in wizard
│   ├── history/               # Check-in log list & detail view ([id])
│   ├── home/                  # Patient dashboard & quick actions
│   ├── onboarding/            # Setup (supplements, ANC date, mic permission)
│   ├── report/                # Clinician health summary & QR generator
│   └── summary/public/[slug]/ # Doctor-facing public summary view
├── components/
│   ├── checkin/               # Recording controls, stage prompts, verification list
│   ├── history/               # Daily log cards and danger alerts
│   ├── report/                # Summary hero, adherence meter, danger list
│   ├── BottomNav.tsx          # Mobile navigation bar
│   └── Header.tsx             # Global header with language toggle
├── context/
│   └── LanguageContext.tsx    # Amharic ('am') / English ('en') state provider
├── hooks/
│   ├── useAggregatedCheckinDetail.ts # Check-in detail fetcher
│   ├── useCheckinSession.ts   # Check-in state machine & stage navigator
│   ├── useClinicianReport.ts  # Summary fetching, generation & regeneration
│   ├── useTTSAudio.ts         # Voice synthesis & audio streaming
│   └── useVoiceRecorder.ts    # WebM media recorder & stream handler
├── lib/
│   ├── api.ts                 # Backend REST client
│   └── dateUtils.ts           # Synced date formatting utilities
├── types/
│   ├── api.ts                 # Check-in models & pending verification items
│   ├── checkin.ts             # Check-in step maps & stages
│   └── report.ts              # Clinician summary & adherence types
└── utils/
    ├── checkinPrompts.ts      # Stage prompt strings (Amharic/English)
    ├── historyHelpers.ts      # Check-in history deduplication & parsing
    └── reportHelpers.ts       # Summary math & date range formatters
