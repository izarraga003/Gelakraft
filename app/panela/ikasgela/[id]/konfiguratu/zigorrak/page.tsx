import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listBehaviors } from '@/lib/behaviors/actions'
import BehaviorsEditor from '../../jokabideak/BehaviorsEditor'

type Params = { id: string }

export default async function ZigorrakPage({
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

  const result = await listBehaviors(id)
  const behaviors = result.success ? result.behaviors : []

  return (
    <section className="konfiguratu-section">
      <header className="konfiguratu-section-header">
        <h2 className="konfiguratu-section-title">Zigorrak</h2>
        <p className="konfiguratu-section-hint">
          Ikasleek bihotzak galtzeko jokabideak. Hauek aplikatzean, bihotzak
          kentzen zaizkie.
        </p>
      </header>

      <BehaviorsEditor classroomId={id} initial={behaviors} filter="negative" />
    </section>
  )
}
