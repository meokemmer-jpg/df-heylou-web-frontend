interface WizardStepProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  children: React.ReactNode;
}

export function WizardStep({ currentStep, totalSteps, title, children }: WizardStepProps) {
  return (
    <section aria-labelledby={`step-${currentStep}-title`}>
      <p className="text-sm text-neutral-500">Schritt {currentStep}/{totalSteps}</p>
      <h2 id={`step-${currentStep}-title`} className="text-2xl font-bold">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}
