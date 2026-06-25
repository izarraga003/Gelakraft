import type { MissionMapId } from '@/lib/missions/maps'

type Props = {
  mapId: MissionMapId
}

/**
 * Fondos SVG procedurales con referencias claras a la mitología vasca.
 * Cada mapa tiene capas: cielo, fondo lejano, fondo medio, elementos cercanos.
 */
export default function MissionMapBackground({ mapId }: Props) {
  return (
    <svg
      className="mission-map-bg"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {mapId === 'anboto' && <AnbotoMap />}
      {mapId === 'itsasoa' && <ItsasoaMap />}
      {mapId === 'basoa' && <BasoaMap />}
      {mapId === 'kobazuloa' && <KobazuloaMap />}
      {mapId === 'iratia' && <IratiaMap />}
    </svg>
  )
}

// ============================================================
// ANBOTO — La cima sagrada de Mari, tormenta y rayos
// ============================================================
function AnbotoMap() {
  return (
    <g>
      <defs>
        <linearGradient id="anboto-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1A2E" />
          <stop offset="40%" stopColor="#2C2A4A" />
          <stop offset="80%" stopColor="#4A4060" />
          <stop offset="100%" stopColor="#6B5B7B" />
        </linearGradient>
        <radialGradient id="anboto-glow" cx="0.5" cy="0.3" r="0.5">
          <stop offset="0%" stopColor="#E8C84B" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#B88A3C" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <filter id="anboto-mist">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* Cielo tormentoso */}
      <rect width="1200" height="600" fill="url(#anboto-sky)" />
      {/* Aura dorada de Mari sobre la cumbre */}
      <ellipse cx="600" cy="150" rx="380" ry="200" fill="url(#anboto-glow)" />

      {/* Nubes oscuras */}
      <ellipse cx="200" cy="80" rx="220" ry="35" fill="#1A1A2E" opacity="0.7" />
      <ellipse cx="900" cy="60" rx="280" ry="40" fill="#1A1A2E" opacity="0.6" />
      <ellipse cx="500" cy="120" rx="180" ry="28" fill="#2C2A4A" opacity="0.8" />

      {/* Rayos */}
      <path
        d="M 320 30 L 305 110 L 320 110 L 295 200 L 340 110 L 320 110 Z"
        fill="#FFD53D"
        opacity="0.9"
      >
        <animate
          attributeName="opacity"
          values="0;0.9;0;0;0;0;0"
          dur="5s"
          repeatCount="indefinite"
        />
      </path>
      <path
        d="M 880 50 L 860 130 L 880 130 L 855 220 L 905 130 L 880 130 Z"
        fill="#FFFDE7"
        opacity="0"
      >
        <animate
          attributeName="opacity"
          values="0;0;0;0;0;0.85;0"
          dur="5s"
          repeatCount="indefinite"
        />
      </path>

      {/* Aitzkorri detrás (montaña más lejana) */}
      <path
        d="M 0 400 L 100 350 L 200 380 L 320 320 L 450 360 L 580 310 L 720 360 L 850 320 L 980 360 L 1100 330 L 1200 380 L 1200 600 L 0 600 Z"
        fill="#3A3450"
        opacity="0.7"
      />

      {/* Anboto principal con cumbre puntiaguda */}
      <path
        d="M 200 600 L 280 480 L 360 420 L 440 350 L 520 270 L 580 200 L 600 170 L 620 200 L 680 270 L 760 350 L 840 420 L 920 480 L 1000 600 Z"
        fill="#2A2438"
      />
      {/* Sombras del Anboto */}
      <path
        d="M 600 170 L 620 200 L 680 270 L 760 350 L 840 420 L 920 480 L 1000 600 L 600 600 Z"
        fill="#1F1A2A"
        opacity="0.65"
      />

      {/* Castillo/cueva de Mari en la cumbre */}
      <rect x="588" y="178" width="24" height="22" fill="#0E0A14" />
      <path d="M 585 180 L 600 165 L 615 180 Z" fill="#0E0A14" />
      <rect x="595" y="186" width="4" height="8" fill="#FFD53D" opacity="0.85">
        <animate attributeName="opacity" values="0.85;0.4;0.85" dur="2.4s" repeatCount="indefinite" />
      </rect>
      <rect x="601" y="186" width="4" height="8" fill="#FFD53D" opacity="0.85">
        <animate attributeName="opacity" values="0.4;0.85;0.4" dur="2.4s" repeatCount="indefinite" />
      </rect>

      {/* Cuervos en silueta */}
      <g fill="#0E0A14">
        <path d="M 350 180 q 8 -6 16 0 q -8 -2 -16 0 z" />
        <path d="M 450 220 q 6 -5 12 0 q -6 -2 -12 0 z" />
        <path d="M 800 200 q 7 -5 14 0 q -7 -2 -14 0 z" />
        <path d="M 880 240 q 6 -5 12 0 q -6 -2 -12 0 z" />
        <path d="M 200 260 q 7 -5 14 0 q -7 -2 -14 0 z" />
      </g>

      {/* Niebla en la base */}
      <ellipse cx="600" cy="520" rx="600" ry="50" fill="#6B5B7B" opacity="0.4" filter="url(#anboto-mist)" />
      <ellipse cx="300" cy="540" rx="300" ry="35" fill="#8B7B9B" opacity="0.3" filter="url(#anboto-mist)" />
      <ellipse cx="900" cy="540" rx="320" ry="35" fill="#8B7B9B" opacity="0.3" filter="url(#anboto-mist)" />
    </g>
  )
}

