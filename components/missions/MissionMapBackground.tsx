/**
 * Fondos SVG procedurales para los mapas de misión.
 * Cada uno es un SVG fullbleed con un tema temático vasco distinto.
 * Se renderizan a 1600×900 (16:9) y luego escalan al contenedor.
 */

import type { MissionMapId } from '@/lib/missions/maps'

type Props = {
  mapId: MissionMapId
  className?: string
}

export default function MissionMapBackground({ mapId, className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 1600 900"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className={`mission-map-bg ${className}`}
      aria-hidden="true"
    >
      {mapId === 'anboto' && <AnbotoBg />}
      {mapId === 'itsasoa' && <ItsasoaBg />}
      {mapId === 'basoa' && <BasoaBg />}
      {mapId === 'kobazuloa' && <KobazuloaBg />}
      {mapId === 'iratia' && <IratiaBg />}
    </svg>
  )
}

function AnbotoBg() {
  return (
    <>
      <defs>
        <linearGradient id="anboto-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1A0A0C" />
          <stop offset="60%" stopColor="#3A1208" />
          <stop offset="100%" stopColor="#5A1207" />
        </linearGradient>
        <linearGradient id="anboto-mountain" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1F0A0C" />
          <stop offset="100%" stopColor="#0A0405" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#anboto-sky)" />
      {/* Nubes oscuras */}
      <ellipse cx="300" cy="120" rx="300" ry="50" fill="#1F0A0C" opacity="0.85" />
      <ellipse cx="1200" cy="180" rx="380" ry="60" fill="#150708" opacity="0.7" />
      <ellipse cx="800" cy="250" rx="400" ry="50" fill="#150708" opacity="0.5" />
      {/* Relámpago */}
      <path
        d="M 1100 50 L 1060 200 L 1140 220 L 1090 380"
        stroke="#FFB089"
        strokeWidth="3"
        fill="none"
        opacity="0.6"
      />
      {/* Cordillera lejana */}
      <path
        d="M 0 500 L 100 420 L 200 450 L 320 380 L 420 430 L 540 360 L 640 400
           L 760 340 L 880 390 L 1000 320 L 1120 380 L 1240 340 L 1360 390
           L 1480 350 L 1600 410 L 1600 600 L 0 600 Z"
        fill="url(#anboto-mountain)"
        opacity="0.7"
      />
      {/* Pico Anboto en primer plano */}
      <path
        d="M 100 700 L 350 350 L 500 550 L 650 250 L 850 500 L 1050 350 L 1250 450
           L 1450 380 L 1600 500 L 1600 900 L 0 900 L 0 700 Z"
        fill="#0A0405"
      />
      {/* Borde iluminado */}
      <path
        d="M 350 350 L 650 250 L 1050 350"
        stroke="rgba(255, 107, 53, 0.35)"
        strokeWidth="3"
        fill="none"
      />
      {/* Brasas */}
      <circle cx="200" cy="700" r="3" fill="#FF8B3A" opacity="0.6" />
      <circle cx="900" cy="650" r="2.5" fill="#FFD53D" opacity="0.7" />
      <circle cx="1400" cy="730" r="2.5" fill="#FF8B3A" opacity="0.5" />
    </>
  )
}

