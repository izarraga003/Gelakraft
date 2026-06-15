import Link from 'next/link'
import { MoonHaloIcon, ArrowRightIcon } from './icons'

/**
 * Llamada a la acción final, antes del footer.
 * Fondo oscuro con starfield, luna grande con halo y dos botones.
 */
export default function CTASection() {
  return (
    <section className="cta-section">
      <div className="cta-content">
        <div className="cta-moon">
          <MoonHaloIcon size={72} />
        </div>

        <div className="cta-eyebrow">Has gaitezen</div>

        <h2 className="cta-title">
          Sartu.
          <br />
          Atea irekita dago.
        </h2>

        <p className="cta-sub">
          Hasi GELAKRAFT erabiltzen orain bertan. Sei tresna eskuragarri, izen-ematea segundo
          batzuetan.
        </p>

        <div className="cta-buttons">
          <Link href="/izen-ematea" className="btn-primary">
            Izen-ematea
            <ArrowRightIcon />
          </Link>
          <a href="#tresnak" className="btn-secondary">
            Tresnak probatu →
          </a>
        </div>

        <p className="cta-trust">Doan, konfigurazio barik.</p>
      </div>
    </section>
  )
}
