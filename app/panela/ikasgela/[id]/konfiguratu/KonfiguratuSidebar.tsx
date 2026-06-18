'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS: { slug: string; label: string; icon: string }[] = [
  { slug: '', label: 'Klasea', icon: '🏛️' },
  { slug: 'ikasleak', label: 'Ikasleak', icon: '🧑‍🎓' },
  { slug: 'sariak', label: 'Sariak', icon: '👍' },
  { slug: 'zigorrak', label: 'Zigorrak', icon: '⚠️' },
  { slug: 'botereak', label: 'Botereak', icon: '✨' },
  { slug: 'patuak', label: 'Patuaren erronkak', icon: '🎲' },
  { slug: 'taldeak', label: 'Taldeak', icon: '👥' },
  { slug: 'gertaerak', label: 'Ustekabeko gertaerak', icon: '📜' },
]

export default function KonfiguratuSidebar({
  classroomId,
}: {
  classroomId: string
}) {
  const pathname = usePathname()
  const base = `/panela/ikasgela/${classroomId}/konfiguratu`

  return (
    <aside className="konfiguratu-sidebar" aria-label="Konfigurazio menua">
      <nav>
        <ul className="konfiguratu-nav">
          {ITEMS.map((it) => {
            const href = it.slug ? `${base}/${it.slug}` : base
            const isActive =
              it.slug === ''
                ? pathname === base
                : pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={it.slug || 'root'}>
                <Link
                  href={href}
                  className={`konfiguratu-nav-link ${
                    isActive ? 'konfiguratu-nav-link-active' : ''
                  }`}
                >
                  <span className="konfiguratu-nav-icon" aria-hidden="true">
                    {it.icon}
                  </span>
                  <span className="konfiguratu-nav-label">{it.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
