import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getStudent } from '@/lib/students/session'
import { MoonIcon } from '@/components/icons'
import {
  FlameIcon,
  SilenceMoonIcon,
  ChestIcon,
  HourglassIcon,
  StopwatchIcon,
  D20Icon,
} from '@/components/icons'

export default async function StudentPanelPage() {
  const student = await getStudent()
  if (!student) {
    redirect('/ikasle/sartu')
  }

  return (
    <div className="student-shell">
      <header className="student-header">
        <Link href="/ikasle/panela" className="student-logo">
          <MoonIcon size={28} />
          <span className="student-logo-text">GELAKRAFT</span>
        </Link>
        <div className="student-user">
          <span className="student-user-name" title={student.username}>
            {student.fullName}
          </span>
          <form action="/ikasle/atera" method="POST">
            <button type="submit" className="student-logout-btn">
              Atera
            </button>
          </form>
        </div>
      </header>

      <main className="student-main">
        <section className="student-welcome">
          <div className="student-eyebrow">Ongi etorri</div>
          <h1 className="student-title">{student.fullName}, prest abenturara?</h1>
          <p className="student-subtitle">
            Hau zure heroi-eremua da. Tresnak laster eskuragarri egongo dira eta zure
            irakasleak abiarazten dituenean parte hartuko duzu.
          </p>
        </section>

        <section className="student-tools-section">
          <h2 className="student-section-title">Aurki etorriko diren tresnak</h2>
          <div className="student-tools-grid">
            <StudentToolCard
              roman="I"
              name="Sugaarren aurkako borroka"
              icon={<FlameIcon size={36} />}
            />
            <StudentToolCard
              roman="II"
              name="Mariren isiltasun-erronka"
              icon={<SilenceMoonIcon size={36} />}
            />
            <StudentToolCard
              roman="III"
              name="Ustekabeko gertaera"
              icon={<ChestIcon size={36} />}
            />
            <StudentToolCard
              roman="IV"
              name="Atzerako kontaketa"
              icon={<HourglassIcon size={36} />}
            />
            <StudentToolCard
              roman="V"
              name="Kronometroa"
              icon={<StopwatchIcon size={36} />}
            />
            <StudentToolCard
              roman="VI"
              name="Ausazko hautatzailea"
              icon={<D20Icon size={36} />}
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function StudentToolCard({
  roman,
  name,
  icon,
}: {
  roman: string
  name: string
  icon: React.ReactNode
}) {
  return (
    <article className="student-tool-card">
      <div className="student-tool-icon">{icon}</div>
      <div className="student-tool-roman">{roman}</div>
      <h3 className="student-tool-name">{name}</h3>
      <span className="student-soon-badge">laster</span>
    </article>
  )
}
