import { getPowersForClass } from '@/lib/powers/catalog'
import type { HeroClass } from '@/lib/students/hero-class'

type Props = {
  heroClass: HeroClass
  level: number
  mana: number
}

export default function MyPowers({ heroClass, level, mana }: Props) {
  const powers = getPowersForClass(heroClass)
  const unlocked = powers.filter((p) => p.levelRequired <= level)
  const locked = powers.filter((p) => p.levelRequired > level)

  return (
    <section className="my-powers-section">
      <header className="student-section-header">
        <h2 className="student-section-title">Nire poderak</h2>
        <span className="my-powers-mana">🔮 {mana} mana</span>
      </header>

      <p className="my-powers-hint">
        Irakasleak aktibatzen ditu poderak zuretzat. Maila igotzean berriak
        desblokeatzen dira.
      </p>

      {unlocked.length > 0 && (
        <section className="my-powers-group">
          <h3 className="my-powers-group-title">Desblokeatuak</h3>
          <ul className="my-powers-list">
            {unlocked.map((p) => (
              <li key={p.id} className="my-power-card">
                <span className="my-power-icon" aria-hidden="true">
                  {p.icon}
                </span>
                <div className="my-power-info">
                  <span className="my-power-name">
                    {p.name}
                    {p.collaborative && (
                      <span className="my-power-collab" title="Kolaboratiboa">
                        {' '}· talde
                      </span>
                    )}
                  </span>
                  <span className="my-power-desc">{p.description}</span>
                </div>
                <span className="my-power-cost" title="Mana kostua">
                  🔮 {p.manaCost}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {locked.length > 0 && (
        <section className="my-powers-group my-powers-locked">
          <h3 className="my-powers-group-title">Datozenak</h3>
          <ul className="my-powers-list">
            {locked.slice(0, 3).map((p) => (
              <li key={p.id} className="my-power-card my-power-card-locked">
                <span className="my-power-icon" aria-hidden="true">
                  {p.icon}
                </span>
                <div className="my-power-info">
                  <span className="my-power-name">{p.name}</span>
                  <span className="my-power-desc">{p.description}</span>
                </div>
                <span className="my-power-locked-label">
                  🔒 Mla {p.levelRequired}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  )
}
