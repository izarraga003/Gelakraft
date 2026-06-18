import { notFound } from 'next/navigation'
import { getClassroomSettings } from '@/lib/classroom/settings'
import KlaseEditor from './KlaseEditor'

type Params = { id: string }

export default async function KlaseKonfiguratu({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params
  const settings = await getClassroomSettings(id)
  if (!settings) notFound()

  return (
    <section className="konfiguratu-section">
      <header className="konfiguratu-section-header">
        <h2 className="konfiguratu-section-title">Klasearen konfigurazioa</h2>
        <p className="konfiguratu-section-hint">
          Klasearen izena eta asteko sariak ezarri. Asteko mana eta bihotzak
          automatikoki ematen zaizkie ikasleei astero, ez duzu ezer egin behar.
        </p>
      </header>

      <KlaseEditor settings={settings} />
    </section>
  )
}
