import Link from "next/link";

const STEPS = [
  { id: "email", label: "Email", href: "/onboarding/email" },
  { id: "phone", label: "Telefon", href: "/onboarding/phone" },
  { id: "hotel-data", label: "Hotel-Daten", href: "/onboarding/hotel-data" },
  { id: "9os-activation", label: "9OS aktivieren", href: "/onboarding/9os-activation" },
  { id: "confirmation", label: "Fertig", href: "/onboarding/confirmation" },
] as const;

export default function OnboardingIndex() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold">Hotelier-Onboarding</h1>
      <p className="mt-2 text-neutral-600">5 Schritte zu deinem Hey-Lou-Account.</p>
      <ol aria-label="Onboarding-Schritte" className="mt-8 space-y-3">
        {STEPS.map((step, i) => (
          <li key={step.id} className="flex items-center gap-4 rounded-md border border-neutral-200 bg-white p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-heylou-primary text-white">
              {i + 1}
            </span>
            <Link href={step.href} className="flex-1 text-lg font-medium hover:underline">
              {step.label}
            </Link>
          </li>
        ))}
      </ol>
      <Link
        href="/onboarding/email"
        className="mt-8 inline-block rounded-md bg-heylou-primary px-6 py-3 text-white"
      >
        Schritt 1 starten
      </Link>
    </main>
  );
}
