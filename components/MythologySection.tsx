import type { ReactNode } from 'react'
import SectionHeader from './SectionHeader'
import {
  MariBigIcon,
  SugaarBigIcon,
  SorginakIcon,
  LamiakIcon,
  JentilakIcon,
} from './icons'

type HeroClass = {
  name: string
  archetype: string
  desc: string
  icon: ReactNode
}

const heroes: HeroClass[] = [
  {
    name: 'Sorginak',
    archetype: 'Magia · Jakinduria',
    desc: 'Gauez biltzen ziren akelarretan. Bizidunen eta lurraren arteko sekretuak ezagutzen dituzte. Magian eta jakinduriaren bidean trebeak.',
    icon: <SorginakIcon />,
  },
  {
    name: 'Lamiak',
    archetype: 'Laguntza · Bihurrikeria',
    desc: 'Iturri eta erreketan bizi dira, urrezko orraziarekin. Lagunkoiak baina bihurriak; mesedeak egiten dituzte, baina jolasa ahaztu gabe.',
    icon: <LamiakIcon />,
  },
  {
    name: 'Jentilak',
    archetype: 'Indarra · Eraikuntza',
    desc: 'Erraldoiak, harriz eraikitzen zituzten trikuharriak eta zubiak. Gaur egun haien lana baizik ez zaigu geratzen. Indarra eta eraikuntza dituzte ezaugarri.',
    icon: <JentilakIcon />,
  },
]

function HeroCard({ name, archetype, desc, icon }: HeroClass) {
  return (
    <article className="mythology-class-card">
      <div className="mythology-class-icon">{icon}</div>
      <h4 className="mythology-class-name">{name}</h4>
      <p className="mythology-class-archetype">{archetype}</p>
      <p className="mythology-class-desc">{desc}</p>
    </article>
  )
}

export default function MythologySection() {
  return (
    <section className="mythology-section">
      <div className="container">
        <SectionHeader
          eyebrow="Euskal mitologia"
          title={
            <>
              Mari ardatz, <span className="accent">zure ikasleak heroi</span>.
            </>
          }
          subtitle="Euskal mitologiaren jainkosa nagusia da Mari. Bere unibertsoan kokatzen da GELAKRAFT eta berari jarraitzen diote ikasleek beren abenturan."
          onDark
        />

        {/* Mari como protagonista: card destacada full-width */}
        <article className="mari-feature">
          <div className="mari-feature-icon">
            <MariBigIcon size={88} />
          </div>
          <div className="mari-feature-content">
            <div className="mari-feature-roman">I · Anbotoko jainkosa</div>
            <h3 className="mari-feature-name">Mari</h3>
            <p className="mari-feature-epithet">
              Anbotoko dama, Ama Lurra, euskal mitologiaren erdigunea
            </p>
            <p className="mari-feature-desc">
              Euskal mitologiaren bihotza. Eguraldia, lurra eta justizia da. Anbotoko kobazulotik
              agertzen da, bere itxura aldatuz: emakume, ahuntz, su. Sugaar bere senarra da.
              Sorginak, lamiak eta jentilak bere lurrean bizi dira. GELAKRAFTen narratzailea da.
              Hari jarraitzen diote ikasleek beren abenturan.
            </p>
            <p className="mari-feature-quote">
              «Anbotoko kobazulotik, Mariri begira daude euskal lurrak.»
            </p>
          </div>
        </article>

        {/* Sugaar como elemento secundario: card más pequeña centered */}
        <article className="sugaar-aside">
          <div className="sugaar-aside-icon">
            <SugaarBigIcon size={48} />
          </div>
          <div className="sugaar-aside-content">
            <div className="sugaar-aside-roman">II · Mariren senarra</div>
            <h3 className="sugaar-aside-name">Sugaar</h3>
            <p className="sugaar-aside-epithet">Suzko sugetzarra</p>
            <p className="sugaar-aside-desc">
              Sugoi edo Maju ere deitua. Mendi-tontorretan azaltzen den suzko marra. Ikasgelan,
              errepasoaren erronka: galderak ondo erantzunda, taldeak Sugaarren indarra hezten du.
            </p>
          </div>
        </article>

        {/* Las 3 clases de héroes (sin Basajaun) */}
        <div className="heroes-intro">
          <div className="heroes-eyebrow">Hiru heroi-klase</div>
          <h3 className="heroes-title">Zure ikasleek aukeratzen dute</h3>
          <p>
            Mariren unibertsoan, ikasle bakoitzak bere klasea aukeratzen du. Klase bakoitzak bere
            indarrak ditu, ikasgelan taldeak osatzeko.
          </p>
        </div>

        <div className="heroes-grid">
          {heroes.map((hero) => (
            <HeroCard key={hero.name} {...hero} />
          ))}
        </div>
      </div>
    </section>
  )
}
