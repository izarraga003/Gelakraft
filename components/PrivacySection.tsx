import type { ReactNode } from 'react'
import SectionHeader from './SectionHeader'
import { KeyIcon, EnvelopeIcon, DocumentCheckIcon } from './icons'

type PrivacyItem = {
  heading: string
  desc: string
  icon: ReactNode
}

const items: PrivacyItem[] = [
  {
    heading: 'Tokenen bidezko sarbidea',
    desc: 'Ikasleek ez dute kontu pertsonalik sortu behar. Irakasleak token bat eskuratzen die eta horrekin sartzen dira. Datu pertsonalik ez dugu eskatzen.',
    icon: <KeyIcon />,
  },
  {
    heading: 'Irakasleentzat minimoa',
    desc: 'Email bat kontu bat sortzeko eta zure ikasgelaren konfigurazioa zure eskuetan edukiko duzu. Ez dugu beste ezer behar.',
    icon: <EnvelopeIcon />,
  },
  {
    heading: 'Araudien araberako diseinua',
    desc: 'GDPR eta LOPDGDD araudiak betez sortua. Eusko Jaurlaritzaren hezkuntza-zentroetarako pribatutasun-irizpideen barruan.',
    icon: <DocumentCheckIcon />,
  },
]

function PrivacyCard({ heading, desc, icon }: PrivacyItem) {
  return (
    <article className="privacy-card">
      <div className="privacy-icon">{icon}</div>
      <h3 className="privacy-heading">{heading}</h3>
      <p className="privacy-desc">{desc}</p>
    </article>
  )
}

export default function PrivacySection() {
  return (
    <section className="privacy-section">
      <div className="container">
        <SectionHeader
          eyebrow="Pribatutasuna"
          title={<>Ikasleen datu pertsonalik ez dugu jasotzen.</>}
          subtitle="Ikasleen pribatutasuna gure lehentasuna da. Jasotzen ez ditugun datuak, ezin ditugu galdu."
        />

        <div className="privacy-grid">
          {items.map((item) => (
            <PrivacyCard key={item.heading} {...item} />
          ))}
        </div>

        <div className="privacy-footer">
          <p>
            Xehetasun guztiak <a href="#">pribatutasun politika osoan</a>.
          </p>
        </div>
      </div>
    </section>
  )
}
