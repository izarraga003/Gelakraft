import Logo from './Logo'

/**
 * Barra superior fija del hero.
 * No es sticky en v1 — vive solo en la parte superior del hero.
 */
export default function TopBar() {
  return (
    <nav className="top-bar">
      <a href="/" className="top-bar-logo" aria-label="GELAKRAFT hasiera-orria">
        <Logo size={32} textSize={22} />
      </a>
      <div className="top-bar-actions">
        <a href="#tresnak" className="top-bar-link hide-mobile">
          Tresnak
        </a>
        <a href="#nor-gara" className="top-bar-link hide-mobile">
          Nor gara?
        </a>
        <a href="#" className="top-bar-link">
          Saioa hasi
        </a>
      </div>
    </nav>
  )
}
