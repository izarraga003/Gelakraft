import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MoonIcon } from '@/components/icons'
import AmbientMusic from '@/components/audio/AmbientMusic'

/**
 * Layout protegido del panel.
 *
 * El middleware ya redirige a /saioa-hasi si no hay sesión, pero
 * hacemos doble check aquí por seguridad (defense in depth).
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/saioa-hasi')
  }

  return (
    <div className="panel-shell">
      <header className="panel-header">
        <Link href="/panela" className="panel-logo" aria-label="Panela">
          <MoonIcon size={28} />
          <span className="panel-logo-text">GELAKRAFT</span>
          <span className="panel-logo-suffix">/ Panela</span>
        </Link>

        <div className="panel-user">
          <AmbientMusic />
          <span className="panel-user-email" title={user.email ?? ''}>
            {user.email}
          </span>
          <form action="/auth/saioa-itxi" method="POST">
            <button type="submit" className="panel-logout-btn">
              Saioa itxi
            </button>
          </form>
        </div>
      </header>

      <main className="panel-main">{children}</main>
    </div>
  )
}
