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
        eyebrow="Izen-ematea"
        title="Anbotoko atea ireki."
        subtitle="Eman izena GELAKRAFTen. Doan, segundo batzuetan. Email bat besterik ez dugu eskatzen — ezta pasahitzik ere."
        alternativeText="Baduzu kontua?"
        alternativeLabel="Saioa hasi"
        alternativeHref="/saioa-hasi"
      />
    </main>
  )
}
