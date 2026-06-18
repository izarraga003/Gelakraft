import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listConsequences } from '@/lib/patuak/actions'
import PatuakEditor from './PatuakEditor'

type Params = { id: string }

export default async function PatuakPage({
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

  const result = await listConsequences(id)
  const items = result.success ? result.items : []

  return (
    <section className="konfiguratu-section">
      <header className="konfiguratu-section-header">
        <h2 className="konfiguratu-section-title">Patuaren erronkak</h2>
        <p className="konfiguratu-section-hint">
          Ikasle batek bihotz guztiak galtzean, patua zain geratuko zaio. Zuk
          panela nagusitik &laquo;Patua exekutatu&raquo; sakatzean, zerrenda
          honetako bat ausaz aukeratuko da. Ondoren, bihotzak osorik
          berreskuratuko ditu eta aurrera jarraituko du.
        </p>
      </header>

      <PatuakEditor classroomId={id} initial={items} />
    </section>
  )
}