function ItsasoaBg() {
  return (
    <>
      <defs>
        <linearGradient id="itsa-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFCB91" />
          <stop offset="40%" stopColor="#F9A36C" />
          <stop offset="100%" stopColor="#3A77BB" />
        </linearGradient>
        <linearGradient id="itsa-water" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5BAEC5" />
          <stop offset="100%" stopColor="#2A5D8A" />
        </linearGradient>
        <linearGradient id="itsa-island" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3D6B30" />
          <stop offset="100%" stopColor="#1A4220" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#itsa-sky)" />
      {/* Sol bajando */}
      <circle cx="1200" cy="350" r="60" fill="#FFE08A" opacity="0.85" />
      <circle cx="1200" cy="350" r="90" fill="rgba(255, 224, 138, 0.25)" />
      {/* Nubes claras */}
      <ellipse cx="400" cy="180" rx="180" ry="22" fill="white" opacity="0.6" />
      <ellipse cx="900" cy="240" rx="160" ry="20" fill="white" opacity="0.5" />
      {/* Mar */}
      <rect y="500" width="1600" height="400" fill="url(#itsa-water)" />
      {/* Islas */}
      <path
        d="M 100 600 Q 200 540 350 560 Q 450 600 380 660 Q 280 700 150 680 Q 80 660 100 600 Z"
        fill="url(#itsa-island)"
      />
      <path
        d="M 600 500 Q 720 440 880 460 Q 980 510 920 580 Q 800 620 670 600 Q 580 580 600 500 Z"
        fill="url(#itsa-island)"
      />
      <path
        d="M 1150 540 Q 1280 490 1450 510 Q 1560 560 1480 620 Q 1320 660 1180 640 Q 1100 610 1150 540 Z"
        fill="url(#itsa-island)"
      />
      {/* Palmeras esquemáticas en las islas */}
      <path d="M 220 580 L 215 540 M 215 540 L 195 530 M 215 540 L 235 528 M 215 540 L 205 525 M 215 540 L 225 522" stroke="#1A4220" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 800 480 L 795 440 M 795 440 L 775 430 M 795 440 L 815 428 M 795 440 L 785 425 M 795 440 L 805 422" stroke="#1A4220" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M 1320 520 L 1315 480 M 1315 480 L 1295 470 M 1315 480 L 1335 468 M 1315 480 L 1305 465 M 1315 480 L 1325 462" stroke="#1A4220" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Reflejos en el agua */}
      <path d="M 200 720 Q 220 718 240 720" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
      <path d="M 700 760 Q 740 758 780 760" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
      <path d="M 1300 800 Q 1340 798 1380 800" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none" />
    </>
  )
}

function BasoaBg() {
  return (
    <>
      <defs>
        <linearGradient id="basoa-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#48624A" />
          <stop offset="60%" stopColor="#2D4A30" />
          <stop offset="100%" stopColor="#1F3520" />
        </linearGradient>
        <linearGradient id="basoa-trunk" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2A1E18" />
          <stop offset="100%" stopColor="#1A1310" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#basoa-sky)" />
      {/* Niebla suave */}
      <ellipse cx="400" cy="500" rx="500" ry="60" fill="white" opacity="0.06" />
      <ellipse cx="1100" cy="600" rx="500" ry="50" fill="white" opacity="0.05" />
      {/* Suelo de bosque */}
      <path d="M 0 700 Q 400 670 800 690 Q 1200 670 1600 700 L 1600 900 L 0 900 Z"
        fill="#15240E" />
      {/* Troncos de hayas */}
      {[80, 240, 380, 540, 720, 880, 1040, 1180, 1340, 1500].map((x, i) => (
        <g key={i}>
          <path
            d={`M ${x - 15} 900 Q ${x - 10} 600, ${x} 250 Q ${x + 10} 600, ${x + 15} 900 Z`}
            fill="url(#basoa-trunk)"
          />
          {/* Copa frondosa muy estilizada */}
          <circle cx={x} cy={200} r={70} fill="#3D6B30" opacity="0.85" />
          <circle cx={x - 25} cy={235} r={45} fill="#2D5A22" opacity="0.85" />
          <circle cx={x + 25} cy={235} r={45} fill="#2D5A22" opacity="0.85" />
        </g>
      ))}
      {/* Hojas caídas brillando */}
      <circle cx="300" cy="750" r="3" fill="#A8C870" opacity="0.5" />
      <circle cx="900" cy="780" r="2.5" fill="#A8C870" opacity="0.4" />
      <circle cx="1300" cy="760" r="3" fill="#A8C870" opacity="0.5" />
    </>
  )
}

