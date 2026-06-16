import type { Metadata } from 'next'
import AuthForm, { AuthHeader } from '@/components/auth/AuthForm'

export const metadata: Metadata = {
  title: 'Izen-ematea · GELAKRAFT',
  description: 'Sortu zure GELAKRAFT kontua, doan.',
}

export default function SignupPage() {
  return (
    <main className="auth-screen">
      <AuthHeader />
      <AuthForm
        mode="signup"
        eyebrow="Izen-ematea"
        title="Anbotoko atea ireki."
        subtitle="Eman izena GELAKRAFTen. Doan, segundo batzuetan. Helbide elektroniko bat baieztatuko duzu eta pasahitz bat aukeratuko duzu."
        alternativeText="Baduzu kontua?"
        alternativeLabel="Saioa hasi"
        alternativeHref="/saioa-hasi"
      />
    </main>
  )
}