// ============================================================
// ITSASOA — El mar de las lamiak, con sirena en una roca
// ============================================================
function ItsasoaMap() {
  return (
    <g>
      <defs>
        <linearGradient id="itsasoa-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF9D6E" />
          <stop offset="50%" stopColor="#FFB58A" />
          <stop offset="80%" stopColor="#C97A55" />
          <stop offset="100%" stopColor="#6B4A6B" />
        </linearGradient>
        <linearGradient id="itsasoa-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5BA8B8" />
          <stop offset="50%" stopColor="#3A7F95" />
          <stop offset="100%" stopColor="#1F4A5C" />
        </linearGradient>
        <radialGradient id="itsasoa-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="60%" stopColor="#FFD53D" />
          <stop offset="100%" stopColor="#E8B53B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cielo de atardecer */}
      <rect width="1200" height="380" fill="url(#itsasoa-sky)" />
      {/* Mar */}
      <rect y="380" width="1200" height="220" fill="url(#itsasoa-sea)" />

      {/* Sol */}
      <circle cx="1080" cy="180" r="70" fill="url(#itsasoa-sun)" />
      <circle cx="1080" cy="180" r="38" fill="#FFFDE7" opacity="0.95" />

      {/* Reflejo del sol en el agua */}
      <ellipse cx="1080" cy="395" rx="60" ry="6" fill="#FFFDE7" opacity="0.55" />
      <ellipse cx="1080" cy="410" rx="45" ry="3" fill="#FFD53D" opacity="0.4" />
      <ellipse cx="1080" cy="425" rx="38" ry="2.5" fill="#FFD53D" opacity="0.3" />

      {/* Nubes */}
      <ellipse cx="280" cy="100" rx="180" ry="22" fill="#FFE5D0" opacity="0.85" />
      <ellipse cx="640" cy="140" rx="220" ry="26" fill="#FFE5D0" opacity="0.7" />
      <ellipse cx="160" cy="60" rx="120" ry="14" fill="#FFFDE7" opacity="0.6" />

      {/* Acantilados lejanos */}
      <path
        d="M 0 380 L 0 320 L 60 300 L 130 330 L 200 320 L 280 350 L 320 340 L 380 360 L 420 350 L 450 365 L 480 380 Z"
        fill="#3D2A3D"
        opacity="0.6"
      />

      {/* Gaviotas */}
      <g fill="#FFFDE7" opacity="0.85">
        <path d="M 350 200 q 9 -8 18 0 q -9 -3 -18 0 z" />
        <path d="M 500 250 q 7 -6 14 0 q -7 -2 -14 0 z" />
        <path d="M 800 180 q 10 -8 20 0 q -10 -3 -20 0 z" />
        <path d="M 250 270 q 6 -5 12 0 q -6 -2 -12 0 z" />
      </g>

      {/* Isla grande con árbol — donde se ve la lamia */}
      <ellipse cx="700" cy="450" rx="200" ry="40" fill="#2F5F3F" />
      <ellipse cx="700" cy="442" rx="170" ry="30" fill="#3D7048" />

      {/* Lamia sentada en la isla peinándose */}
      <g transform="translate(720, 388)">
        {/* Cuerpo (silueta) */}
        <ellipse cx="0" cy="20" rx="11" ry="20" fill="#2A1F2A" />
        {/* Cabeza */}
        <circle cx="0" cy="-2" r="8" fill="#E8B58A" />
        {/* Pelo largo dorado */}
        <path d="M -8 -4 Q -14 16 -10 38 Q -2 32 0 22 Q 2 32 10 38 Q 14 16 8 -4 Q 4 -10 -4 -10 Z" fill="#FFD53D" opacity="0.92" />
        {/* Brazo con espejo */}
        <ellipse cx="6" cy="6" rx="3" ry="6" fill="#E8B58A" />
        <circle cx="10" cy="2" r="3.5" fill="#C0E0E8" stroke="#8B6F1A" strokeWidth="0.6" />
        {/* Cola en el agua */}
        <path d="M -8 36 Q -16 48 -28 50 L -32 60 L -20 56 L -6 50 Z" fill="#3A7F95" />
        <path d="M -28 50 L -38 54 L -32 60 Z" fill="#5BA8B8" />
      </g>

      {/* Isla mediana */}
      <ellipse cx="280" cy="470" rx="120" ry="25" fill="#2F5F3F" />
      <ellipse cx="280" cy="464" rx="100" ry="18" fill="#3D7048" />

      {/* Isla pequeña */}
      <ellipse cx="1080" cy="490" rx="80" ry="18" fill="#2F5F3F" />

      {/* Olas */}
      <g fill="none" stroke="#FFFDE7" strokeWidth="1.5" opacity="0.55">
        <path d="M 50 430 Q 80 425 110 430 T 170 430" />
        <path d="M 400 470 Q 430 465 460 470 T 520 470" />
        <path d="M 850 460 Q 880 455 910 460 T 970 460" />
        <path d="M 150 510 Q 180 505 210 510 T 270 510" />
        <path d="M 550 530 Q 580 525 610 530 T 670 530" />
        <path d="M 950 520 Q 980 515 1010 520 T 1070 520" />
      </g>

      {/* Espuma del oleaje contra las rocas */}
      <ellipse cx="500" cy="455" rx="14" ry="3" fill="#FFFDE7" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="900" cy="465" rx="16" ry="3" fill="#FFFDE7" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3.5s" repeatCount="indefinite" />
      </ellipse>
    </g>
  )
}

