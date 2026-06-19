import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getStudent } from '@/lib/students/session'
import { loadStudentDashboard } from '@/lib/students/dashboard'
import { sanitizeAvatarConfig } from '@/lib/students/avatar'
import { xpToLevel } from '@/lib/students/level'
import { MoonIcon } from '@/components/icons'
import HeroCard from '@/components/student/HeroCard'
import ClassroomRanking from '@/components/student/ClassroomRanking'
import ActivityLog from '@/components/student/ActivityLog'
import AvatarRender from '@/components/student/AvatarRender'
import MyTeam from '@/components/student/MyTeam'
import MyPowers from '@/components/student/MyPowers'
import AmbientMusic from '@/components/audio/AmbientMusic'
import EmojiRain from '@/components/fun/EmojiRain'
import { getEffectivePowersForStudent } from '@/lib/powers/overrides'

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

  const { student, classroom, ranking, position, team, activities } = data
  const pendingRequests = data.pending_requests ?? []
  const safeAvatar = sanitizeAvatarConfig(student.avatar_config, 99)
  const level = xpToLevel(student.xp)
  const teamMembers = team?.members ?? []

  // Cargar poderes con overrides aplicados (el alumno usa iron-session,
  // así que llamamos a una RPC SECURITY DEFINER para bypassar RLS).
  const effectivePowers = await getEffectivePowersForStudent(
    student.classroom_id,
    student.hero_class
  )

  return (
    <div className="student-shell">
      <header className="student-header">
        <Link href="/ikasle/panela" className="student-logo">
          <MoonIcon size={28} />
          <span className="student-logo-text">GELAKRAFT</span>
        </Link>
        <div className="student-user">
          <EmojiRain emojis={['🌙', '✨', '⭐', '🐺', '🦉']} count={10}>
            <span className="student-user-avatar-mini" aria-hidden="true">
              <AvatarRender config={safeAvatar} size={36} />
            </span>
          </EmojiRain>
          <span className="student-user-name">{student.full_name}</span>
          <AmbientMusic />
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
          avatarConfig={safeAvatar}
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

        <div className="student-grid">
          <MyTeam team={team} currentStudentId={student.id} />
          <MyPowers
            level={level}
            mana={student.mana}
            studentId={student.id}
            teamMembers={teamMembers}
            pendingRequests={pendingRequests}
            powers={effectivePowers}
          />
        </div>
      </main>
    </div>
  )
}
