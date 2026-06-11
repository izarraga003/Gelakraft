import { MoonIcon } from './icons'

/**
 * Footer del sitio.
 * 3 columnas en desktop, 1 columna en mobile.
 */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-col footer-brand">
          <div className="footer-brand-logo">
            <MoonIcon size={36} />
            <span className="footer-brand-text">GELAKRAFT</span>
          </div>
          <p className="footer-brand-tagline">
            Anbotoko kobazulotik egina. Euskal mitologia, gamifikazioa eta jolasa, dena euskaraz.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Tresnak</h4>
          <ul>
            <li>
              <a href="#">Sugaarren aurkako borroka</a>
            </li>
            <li>
              <a href="#">Mariren isiltasun-erronka</a>
            </li>
            <li>
              <a href="#">Ustekabeko gertaera</a>
            </li>
            <li>
              <a href="#">Atzerako kontaketa</a>
            </li>
            <li>
              <a href="#">Kronometroa</a>
            </li>
            <li>
              <a href="#">Ausazko hautatzailea</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Proiektua</h4>
          <ul>
            <li>
              <a href="#">Nor gara?</a>
            </li>
            <li>
              <a href="#">Kontaktua</a>
            </li>
            <li>
              <a href="#">Pribatutasun politika</a>
            </li>
            <li>
              <a href="#">Erabilera baldintzak</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-copy">
          © 2026 GELAKRAFT · <a href="mailto:info@gelakraft.eus">info@gelakraft.eus</a>
        </div>
        <div className="footer-mark">Anbotoko kobazulotik · 2026</div>
      </div>
    </footer>
  )
}
