import type { Metadata } from 'next'
import Link from 'next/link'
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
        mode="login"
        eyebrow="Saioa hasi"
        title="Sartu kobazulora."
        subtitle="Sartu zure helbide elektronikoa eta pasahitza zure kontuan sartzeko."
        alternativeText="Ez duzu konturik oraindik?"
        alternativeLabel="Eman izena"
        alternativeHref="/izen-ematea"
      />
      <p className="auth-secondary-link">
        Ikaslea zara?{' '}
        <Link href="/ikasle/sartu" className="auth-link">
          Sartu hemen
        </Link>
      </p>
    </main>
  )
}
