import { FoodGroup, GestationalAgeCalculation, PregnancyCountingMethod } from "@/types/api";

export interface OnboardingState {
  // Step 1: Demographics & Pregnancy Dating
  age: number | "";
  area: "urban" | "rural";
  hospital: string;
  datingMethod: PregnancyCountingMethod;
  lnmpDate: string;
  manualWeeks: number | "";
  manualDays: number | "";
  ultrasoundDate: string;
  ultrasoundWeeks: number | "";

  // Calculated Preview (Derived from backend /users/calculate-gestational-age)
  calculatedStatus: GestationalAgeCalculation | null;

  // Step 2: Obstetric History
  totalPregnancies: number | ""; // Gravida
  liveBirths: number | "";       // Para
  hadCSection: boolean;
  childPassedAway: boolean;
  pastComplications: string[];

  // Step 3: Medical History
  knownConditions: string[];
  customMedicalCondition: string;
  malariaEndemicArea: boolean;
  currentMedications: string;

  // Step 4: Supplements & Permissions
  takingSupplements: boolean;
  selectedSupplements: string[];
  micState: "prompt" | "granted" | "denied";
}

export interface StepComponentProps {
  data: OnboardingState;
  updateData: (fields: Partial<OnboardingState>) => void;
  isLoadingCalc?: boolean;
}