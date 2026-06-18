import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEffectivePowers } from '@/lib/powers/overrides'
import BotereakEditor from './BotereakEditor'

type Params = { id: string }

export default async function BotereakPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id')
    .eq('id', id)
    .single()
  if (!classroom) notFound()

  const [sorgina, lamia, jentila] = await Promise.all([
    getEffectivePowers(id, 'sorgina'),
    getEffectivePowers(id, 'lamia'),
    getEffectivePowers(id, 'jentila'),
  ])

  return (
    <section className="konfiguratu-section">
      <header className="konfiguratu-section-header">
        <h2 className="konfiguratu-section-title">Botereak</h2>
        <p className="konfiguratu-section-hint">
          Konfiguratu ikasleek erabili ditzaketen botereak. Markatu{' '}
          <strong>Baieztatu</strong> ikasleak eskaera bidali eta zuk onartu
          behar izateko. Bestela, boterea automatikoki aplikatuko da ikasleak
          erabiltzean.
        </p>
      </header>

      <BotereakEditor
        classroomId={id}
        groups={[
          { heroClass: 'sorgina', label: 'Sorgina', powers: sorgina },
          { heroClass: 'lamia', label: 'Lamia', powers: lamia },
          { heroClass: 'jentila', label: 'Jentila', powers: jentila },
        ]}
      />
    </section>
  )
}