function KobazuloaBg() {
  return (
    <>
      <defs>
        <radialGradient id="koba-bg" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#3A2848" />
          <stop offset="60%" stopColor="#1F1428" />
          <stop offset="100%" stopColor="#0A0810" />
        </radialGradient>
        <linearGradient id="koba-rock" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3D2D4A" />
          <stop offset="100%" stopColor="#1A1020" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#koba-bg)" />
      {/* Estalactitas */}
      <path
        d="M 0 0 L 0 100 L 70 170 L 130 90 L 200 200 L 260 80 L 340 180 L 400 60
           L 490 200 L 560 90 L 640 180 L 720 60 L 810 190 L 880 80 L 970 170
           L 1040 60 L 1130 180 L 1200 80 L 1290 170 L 1360 60 L 1450 190
           L 1520 80 L 1600 160 L 1600 0 Z"
        fill="url(#koba-rock)"
      />
      {/* Estalagmitas en el suelo */}
      <path
        d="M 0 900 L 0 780 L 80 820 L 160 750 L 250 830 L 340 770 L 440 820
           L 540 760 L 650 820 L 760 770 L 870 830 L 980 780 L 1100 820
           L 1210 770 L 1320 830 L 1430 780 L 1530 820 L 1600 790 L 1600 900 Z"
        fill="url(#koba-rock)"
      />
      {/* Cristales brillantes */}
      <g opacity="0.7">
        <polygon points="350,400 360,430 350,470 340,430" fill="#B488E8" />
        <polygon points="900,450 912,485 900,530 888,485" fill="#7E4FA8" />
        <polygon points="1300,420 1310,448 1300,490 1290,448" fill="#B488E8" />
      </g>
      {/* Gotas de agua brillantes */}
      <circle cx="200" cy="200" r="2" fill="#A8DFE6" opacity="0.7" />
      <circle cx="700" cy="180" r="2" fill="#A8DFE6" opacity="0.8" />
      <circle cx="1200" cy="200" r="2" fill="#A8DFE6" opacity="0.7" />
    </>
  )
}

function IratiaBg() {
  return (
    <>
      <defs>
        <radialGradient id="iratia-sky" cx="70%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#3D5E78" />
          <stop offset="60%" stopColor="#1F3548" />
          <stop offset="100%" stopColor="#0F1820" />
        </radialGradient>
        <linearGradient id="iratia-trunk" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1F2A22" />
          <stop offset="100%" stopColor="#0F1A12" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#iratia-sky)" />
      {/* Luna */}
      <circle cx="1300" cy="200" r="65" fill="#F0E3B8" opacity="0.85" />
      <circle cx="1300" cy="200" r="100" fill="rgba(240, 227, 184, 0.18)" />
      {/* Estrellas */}
      {[
        [100, 150], [240, 90], [400, 180], [560, 120], [780, 200],
        [880, 80], [1050, 160], [1480, 280], [200, 280], [600, 320],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="#FFFDE7" opacity="0.85" />
      ))}
      {/* Suelo niebloso */}
      <path d="M 0 720 Q 400 690 800 705 Q 1200 695 1600 720 L 1600 900 L 0 900 Z"
        fill="#0F1820" />
      <ellipse cx="500" cy="730" rx="400" ry="20" fill="rgba(168, 223, 230, 0.15)" />
      <ellipse cx="1100" cy="745" rx="400" ry="20" fill="rgba(168, 223, 230, 0.12)" />
      {/* Árboles oscuros con luciérnagas */}
      {[120, 320, 540, 760, 980, 1200, 1420].map((x, i) => (
        <g key={i}>
          <path
            d={`M ${x - 12} 900 L ${x - 6} 350 L ${x + 6} 350 L ${x + 12} 900 Z`}
            fill="url(#iratia-trunk)"
          />
          <polygon
            points={`${x - 60},400 ${x},220 ${x + 60},400 ${x + 35},380 ${x + 50},460 ${x - 50},460 ${x - 35},380`}
            fill="#1A2618"
          />
        </g>
      ))}
      {/* Luciérnagas */}
      {[
        [180, 480], [420, 540], [620, 460], [840, 580], [1060, 500],
        [1280, 460], [1500, 540],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#FFEB3B" opacity="0.85">
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur={`${2 + i * 0.3}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </>
  )
}
