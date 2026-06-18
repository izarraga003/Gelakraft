import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getStudent } from '@/lib/students/session'
import { loadStudentDashboard } from '@/lib/students/dashboard'
import { MoonIcon } from '@/components/icons'
import HeroCard from '@/components/student/HeroCard'
import ClassroomRanking from '@/components/student/ClassroomRanking'
import ActivityLog from '@/components/student/ActivityLog'

export default async function StudentPanelPage() {
  const sessionStudent = await getStudent()
  if (!sessionStudent) {
    redirect('/ikasle/sartu')
  }

  const data = await loadStudentDashboard(sessionStudent.studentId)
  if (!data) {
    return (
      <div className="student-shell">
        <header className="student-header">
          <Link href="/ikasle/panela" className="student-logo">
            <MoonIcon size={28} />
            <span className="student-logo-text">GELAKRAFT</span>
          </Link>
          <form action="/ikasle/atera" method="POST">
            <button type="submit" className="student-logout-btn">
              Atera
            </button>
          </form>
        </header>
        <main className="student-main">
          <p style={{ color: 'rgba(239, 229, 208, 0.7)', textAlign: 'center' }}>
            Errore bat gertatu da datuak kargatzean. Saiatu berriro.
          </p>
        </main>
      </div>
    )
  }

  const { student, classroom, ranking, position, activities } = data

  return (
    <div className="student-shell">
      <header className="student-header">
        <Link href="/ikasle/panela" className="student-logo">
          <MoonIcon size={28} />
          <span className="student-logo-text">GELAKRAFT</span>
        </Link>
        <div className="student-user">
          <span className="student-user-avatar" aria-hidden="true">
            {student.avatar}
          </span>
          <span className="student-user-name">{student.full_name}</span>
          <form action="/ikasle/atera" method="POST">
            <button type="submit" className="student-logout-btn">
              Atera
            </button>
          </form>
        </div>
      </header>

      <main className="student-main">
        <div className="student-classroom-banner">
          <span className="student-classroom-eyebrow">Ikasgela</span>
          <h2 className="student-classroom-name">{classroom.name}</h2>
        </div>

        <HeroCard
          avatar={student.avatar}
          fullName={student.full_name}
          username={student.username}
          heroClass={student.hero_class}
          xp={student.xp}
          hearts={student.hearts}
          maxHearts={student.max_hearts}
          mana={student.mana}
          maxMana={student.max_mana}
        />

        <div className="student-grid">
          <ClassroomRanking
            ranking={ranking}
            currentStudentId={student.id}
            position={position}
          />
          <ActivityLog activities={activities} />
        </div>
      </main>
    </div>
  )
}
