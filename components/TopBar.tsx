import Link from 'next/link'
import Logo from './Logo'

/**
 * Barra superior fija del hero.
 * No es sticky en v1 — vive solo en la parte superior del hero.
 */
export default function TopBar() {
  return (
    <nav className="top-bar">
      <Link href="/" className="top-bar-logo" aria-label="GELAKRAFT hasiera-orria">
        <Logo size={32} textSize={22} />
      </Link>
      <div className="top-bar-actions">
        <a href="#tresnak" className="top-bar-link hide-mobile">
          Tresnak
        </a>
        <a href="#nor-gara" className="top-bar-link hide-mobile">
          Nor gara?
        </a>
        <Link href="/saioa-hasi" className="top-bar-link">
          Saioa hasi
        </Link>
      </div>
    </nav>
  )
}
