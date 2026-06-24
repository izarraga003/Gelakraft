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
      <Link href="/ikasle/sartu" className="auth-role-switch">
        <span className="auth-role-switch-icon" aria-hidden="true">🎓</span>
        <span className="auth-role-switch-text">
          <span className="auth-role-switch-label">Ikaslea zara?</span>
          <span className="auth-role-switch-action">Sartu hemen</span>
        </span>
        <span className="auth-role-switch-arrow" aria-hidden="true">→</span>
      </Link>
    </main>
  )
}