// ============================================================
// BASOA — Bosque profundo de hayas, dominio de basajaun
// ============================================================
function BasoaMap() {
  return (
    <g>
      <defs>
        <linearGradient id="basoa-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A5A3A" />
          <stop offset="40%" stopColor="#2A4A2E" />
          <stop offset="100%" stopColor="#1A3320" />
        </linearGradient>
        <radialGradient id="basoa-light" cx="0.5" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="#F0E0A8" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#A8C878" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <filter id="basoa-blur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <rect width="1200" height="600" fill="url(#basoa-bg)" />

      {/* Rayos de luz del sol entre los árboles */}
      <polygon points="400,0 350,600 480,600 460,0" fill="url(#basoa-light)" opacity="0.6" />
      <polygon points="780,0 760,600 880,600 850,0" fill="url(#basoa-light)" opacity="0.5" />

      {/* Árboles muy lejanos */}
      <g fill="#1A3320" opacity="0.8" filter="url(#basoa-blur)">
        {Array.from({ length: 15 }, (_, i) => {
          const x = 40 + i * 80
          const h = 280 + ((i * 31) % 60)
          return <rect key={i} x={x} y={600 - h} width="8" height={h} />
        })}
      </g>

      {/* Hayas grandes (haya = pago en euskara, árbol sagrado) */}
      <g fill="#3D2A20">
        {/* Tronco izquierdo */}
        <path d="M 80 600 L 100 250 L 115 250 L 130 600 Z" />
        <path d="M 95 250 Q 105 245 115 250 L 115 240 Q 105 230 95 240 Z" />
        {/* Tronco central-izquierdo */}
        <path d="M 220 600 L 240 200 L 258 200 L 275 600 Z" />
        {/* Tronco central-derecho */}
        <path d="M 920 600 L 940 220 L 958 220 L 975 600 Z" />
        {/* Tronco derecho */}
        <path d="M 1080 600 L 1100 280 L 1118 280 L 1135 600 Z" />
      </g>

      {/* Musgo en los troncos */}
      <g fill="#5B8B3A" opacity="0.65">
        <ellipse cx="105" cy="400" rx="20" ry="14" />
        <ellipse cx="105" cy="450" rx="18" ry="10" />
        <ellipse cx="248" cy="380" rx="22" ry="14" />
        <ellipse cx="950" cy="400" rx="22" ry="14" />
        <ellipse cx="1108" cy="430" rx="18" ry="10" />
      </g>

      {/* Copas frondosas */}
      <g fill="#3D5C2A">
        <ellipse cx="105" cy="220" rx="100" ry="80" />
        <ellipse cx="248" cy="180" rx="120" ry="95" />
        <ellipse cx="950" cy="195" rx="115" ry="90" />
        <ellipse cx="1108" cy="245" rx="100" ry="80" />
      </g>
      <g fill="#5B8B3A" opacity="0.85">
        <ellipse cx="80" cy="200" rx="70" ry="55" />
        <ellipse cx="230" cy="150" rx="85" ry="65" />
        <ellipse cx="935" cy="170" rx="80" ry="60" />
        <ellipse cx="1085" cy="220" rx="65" ry="50" />
      </g>

      {/* Suelo del bosque */}
      <path
        d="M 0 480 Q 200 460 400 475 Q 600 485 800 470 Q 1000 480 1200 465 L 1200 600 L 0 600 Z"
        fill="#2A1F14"
      />
      <path
        d="M 0 480 Q 200 460 400 475 Q 600 485 800 470 Q 1000 480 1200 465"
        fill="none"
        stroke="#3D2A20"
        strokeWidth="2"
      />

      {/* Helechos */}
      <g fill="#5B8B3A">
        <path d="M 180 540 Q 175 510 170 490 Q 168 500 162 502 Q 168 506 165 514 Q 158 514 158 522 Q 165 522 163 530 Q 156 530 156 538 Q 162 538 160 546 Z" />
        <path d="M 600 555 Q 595 525 590 505 Q 588 515 582 517 Q 588 521 585 529 Q 578 529 578 537 Q 585 537 583 545 Q 576 545 576 553 Z" />
        <path d="M 1000 545 Q 995 515 990 495 Q 988 505 982 507 Q 988 511 985 519 Q 978 519 978 527 Q 985 527 983 535 Q 976 535 976 543 Z" />
      </g>

      {/* Hongos rojos con motas (Amanita) */}
      <g>
        <path d="M 420 562 Q 420 545 432 545 Q 444 545 444 562 Z" fill="#C24617" />
        <circle cx="426" cy="552" r="1.8" fill="#FFFDE7" />
        <circle cx="438" cy="555" r="1.5" fill="#FFFDE7" />
        <circle cx="432" cy="548" r="1.3" fill="#FFFDE7" />
        <rect x="429" y="562" width="6" height="10" fill="#F0E0C0" />
      </g>
      <g>
        <path d="M 750 568 Q 750 552 762 552 Q 774 552 774 568 Z" fill="#C24617" />
        <circle cx="756" cy="558" r="1.6" fill="#FFFDE7" />
        <circle cx="768" cy="561" r="1.4" fill="#FFFDE7" />
        <rect x="759" y="568" width="6" height="9" fill="#F0E0C0" />
      </g>
      <g>
        <path d="M 360 580 Q 360 568 369 568 Q 378 568 378 580 Z" fill="#C24617" />
        <circle cx="365" cy="573" r="1.2" fill="#FFFDE7" />
        <circle cx="373" cy="575" r="1.1" fill="#FFFDE7" />
        <rect x="363" y="580" width="4" height="7" fill="#F0E0C0" />
      </g>

      {/* Silueta de basajaun en la profundidad del bosque */}
      <g opacity="0.45" fill="#0E0A08">
        <ellipse cx="580" cy="380" rx="18" ry="36" />
        <circle cx="580" cy="350" r="12" />
        {/* Cabello largo */}
        <path d="M 568 350 Q 565 380 570 410 L 590 410 Q 595 380 592 350 Z" />
      </g>
    </g>
  )
}

