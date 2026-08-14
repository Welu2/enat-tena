interface StepProgressProps {
  currentStep: number;
  totalSteps?: number;
}

export function StepProgress({ currentStep, totalSteps = 3 }: StepProgressProps) {
  return (
    <div className="flex items-center gap-1.5 pt-1" aria-label={`Step ${currentStep} of ${totalSteps}`}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNumber) => (
        <span
          key={stepNumber}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            currentStep >= stepNumber ? "w-5 bg-brand-green" : "w-2 bg-[#C9BEAF]"
          }`}
        />
      ))}
    </div>
  );
}