import MissionMapBackground from '@/components/missions/MissionMapBackground'

/**
 * Sección de la landing que explica el sistema de misiones.
 * Insertar en app/page.tsx (después de MythologySection y antes de footer).
 */
export default function MissionsLandingSection() {
  return (
    <section className="missions-landing-section">
      <div className="container">
        <div className="missions-landing-intro">
          <div className="heroes-eyebrow">Abentura mapak</div>
          <h2 className="missions-landing-title">
            <span className="accent">Misioak</span>: ikasketa abentura epiko bihurtu.
          </h2>
          <p className="missions-landing-lead">
            Sortu zure ariketak eta erronkak euskal mitologiako mapa interaktibo
            batean. Ikasleek nodoz nodo aurreratzen dute, bideoekin, PDFekin eta
            ariketekin. Aukeratu mapa, gehitu helburuak eta jarraitu klasearen
            aurrerapena denbora errealean.
          </p>
        </div>

        {/* Preview de 3 mapas */}
        <div className="missions-landing-maps">
          {(['anboto', 'itsasoa', 'iratia'] as const).map((m) => (
            <div key={m} className="missions-landing-map">
              <MissionMapBackground mapId={m} />
              <span className="missions-landing-map-label">
                {m === 'anboto'
                  ? 'Anboto'
                  : m === 'itsasoa'
                  ? 'Itsasoa'
                  : 'Iratiko basoa'}
              </span>
            </div>
          ))}
        </div>

        {/* Cómo funciona en 3 pasos */}
        <div className="missions-landing-steps">
          <div className="missions-landing-step">
            <span className="missions-landing-step-num">1</span>
            <h3>Sortu mapa</h3>
            <p>
              Aukeratu euskal mitologiako mapa bat: Anboto, Iratiko basoa,
              kobazuloa, itsasoa... bakoitzak bere giro eta narratiba dauka.
            </p>
          </div>
          <div className="missions-landing-step">
            <span className="missions-landing-step-num">2</span>
            <h3>Gehitu helburuak</h3>
            <p>
              Sakatu mapan eta jarri nodoak: testua, PDFa, irudia, YouTube
              bideoa edo esteka. Konektatu nodoen artean ibilbide nagusiak eta
              alternatiboak sortzeko.
            </p>
          </div>
          <div className="missions-landing-step">
            <span className="missions-landing-step-num">3</span>
            <h3>Ikasleek aurreratzen dute</h3>
            <p>
              Helburu bakoitzak XP, bihotzak edo mana ematen ditu. Hutsegiteek
              zigorra dakar. Ikasle bakoitzak bere erritmoan eraikitzen du
              abentura.
            </p>
          </div>
        </div>

        {/* Features list */}
        <div className="missions-landing-features">
          <div className="missions-landing-feature">
            <span className="missions-landing-feature-icon">🗺️</span>
            <div>
              <strong>5 mapa tematiko</strong>
              <p>Anboto, Itsasoa, Basoa, Kobazuloa eta Iratiko basoa.</p>
            </div>
          </div>
          <div className="missions-landing-feature">
            <span className="missions-landing-feature-icon">🎬</span>
            <div>
              <strong>Multimedia</strong>
              <p>Testua, PDFa, irudiak, YouTube bideoak edo kanpoko estekak.</p>
            </div>
          </div>
          <div className="missions-landing-feature">
            <span className="missions-landing-feature-icon">🔀</span>
            <div>
              <strong>Bide adarkatuak</strong>
              <p>Asmatuz indartze-ibilbidera. Hutsegitean errefortzu-ibilbidera.</p>
            </div>
          </div>
          <div className="missions-landing-feature">
            <span className="missions-landing-feature-icon">✓</span>
            <div>
              <strong>Eskuzko edo automatiko</strong>
              <p>Irakasleak berretsi edo automatikoki onartu entrega bakoitza.</p>
            </div>
          </div>
          <div className="missions-landing-feature">
            <span className="missions-landing-feature-icon">📊</span>
            <div>
              <strong>Aurrerapena denbora errealean</strong>
              <p>Ikusi nor non doan ikasgela osoan, edozein unetan.</p>
            </div>
          </div>
          <div className="missions-landing-feature">
            <span className="missions-landing-feature-icon">🏆</span>
            <div>
              <strong>Amaierako saria</strong>
              <p>Misio osoa amaitzean, gehigarrizko XP, bihotzak eta mana.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
