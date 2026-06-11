import type { ReactNode } from 'react'
import SectionHeader from './SectionHeader'
import {
  FlameIcon,
  SilenceMoonIcon,
  ChestIcon,
  HourglassIcon,
  StopwatchIcon,
  D20Icon,
} from './icons'

type Tool = {
  numeral: string
  name: string
  desc: string
  icon: ReactNode
}

/**
 * Las 6 herramientas de la v1.
 * Si quieres reordenarlas, cambiar nombres o descripciones, edita este array.
 */
const tools: Tool[] = [
  {
    numeral: 'I',
    name: 'Sugaarren aurkako borroka',
    desc: 'Ikasgaiaren errepasoa, baina suzko sugetzar batekin borrokan. Galderak ondo eginez, taldeak Sugaar garaitu egiten du.',
    icon: <FlameIcon />,
  },
  {
    numeral: 'II',
    name: 'Mariren isiltasun-erronka',
    desc: 'Gelaren zarata-maila neurtzen du eta Marik bere haserrea erakusten du muga gainditzean. Helburua: isiltasunari eustea.',
    icon: <SilenceMoonIcon />,
  },
  {
    numeral: 'III',
    name: 'Ustekabeko gertaera',
    desc: 'Ausazko gertaera bat sortzen du gelan, ikasleen errutina apurtzeko. Sariak, erronkak edo istorio txikiak.',
    icon: <ChestIcon />,
  },
  {
    numeral: 'IV',
    name: 'Atzerako kontaketa',
    desc: 'Ariketa baterako denbora-muga argi bat. Hareazko erloju digitala, baina euskal estetika eta soinuekin.',
    icon: <HourglassIcon />,
  },
  {
    numeral: 'V',
    name: 'Kronometroa',
    desc: 'Denbora-tarteak neurtzeko tresna sinplea: lasterketak, ekitaldiak, jolasak. Klik bat eta abian.',
    icon: <StopwatchIcon />,
  },
  {
    numeral: 'VI',
    name: 'Ausazko hautatzailea',
    desc: 'Ikasle bat aukeratu behar duzunean, edo taldeak osatzen. Hogei aldetako dadoa, mitologiaz girotuta.',
    icon: <D20Icon />,
  },
]

function ToolCard({ numeral, name, desc, icon }: Tool) {
  return (
    <a href="#" className="tool-card">
      <div className="tool-card-header">
        <div className="tool-icon">{icon}</div>
        <div className="tool-num">{numeral}</div>
      </div>
      <h3 className="tool-name">{name}</h3>
      <p className="tool-desc">{desc}</p>
      <span className="tool-link">
        Probatu <span className="tool-link-arrow">→</span>
      </span>
    </a>
  )
}

export default function ToolsSection() {
  return (
    <section className="tools-section" id="tresnak">
      <div className="container">
        <SectionHeader
          eyebrow="Gelarako tresnak"
          title={
            <>
              Sei tresna, <span className="accent">orain</span> erabiltzeko prest.
            </>
          }
          subtitle="Izena eman, eta sei tresna dituzu eskuragarri. Ireki, sakatu, eta ikasgelara. Inolako konfigurazio barik."
        />
        <div className="tools-grid">
          {tools.map((tool) => (
            <ToolCard key={tool.numeral} {...tool} />
          ))}
        </div>
        <div className="tools-footer">
          <p>Doan. Lehen hezkuntzatik hasi eta unibertsitateraino</p>
        </div>
      </div>
    </section>
  )
}
