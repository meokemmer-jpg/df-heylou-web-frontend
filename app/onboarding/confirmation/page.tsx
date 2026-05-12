import Link from "next/link";

export default function OnboardingConfirmationPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16 text-center">
      <h1 className="text-3xl font-bold text-heylou-success">Onboarding abgeschlossen</h1>
      <p className="mt-4 text-neutral-700">
        Dein Hotel ist eingerichtet. 9OS-NEXT ist verbunden.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 inline-block rounded-md bg-heylou-primary px-8 py-3 text-white"
      >
        Zum Dashboard
      </Link>
    </main>
  );
}
