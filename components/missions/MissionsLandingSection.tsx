import MissionMapBackground from '@/components/missions/MissionMapBackground'
import Link from 'next/link'

/**
 * Sección de landing que explica las misiones a los visitantes.
 * Insertar en app/page.tsx donde quieras.
 *
 * NOTA: el botón CTA enlaza a "/" por defecto. Si tienes una ruta
 * específica de login (p.ej. /login o /saio-hasi), cámbiala abajo.
 */
export default function MissionsLandingSection() {
  return (
    <section className="landing-missions">
      <div className="landing-missions-bg-decoration" aria-hidden="true">
        <div className="landing-missions-circle landing-missions-circle-1" />
        <div className="landing-missions-circle landing-missions-circle-2" />
      </div>

      <div className="landing-missions-container">
        <div className="landing-missions-hero">
          <span className="landing-missions-tagline">Misioak</span>
          <h2 className="landing-missions-title">
            Ibilbide gamifikatuak
            <br />
            <span>euskal mitologiaren mapan</span>
          </h2>
          <p className="landing-missions-subtitle">
            Diseinatu zure ikasleentzako abentura interaktiboak. Helburuz
            helburu egingo dute aurrera, sariak lortuko dituzte eta
            erronkak desblokeatzen joango dira — Mariren mendian,
            lamien itsasoan edo jentilen burdinolan.
          </p>
        </div>

        <div className="landing-missions-maps">
          <article className="landing-missions-map">
            <div className="landing-missions-map-bg">
              <MissionMapBackground mapId="anboto" />
            </div>
            <div className="landing-missions-map-text">
              <h3>Anboto</h3>
              <p>Mariren bizilekua, ekaitzen menpe.</p>
            </div>
          </article>

          <article className="landing-missions-map">
            <div className="landing-missions-map-bg">
              <MissionMapBackground mapId="itsasoa" />
            </div>
            <div className="landing-missions-map-text">
              <h3>Itsasoa</h3>
              <p>Lamiak orraztu eta abesten dute.</p>
            </div>
          </article>

          <article className="landing-missions-map">
            <div className="landing-missions-map-bg">
              <MissionMapBackground mapId="akelarre" />
            </div>
            <div className="landing-missions-map-text">
              <h3>Akelarrea</h3>
              <p>Sorginen bilkura, ilargi betearen pean.</p>
            </div>
          </article>
        </div>

        <p className="landing-missions-maps-foot">
          10 mapa daude eskuragarri, bakoitza euskal mitologiaren elementu
          propioekin. Aukeratu misioarekin bat datorrena.
        </p>

        <div className="landing-missions-pillars">
          <article className="landing-missions-pillar">
            <div className="landing-missions-pillar-icon">🗺️</div>
            <h3>Zer dira?</h3>
            <p>
              Helburuen ibilbidea, euskal mitologiaren mapen gainean
              diseinatua. Zuk erabakitzen duzu nodoz nodo zer ordenetan
              joango diren, zer eduki landuko duten eta nola
              desblokeatzen den hurrengoa.
            </p>
          </article>

          <article className="landing-missions-pillar">
            <div className="landing-missions-pillar-icon">🎯</div>
            <h3>Zertarako?</h3>
            <p>
              Ikasleak bere erritmoan autonomoki ikasteko. Bakoitzaren
              aurrerapena momentu oro ikus dezakezu, eta nodo bakoitzak
              XP, bihotzak edo mana ematen ditu — Gelakraften gainerako
              sistemarekin lotuta.
            </p>
          </article>

          <article className="landing-missions-pillar">
            <div className="landing-missions-pillar-icon">⚡</div>
            <h3>Nola erabili?</h3>
            <p>
              Aukeratu mapa, marraztu helburuak klik bakar batekin, lotu
              haien artean eta gehitu edukia: testua, bideoa, PDF edo
              esteka. Aktibatu eta ikasleek beren panelean ikusiko dute
              berehala.
            </p>
          </article>
        </div>

        <div className="landing-missions-features">
          <div className="landing-missions-feature">
            <strong>Auto edo eskuzko onarpena</strong>
            <span>
              Nahi duzunean ikasleak entregatu eta automatikoki osatzen
              da, edo zuk eskuz berresten duzu.
            </span>
          </div>
          <div className="landing-missions-feature">
            <strong>Adar-egiturak</strong>
            <span>
              Asmatzen badu hurrengoa, huts egiten badu beste bidetik —
              bakoitzak bere ikaste-bidea.
            </span>
          </div>
          <div className="landing-missions-feature">
            <strong>Amaierako sariak</strong>
            <span>
              Misio osoa amaitzean sari gehigarriak: titulu, bonifikazio
              edota botere berriak.
            </span>
          </div>
          <div className="landing-missions-feature">
            <strong>Aulako garapena</strong>
            <span>
              Nodoz nodo ikusten duzu nork osatu duen, nork duen zai
              berrikuspena eta nor ez den oraindik abiatu.
            </span>
          </div>
        </div>

        <div className="landing-missions-cta">
          <h3>Prest zaude lehen misioa diseinatzeko?</h3>
          <p>Hasi eta aulako lehen ibilbidea sortu minutu gutxitan.</p>
          {/* Cambia "/" por tu ruta de login real si la tienes (p.ej. "/login") */}
          <Link href="/" className="landing-missions-cta-btn">
            Hasi orain →
          </Link>
        </div>
      </div>
    </section>
  )
}
