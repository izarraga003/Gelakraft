import type { Metadata } from 'next'
import AuthForm, { AuthHeader } from '@/components/auth/AuthForm'

export const metadata: Metadata = {
  title: 'Pasahitza berreskuratu · GELAKRAFT',
  description: 'Berreskuratu zure GELAKRAFT pasahitza.',
}

export default function ForgotPasswordPage() {
  return (
    <main className="auth-screen">
      <AuthHeader />
      <AuthForm
        mode="forgot"
        eyebrow="Pasahitza berreskuratu"
        title="Esteka berri bat bidaliko dizugu."
        subtitle="Sartu zure helbide elektronikoa eta esteka bat bidaliko dizugu pasahitz berri bat sortzeko."
        alternativeText="Pasahitza gogoratu duzu?"
        alternativeLabel="Saioa hasi"
        alternativeHref="/saioa-hasi"
      />
    </main>
  )
}
