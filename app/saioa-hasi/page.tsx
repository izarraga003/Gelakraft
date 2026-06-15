import type { Metadata } from 'next'
import AuthForm, { AuthHeader } from '@/components/auth/AuthForm'

export const metadata: Metadata = {
  title: 'Saioa hasi · GELAKRAFT',
  description: 'Sartu zure GELAKRAFT kontuan.',
}

export default function LoginPage() {
  return (
    <main className="auth-screen">
      <AuthHeader />
      <AuthForm
        eyebrow="Saioa hasi"
        title="Sartu kobazulora."
        subtitle="Idatzi zure helbide elektronikoa eta esteka bat bidaliko dizugu saioa hasteko. Pasahitzik ez dugu eskatzen."
        alternativeText="Ez duzu konturik oraindik?"
        alternativeLabel="Eman izena"
        alternativeHref="/izen-ematea"
      />
    </main>
  )
}
