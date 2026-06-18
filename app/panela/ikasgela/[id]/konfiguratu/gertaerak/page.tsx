import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UstekabekoaSetup from '@/components/tools/UstekabekoaSetup'

type Params = { id: string }

export default async function GertaerakPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: classroom } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('id', id)
    .single()
  if (!classroom) notFound()

  const { data: events } = await supabase
    .from('events')
    .select('id, title, description')
    .order('created_at', { ascending: true })

  return (
    <section className="konfiguratu-section">
      <header className="konfiguratu-section-header">
        <h2 className="konfiguratu-section-title">Ustekabeko gertaerak</h2>
        <p className="konfiguratu-section-hint">
          Kudeatu klaseko gertaeren katalogoa: editatu, gehitu edo ezabatu.
        </p>
      </header>

      <UstekabekoaSetup
        classroomId={classroom.id}
        classroomName={classroom.name}
        initialEvents={events ?? []}
      />
    </section>
  )
}
