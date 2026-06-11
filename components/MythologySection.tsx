import type { ReactNode } from 'react'
import SectionHeader from './SectionHeader'
import {
  MariBigIcon,
  SugaarBigIcon,
  SorginakIcon,
  LamiakIcon,
  JentilakIcon,
  BasajaunIcon,
} from './icons'

type Deity = {
  numeral: string
  name: string
  epithet: string
  desc: string
  icon: ReactNode
}

type Hero = {
  name: string
  archetype: string
  desc: string
  icon: ReactNode
}

const deities: Deity[] = [
  {
    numeral: 'I',
    name: 'Mari',
    epithet: 'Anbotoko dama, Ama Lurra',
    desc: 'Euskal mitologiaren erdigunean dago. Eguraldia, lurra eta justizia bera. Anbotoko kobazulotik begiratzen die ikasleei eta haien irakasleei. GELAKRAFTen narratzailea eta gidaria da.',
    icon: <MariBigIcon />,
  },
  {
    numeral: 'II',
    name: 'Sugaar',
    epithet: 'Mariren senarra, suzko sugetzarra',
    desc: 'Sugoi edo Maju ere deitua. Mendi-tontorretan azaltzen den suzko marra. Ikasgelan: errepasoaren erronka. Galderak ondo erantzunda, taldeak Sugaarren indarra hezten du.',
    icon: <SugaarBigIcon />,
  },
]

const heroes: Hero[] = [
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
  {
    name: 'Basajaun',
    archetype: 'Babesa · Basoa',
    desc: 'Basoaren jauna, abereen babeslea. Eskertzen zaienei nekazaritza eta arotzeria irakatsi zien. Babesa eta naturarekiko lotura.',
    icon: <BasajaunIcon />,
  },
]

function DeityCard({ numeral, name, epithet, desc, icon }: Deity) {
  return (
    <article className="deity-card">
      <div className="deity-icon">
        {icon}
        <span className="deity-icon-roman">{numeral}</span>
      </div>
      <h3 className="deity-name">{name}</h3>
      <p className="deity-epithet">{epithet}</p>
      <p className="deity-desc">{desc}</p>
    </article>
  )
}

function HeroCard({ name, archetype, desc, icon }: Hero) {
  return (
    <article className="hero-card">
      <div className="hero-icon">{icon}</div>
      <h4 className="hero-name">{name}</h4>
      <p className="hero-archetype">{archetype}</p>
      <p className="hero-desc">{desc}</p>
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
              Mari, Sugaar eta <span className="accent">zure heroiak</span>.
            </>
          }
          subtitle="Ez da apaingarri bat: euskal mitologia da GELAKRAFTen muina. Ikasleek lau heroi-klase artean aukeratzen dute eta Mariren narrazioan murgiltzen dira."
          onDark
        />

        <div className="deities-grid">
          {deities.map((deity) => (
            <DeityCard key={deity.name} {...deity} />
          ))}
        </div>

        <div className="heroes-intro">
          <div className="heroes-eyebrow">Lau heroi-klase</div>
          <h3 className="heroes-title">Zure ikasleek aukeratzen dute</h3>
          <p>
            Hasieran, ikasle bakoitzak bere klasea aukeratzen du. Klase bakoitzak bere indarrak eta
            bere ahultasunak ditu, ikasgelan bere taldekideak osatzeko.
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
