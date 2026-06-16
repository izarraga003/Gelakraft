import Link from 'next/link'
import { MoonIcon } from './icons'

/**
 * Footer del sitio.
 * 4 columnas en desktop, 1 columna en mobile.
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
              <a href="#tresnak">Sugaarren aurkako borroka</a>
            </li>
            <li>
              <a href="#tresnak">Mariren isiltasun-erronka</a>
            </li>
            <li>
              <a href="#tresnak">Ustekabeko gertaera</a>
            </li>
            <li>
              <a href="#tresnak">Atzerako kontaketa</a>
            </li>
            <li>
              <a href="#tresnak">Kronometroa</a>
            </li>
            <li>
              <a href="#tresnak">Ausazko hautatzailea</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Sartu</h4>
          <ul>
            <li>
              <Link href="/saioa-hasi">Irakaslea zara?</Link>
            </li>
            <li>
              <Link href="/ikasle/sartu">Ikaslea zara?</Link>
            </li>
            <li>
              <Link href="/izen-ematea">Izen-ematea</Link>
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
              <a href="mailto:info@gelakraft.eus">Kontaktua</a>
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