// ============================================================
// KOBAZULOA — Cueva con estalactitas y brasero
// ============================================================
function KobazuloaMap() {
  return (
    <g>
      <defs>
        <radialGradient id="kobazuloa-bg" cx="0.5" cy="0.85" r="0.7">
          <stop offset="0%" stopColor="#5C3A24" />
          <stop offset="40%" stopColor="#2A1B14" />
          <stop offset="100%" stopColor="#0A0608" />
        </radialGradient>
        <radialGradient id="kobazuloa-fire" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="30%" stopColor="#FFD53D" />
          <stop offset="70%" stopColor="#C24617" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0A0608" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="600" fill="url(#kobazuloa-bg)" />

      {/* Estalactitas (techo) */}
      <g fill="#2A1B14">
        <path d="M 80 0 L 95 0 L 88 80 Z" />
        <path d="M 160 0 L 178 0 L 169 60 Z" />
        <path d="M 250 0 L 270 0 L 260 100 Z" />
        <path d="M 360 0 L 380 0 L 370 50 Z" />
        <path d="M 440 0 L 462 0 L 451 90 Z" />
        <path d="M 540 0 L 556 0 L 548 40 Z" />
        <path d="M 640 0 L 660 0 L 650 110 Z" />
        <path d="M 740 0 L 758 0 L 749 65 Z" />
        <path d="M 830 0 L 850 0 L 840 90 Z" />
        <path d="M 920 0 L 938 0 L 929 50 Z" />
        <path d="M 1020 0 L 1042 0 L 1031 100 Z" />
        <path d="M 1120 0 L 1138 0 L 1129 70 Z" />
      </g>

      {/* Pared del fondo con grietas */}
      <path
        d="M 0 60 Q 100 45 200 60 Q 350 80 480 60 Q 600 50 720 70 Q 850 85 980 65 Q 1100 50 1200 70 L 1200 380 L 0 380 Z"
        fill="#3D2818"
        opacity="0.7"
      />

      {/* Cristales brillantes en la pared (los Mairu de las cuevas) */}
      <g>
        <polygon points="180,200 188,180 196,200 188,220" fill="#A8DFE6" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite" />
        </polygon>
        <polygon points="380,170 386,155 392,170 386,185" fill="#C8E5EC" opacity="0.6">
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite" />
        </polygon>
        <polygon points="620,210 628,190 636,210 628,230" fill="#A8DFE6" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.4;0.7" dur="3.5s" repeatCount="indefinite" />
        </polygon>
        <polygon points="860,180 866,165 872,180 866,195" fill="#C8E5EC" opacity="0.65">
          <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2.8s" repeatCount="indefinite" />
        </polygon>
        <polygon points="1040,220 1048,200 1056,220 1048,240" fill="#A8DFE6" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.3;0.6" dur="3.2s" repeatCount="indefinite" />
        </polygon>
      </g>

      {/* Suelo de la cueva */}
      <path
        d="M 0 450 Q 200 430 400 445 Q 600 460 800 440 Q 1000 450 1200 435 L 1200 600 L 0 600 Z"
        fill="#1A100A"
      />
      <path
        d="M 0 450 Q 200 430 400 445 Q 600 460 800 440 Q 1000 450 1200 435"
        fill="none"
        stroke="#3D2818"
        strokeWidth="2"
      />

      {/* Estalagmitas (suelo) */}
      <g fill="#1A100A">
        <path d="M 130 600 L 138 480 L 146 600 Z" />
        <path d="M 240 600 L 252 460 L 264 600 Z" />
        <path d="M 920 600 L 930 470 L 940 600 Z" />
        <path d="M 1080 600 L 1090 490 L 1100 600 Z" />
      </g>

      {/* Brasero / fogata en el centro */}
      <g transform="translate(600, 480)">
        <ellipse cx="0" cy="20" rx="50" ry="8" fill="#1A100A" />
        {/* Piedras del círculo */}
        <ellipse cx="-40" cy="15" rx="10" ry="6" fill="#3D2818" />
        <ellipse cx="-22" cy="20" rx="9" ry="5" fill="#3D2818" />
        <ellipse cx="0" cy="22" rx="11" ry="5" fill="#3D2818" />
        <ellipse cx="22" cy="20" rx="9" ry="5" fill="#3D2818" />
        <ellipse cx="40" cy="15" rx="10" ry="6" fill="#3D2818" />
        {/* Halo de la lumbre */}
        <ellipse cx="0" cy="0" rx="120" ry="80" fill="url(#kobazuloa-fire)" opacity="0.85">
          <animate attributeName="rx" values="120;130;120" dur="2.4s" repeatCount="indefinite" />
        </ellipse>
        {/* Llamas */}
        <path d="M -14 12 Q -8 -10 0 -25 Q 8 -10 14 12 Q 8 5 0 8 Q -8 5 -14 12 Z" fill="#FFD53D">
          <animate attributeName="d"
            values="M -14 12 Q -8 -10 0 -25 Q 8 -10 14 12 Q 8 5 0 8 Q -8 5 -14 12 Z;
                    M -12 12 Q -7 -8 0 -22 Q 7 -8 12 12 Q 7 5 0 8 Q -7 5 -12 12 Z;
                    M -14 12 Q -8 -10 0 -25 Q 8 -10 14 12 Q 8 5 0 8 Q -8 5 -14 12 Z"
            dur="0.5s" repeatCount="indefinite" />
        </path>
        <path d="M -8 8 Q -4 -4 0 -14 Q 4 -4 8 8 Z" fill="#FFFDE7">
          <animate attributeName="d"
            values="M -8 8 Q -4 -4 0 -14 Q 4 -4 8 8 Z;
                    M -7 8 Q -3 -3 0 -12 Q 3 -3 7 8 Z;
                    M -8 8 Q -4 -4 0 -14 Q 4 -4 8 8 Z"
            dur="0.4s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Ojos rojos de jentilak en la oscuridad */}
      <g>
        <circle cx="100" cy="380" r="2.5" fill="#FF4422">
          <animate attributeName="opacity" values="0;0.9;0.9;0" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle cx="108" cy="380" r="2.5" fill="#FF4422">
          <animate attributeName="opacity" values="0;0.9;0.9;0" dur="6s" repeatCount="indefinite" />
        </circle>
        <circle cx="1090" cy="395" r="2.5" fill="#FF4422">
          <animate attributeName="opacity" values="0;0;0.9;0.9;0" dur="7s" repeatCount="indefinite" />
        </circle>
        <circle cx="1098" cy="395" r="2.5" fill="#FF4422">
          <animate attributeName="opacity" values="0;0;0.9;0.9;0" dur="7s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Murciélago volando */}
      <g fill="#0A0608" opacity="0.7">
        <path d="M 200 130 q -8 -5 -14 -1 q 6 -2 10 1 q -6 0 -10 4 q 8 -2 14 1 q 6 -3 14 -1 q -4 -4 -10 -4 q 4 -3 10 -1 q -6 -4 -14 1 z" />
      </g>
    </g>
  )
}

// ============================================================
// IRATIA — Bosque nocturno con luciérnagas y luna llena
// ============================================================
function IratiaMap() {
  return (
    <g>
      <defs>
        <linearGradient id="iratia-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A0E2A" />
          <stop offset="60%" stopColor="#1A1F4A" />
          <stop offset="100%" stopColor="#2A2A3F" />
        </linearGradient>
        <radialGradient id="iratia-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="30%" stopColor="#F0E5C8" />
          <stop offset="100%" stopColor="#F0E5C8" stopOpacity="0" />
        </radialGradient>
        <filter id="iratia-glow">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      <rect width="1200" height="600" fill="url(#iratia-sky)" />

      {/* Estrellas */}
      <g fill="#FFFDE7">
        {Array.from({ length: 50 }, (_, i) => {
          const x = (i * 137) % 1200
          const y = (i * 71) % 300
          const r = 0.6 + ((i * 13) % 10) / 12
          return (
            <circle key={i} cx={x} cy={y} r={r}>
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur={`${2 + (i % 5) * 0.5}s`}
                repeatCount="indefinite"
                begin={`${(i * 0.2) % 3}s`}
              />
            </circle>
          )
        })}
      </g>

      {/* Luna grande */}
      <circle cx="900" cy="140" r="110" fill="url(#iratia-moon)" opacity="0.5" />
      <circle cx="900" cy="140" r="60" fill="#FFFDE7" />
      <circle cx="884" cy="128" r="6" fill="#E8DCB8" opacity="0.7" />
      <circle cx="918" cy="148" r="4" fill="#E8DCB8" opacity="0.7" />
      <circle cx="894" cy="158" r="3" fill="#E8DCB8" opacity="0.6" />

      {/* Niebla alta */}
      <ellipse cx="600" cy="300" rx="700" ry="40" fill="#5A5A8A" opacity="0.25" />

      {/* Hayas y pinos (siluetas) */}
      <g fill="#0A0E1A">
        {/* Pinos triangulares */}
        <path d="M 100 600 L 100 350 L 80 380 L 120 380 L 100 410 L 75 420 L 125 420 L 100 450 L 70 460 L 130 460 L 100 500 L 65 520 L 135 520 L 100 600 Z" />
        <path d="M 220 600 L 220 320 L 195 360 L 245 360 L 220 395 L 190 405 L 250 405 L 220 440 L 185 450 L 255 450 L 220 490 L 180 510 L 260 510 L 220 600 Z" />
        <path d="M 360 600 L 360 380 L 340 410 L 380 410 L 360 440 L 335 450 L 385 450 L 360 480 L 330 500 L 390 500 L 360 600 Z" />
        {/* Árbol espeso central */}
        <ellipse cx="600" cy="380" rx="60" ry="100" />
        <rect x="592" y="450" width="16" height="150" />
        {/* Más pinos */}
        <path d="M 820 600 L 820 350 L 795 390 L 845 390 L 820 425 L 790 435 L 850 435 L 820 470 L 785 480 L 855 480 L 820 520 L 780 540 L 860 540 L 820 600 Z" />
        <path d="M 1060 600 L 1060 380 L 1040 410 L 1080 410 L 1060 440 L 1035 450 L 1085 450 L 1060 480 L 1030 500 L 1090 500 L 1060 600 Z" />
      </g>

      {/* Niebla baja */}
      <ellipse cx="200" cy="540" rx="280" ry="30" fill="#5A5A8A" opacity="0.35" filter="url(#iratia-glow)" />
      <ellipse cx="700" cy="555" rx="350" ry="35" fill="#5A5A8A" opacity="0.3" filter="url(#iratia-glow)" />
      <ellipse cx="1050" cy="545" rx="250" ry="28" fill="#5A5A8A" opacity="0.3" filter="url(#iratia-glow)" />

      {/* Luciérnagas */}
      <g>
        {Array.from({ length: 12 }, (_, i) => {
          const x = 150 + ((i * 89) % 900)
          const y = 380 + ((i * 41) % 180)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#A8FFA8"
              filter="url(#iratia-glow)"
              opacity="0.9"
            >
              <animate
                attributeName="opacity"
                values="0.2;1;0.2"
                dur={`${1.5 + (i % 4) * 0.4}s`}
                repeatCount="indefinite"
                begin={`${(i * 0.3) % 2}s`}
              />
              <animate
                attributeName="cy"
                values={`${y};${y - 15};${y}`}
                dur={`${3 + (i % 3) * 0.5}s`}
                repeatCount="indefinite"
              />
            </circle>
          )
        })}
      </g>

      {/* Núcleo brillante */}
      <g>
        {Array.from({ length: 12 }, (_, i) => {
          const x = 150 + ((i * 89) % 900)
          const y = 380 + ((i * 41) % 180)
          return (
            <circle key={`c-${i}`} cx={x} cy={y} r="1.2" fill="#FFFDE7" opacity="0.95">
              <animate
                attributeName="opacity"
                values="0.2;1;0.2"
                dur={`${1.5 + (i % 4) * 0.4}s`}
                repeatCount="indefinite"
                begin={`${(i * 0.3) % 2}s`}
              />
              <animate
                attributeName="cy"
                values={`${y};${y - 15};${y}`}
                dur={`${3 + (i % 3) * 0.5}s`}
                repeatCount="indefinite"
              />
            </circle>
          )
        })}
      </g>

      {/* Silueta de sorgina al fondo */}
      <g opacity="0.5" fill="#0A0E1A">
        <ellipse cx="500" cy="430" rx="10" ry="22" />
        <circle cx="500" cy="402" r="8" />
        {/* Sombrero puntiagudo */}
        <path d="M 489 400 L 500 380 L 511 400 Z" />
        {/* Escoba */}
        <line x1="495" y1="450" x2="475" y2="475" stroke="#0A0E1A" strokeWidth="2" />
      </g>
    </g>
  )
}
