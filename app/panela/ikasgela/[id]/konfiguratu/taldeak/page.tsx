import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listTeams } from '@/lib/teams/actions'
import TeamsManager from '../../taldeak/TeamsManager'

type Params = { id: string }

export default async function KonfiguratuTaldeakPage({
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

  const { data: studentsAll } = await supabase
    .from('students')
    .select('id, full_name, hero_class, avatar_config, xp')
    .eq('classroom_id', id)
    .order('full_name', { ascending: true })

  const result = await listTeams(id)
  const teams = result.success ? result.teams : []

  // Calcular qué alumnos no están en ningún equipo
  const assigned = new Set<string>()
  for (const t of teams) for (const m of t.members) assigned.add(m.id)
  const unassigned = (studentsAll ?? []).filter((s) => !assigned.has(s.id))

  // Avisos de héroes faltantes
  const has = { sorgina: false, lamia: false, jentila: false }
  for (const s of studentsAll ?? []) has[s.hero_class as keyof typeof has] = true
  const missing: string[] = []
  if (!has.sorgina) missing.push('Sorgina')
  if (!has.lamia) missing.push('Lamia')
  if (!has.jentila) missing.push('Jentila')

  return (
    <section className="konfiguratu-section">
      <header className="konfiguratu-section-header">
        <h2 className="konfiguratu-section-title">Taldeak</h2>
        <p className="konfiguratu-section-hint">
          Sortu taldeak eta esleitu ikasleak. Talde bakoitzak komeni du
          sorgina, lamia eta jentila bana izatea, baina ez da derrigorrezkoa.
        </p>
      </header>

      {missing.length > 0 && (
        <div className="konfiguratu-warning">
          ⚠️ Klasean ez dago heroe mota guztiak:{' '}
          <strong>{missing.join(', ')}</strong> falta da. Hala ere, taldeak sor
          ditzakezu.
        </div>
      )}

      <TeamsManager
        classroomId={id}
        initialTeams={teams}
        initialUnassigned={unassigned}
      />
    </section>
  )
}
