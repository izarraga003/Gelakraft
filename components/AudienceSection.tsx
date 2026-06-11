import SectionHeader from './SectionHeader'

type Audience = {
  level: string
  desc: string
  wide?: boolean
}

const stages: Audience[] = [
  {
    level: 'Lehen Hezkuntza',
    desc: 'Sorginen ipuinekin eta jolasekin, ikasleek lehen mitologia-zaporea hartzen dute. Edukiak adinera egokituak.',
  },
  {
    level: 'DBH',
    desc: 'Talde-dinamikak, erronka koop­eratiboak eta lehiaketak. Ikasleek beren rol-klasea aukeratzen dute eta abentura sortzen da.',
  },
  {
    level: 'Batxilergoa',
    desc: 'Edukietan sakontzeko: borrokak konplexuagoak, gertaerak luzeagoak. Selektibitate-prestaketarako ere balio du.',
  },
  {
    level: 'Lanbide Heziketa',
    desc: 'Modulu praktikoen errepasoa, ebaluazio-bideak, taldelana eraikitzeko. Edozein espezialitate egokitzen da: Informatika, Administrazioa, Mekanika, Osasuna...',
    wide: true,
  },
  {
    level: 'Unibertsitatea',
    desc: 'Ikasle handiek ere onartzen dute jolasa. Mintegi handietan parte-hartzea aktibatzeko edo Erasmus aurkezpenetan elkar ezagutzeko.',
    wide: true,
  },
]

function AudienceCard({ level, desc, wide }: Audience) {
  return (
    <article className={`audience-card${wide ? ' wide' : ''}`}>
      <h3 className="audience-level">{level}</h3>
      <p className="audience-desc">{desc}</p>
    </article>
  )
}

export default function AudienceSection() {
  return (
    <section className="audience-section">
      <div className="container">
        <SectionHeader
          eyebrow="Norentzat"
          title={<>Edozein adinetako ikasleentzat.</>}
          subtitle="GELAKRAFT ez da adin-tarte zehatz batentzat egina. Hezkuntza-etapa bakoitzaren beharrizanetara egokitzen da."
        />

        <div className="audience-grid">
          {stages.map((stage) => (
            <AudienceCard key={stage.level} {...stage} />
          ))}
        </div>

        <div className="audience-footer">
          <p>
            Ikastolak, eskola publikoak eta pribatuak — denentzat egokitua, euskara babesteko sortua.
          </p>
        </div>
      </div>
    </section>
  )
}
