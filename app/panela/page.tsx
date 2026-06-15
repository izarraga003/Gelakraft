import { createClient } from '@/lib/supabase/server'
import { FlameIcon, SilenceMoonIcon, ChestIcon, HourglassIcon, StopwatchIcon, D20Icon } from '@/components/icons'

/**
 * Página principal del panel.
 * Muestra:
 *  - Bienvenida con el email del profesor
 *  - Lista de ikasgelak (vacía en v1)
 *  - Las 6 herramientas como placeholders
 */
export default async function PanelPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Leer las ikasgelak del profesor (gracias a RLS, solo verá las suyas)
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('id, name, stage, created_at')
    .order('created_at', { ascending: false })

  const hasClassrooms = classrooms && classrooms.length > 0

  return (
    <div className="panel-content">
      <section className="panel-welcome">
        <div className="panel-eyebrow">Ongi etorri</div>
        <h1 className="panel-title">Zure kobazulora sartu zara.</h1>
        <p className="panel-subtitle">
          Hau zure kontrol-panela da. Hemendik kudeatuko dituzu zure ikasgelak eta tresnak.
          Oraindik garapenean dago — laster gehiago.
        </p>
      </section>

      <section className="panel-section">
        <div className="panel-section-header">
          <h2 className="panel-section-title">Zure ikasgelak</h2>
          <button type="button" className="panel-cta-btn" disabled>
            + Ikasgela berria
            <span className="panel-soon-badge">laster</span>
          </button>
        </div>

        {hasClassrooms ? (
          <div className="panel-classrooms-grid">
            {classrooms.map((c) => (
              <article key={c.id} className="panel-classroom-card">
                <h3>{c.name}</h3>
                <p>{c.stage}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel-empty-state">
            <p>Oraindik ez duzu ikasgelarik sortu.</p>
            <p className="panel-empty-hint">
              Hurrengo bertsioan ikasgelak sortzeko aukera izango duzu.
            </p>
          </div>
        )}
      </section>

      <section className="panel-section">
        <div className="panel-section-header">
          <h2 className="panel-section-title">Tresnak</h2>
          <span className="panel-section-hint">Datozen astetan eskuragarri</span>
        </div>

        <div className="panel-tools-grid">
          <PanelToolPlaceholder roman="I" name="Sugaarren aurkako borroka" icon={<FlameIcon size={32} />} />
          <PanelToolPlaceholder roman="II" name="Mariren isiltasun-erronka" icon={<SilenceMoonIcon size={32} />} />
          <PanelToolPlaceholder roman="III" name="Ustekabeko gertaera" icon={<ChestIcon size={32} />} />
          <PanelToolPlaceholder roman="IV" name="Atzerako kontaketa" icon={<HourglassIcon size={32} />} />
          <PanelToolPlaceholder roman="V" name="Kronometroa" icon={<StopwatchIcon size={32} />} />
          <PanelToolPlaceholder roman="VI" name="Ausazko hautatzailea" icon={<D20Icon size={32} />} />
        </div>
      </section>

      <section className="panel-meta">
        <p>
          GELAKRAFTen lehen bertsioa da hau. Egiten ari garen aurrerapen guztiak email bidez
          jakinaraziko dizkizugu zure helbidean: <strong>{user?.email}</strong>
        </p>
      </section>
    </div>
  )
}

function PanelToolPlaceholder({
  roman,
  name,
  icon,
}: {
  roman: string
  name: string
  icon: React.ReactNode
}) {
  return (
    <article className="panel-tool-card">
      <div className="panel-tool-header">
        <span className="panel-tool-icon">{icon}</span>
        <span className="panel-tool-roman">{roman}</span>
      </div>
      <h3 className="panel-tool-name">{name}</h3>
      <span className="panel-soon-badge">laster</span>
    </article>
  )
}
