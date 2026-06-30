import type { MissionMapId } from '@/lib/missions/maps'

type Props = {
  mapId: MissionMapId
}

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
      {mapId === 'akelarre' && <AkelarreMap />}
      {mapId === 'burdinola' && <BurdinolaMap />}
      {mapId === 'itsasertza' && <ItsasertzaMap />}
      {mapId === 'larre' && <LarreMap />}
      {mapId === 'menditontorra' && <MenditontorraMap />}
    </svg>
  )
}

// ANBOTO — Cueva en el flanco superior (no en la punta)
function AnbotoMap() {
  return (
    <g>
      <defs>
        <linearGradient id="anboto-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F0F1F" />
          <stop offset="30%" stopColor="#1A1A2E" />
          <stop offset="60%" stopColor="#2C2A4A" />
          <stop offset="100%" stopColor="#5A4A6B" />
        </linearGradient>
        <radialGradient id="anboto-aura" cx="0.5" cy="0.45" r="0.5">
          <stop offset="0%" stopColor="#FFD53D" stopOpacity="0.45" />
          <stop offset="40%" stopColor="#E8B53B" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="anboto-cave-glow" cx="0.5" cy="0.7" r="0.6">
          <stop offset="0%" stopColor="#FFFDE7" stopOpacity="1" />
          <stop offset="25%" stopColor="#FFD53D" stopOpacity="0.95" />
          <stop offset="65%" stopColor="#C24617" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0A0612" stopOpacity="0" />
        </radialGradient>
        <filter id="anboto-mist"><feGaussianBlur stdDeviation="10" /></filter>
      </defs>
      <rect width="1200" height="600" fill="url(#anboto-sky)" />
      <ellipse cx="660" cy="245" rx="320" ry="160" fill="url(#anboto-aura)">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="4s" repeatCount="indefinite" />
        <animate attributeName="rx" values="320;360;320" dur="4s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="180" cy="70" rx="220" ry="32" fill="#0A0A1A" opacity="0.85"><animate attributeName="cx" values="180;240;180" dur="40s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="500" cy="50" rx="180" ry="22" fill="#1A1A2E" opacity="0.75"><animate attributeName="cx" values="500;440;500" dur="50s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="900" cy="80" rx="280" ry="38" fill="#0A0A1A" opacity="0.8"><animate attributeName="cx" values="900;960;900" dur="45s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="350" cy="120" rx="160" ry="24" fill="#1A1A2E" opacity="0.6"><animate attributeName="cx" values="350;420;350" dur="55s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="850" cy="150" rx="200" ry="26" fill="#1A1A2E" opacity="0.55"><animate attributeName="cx" values="850;790;850" dur="60s" repeatCount="indefinite" /></ellipse>
      <path d="M 220 30 L 200 100 L 220 100 L 195 180 L 240 100 L 220 100 Z" fill="#FFD53D"><animate attributeName="opacity" values="0;0.95;0;0;0;0;0;0;0;0" dur="8s" repeatCount="indefinite" /></path>
      <path d="M 410 50 L 390 120 L 410 120 L 385 200 L 430 120 L 410 120 Z" fill="#FFFDE7"><animate attributeName="opacity" values="0;0;0.9;0;0;0;0;0;0;0" dur="8s" repeatCount="indefinite" /></path>
      <path d="M 760 60 L 740 130 L 760 130 L 735 220 L 780 130 L 760 130 Z" fill="#FFD53D"><animate attributeName="opacity" values="0;0;0;0;0.95;0;0;0;0;0" dur="8s" repeatCount="indefinite" /></path>
      <path d="M 950 40 L 930 110 L 950 110 L 925 190 L 970 110 L 950 110 Z" fill="#FFFDE7"><animate attributeName="opacity" values="0;0;0;0;0;0;0.9;0;0;0" dur="8s" repeatCount="indefinite" /></path>
      <path d="M 0 410 L 100 360 L 200 390 L 320 330 L 450 370 L 580 320 L 720 370 L 850 330 L 980 370 L 1100 340 L 1200 390 L 1200 600 L 0 600 Z" fill="#2A2438" opacity="0.65" />
      <path d="M 200 600 L 280 480 L 360 420 L 440 350 L 520 270 L 580 200 L 600 165 L 620 200 L 680 270 L 760 350 L 840 420 L 920 480 L 1000 600 Z" fill="#1F1A2A" />
      <path d="M 600 165 L 620 200 L 680 270 L 760 350 L 840 420 L 920 480 L 1000 600 L 600 600 Z" fill="#0F0A18" opacity="0.7" />
      <path d="M 660 270 Q 640 320 670 360 Q 700 400 660 440 Q 620 480 650 520 Q 680 560 640 600" fill="none" stroke="#5A4A6B" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.6" />
      {/* CUEVA DE MARI en el flanco derecho */}
      <g>
        <path d="M 632 270 Q 620 250 628 230 Q 638 215 650 213 Q 665 213 678 224 Q 690 240 690 260 Q 690 275 685 280 L 678 278 Q 682 262 678 248 Q 670 232 655 230 Q 642 230 635 244 Q 630 260 638 278 Z" fill="#1A1525" />
        <path d="M 642 275 Q 642 245 658 235 Q 675 245 675 275 Z" fill="#050308" />
        <ellipse cx="658" cy="262" rx="9" ry="11" fill="url(#anboto-cave-glow)">
          <animate attributeName="opacity" values="0.85;1;0.7;1;0.85" dur="3.2s" repeatCount="indefinite" />
          <animate attributeName="ry" values="11;13;10;13;11" dur="3.2s" repeatCount="indefinite" />
        </ellipse>
        <circle cx="658" cy="265" r="2" fill="#FFFDE7"><animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" /></circle>
        <path d="M 648 244 L 649 250 L 650 244 Z" fill="#0A0612" />
        <path d="M 654 241 L 655 248 L 656 241 Z" fill="#0A0612" />
        <path d="M 662 241 L 663 248 L 664 241 Z" fill="#0A0612" />
        <path d="M 668 244 L 669 250 L 670 244 Z" fill="#0A0612" />
        <path d="M 638 240 Q 632 258 635 280 L 640 280 Q 638 260 642 245 Z" fill="#0F0A14" opacity="0.6" />
        <path d="M 682 240 Q 686 258 683 280 L 678 280 Q 680 260 678 245 Z" fill="#0F0A14" opacity="0.6" />
      </g>
      <g fill="#0A0612">
        <g><path d="M 0 0 q 9 -7 18 0 q -9 -3 -18 0 z" /><animateMotion dur="22s" repeatCount="indefinite" path="M -30 180 Q 300 130 700 200 Q 1000 250 1230 170" /></g>
        <g><path d="M 0 0 q 7 -6 14 0 q -7 -2 -14 0 z" /><animateMotion dur="18s" repeatCount="indefinite" path="M 1230 240 Q 800 200 400 280 Q 100 320 -30 250" /></g>
        <g><path d="M 0 0 q 8 -6 16 0 q -8 -2 -16 0 z" /><animateMotion dur="25s" repeatCount="indefinite" begin="3s" path="M -30 320 Q 250 280 550 350 Q 850 400 1230 310" /></g>
        <g><path d="M 0 0 q 10 -8 20 0 q -10 -3 -20 0 z" /><animateMotion dur="20s" repeatCount="indefinite" begin="5s" path="M 1230 110 Q 900 90 600 160 Q 300 220 -30 140" /></g>
        <path d="M 200 250 q 6 -5 12 0 q -6 -2 -12 0 z" opacity="0.5" />
        <path d="M 850 230 q 6 -5 12 0 q -6 -2 -12 0 z" opacity="0.5" />
        <path d="M 1050 220 q 7 -5 14 0 q -7 -2 -14 0 z" opacity="0.5" />
      </g>
      <ellipse cx="600" cy="525" rx="600" ry="60" fill="#5A4A6B" opacity="0.4" filter="url(#anboto-mist)"><animate attributeName="opacity" values="0.4;0.55;0.4" dur="6s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="300" cy="545" rx="320" ry="40" fill="#7B6B8B" opacity="0.3" filter="url(#anboto-mist)"><animate attributeName="cx" values="300;360;300" dur="20s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="900" cy="545" rx="340" ry="40" fill="#7B6B8B" opacity="0.3" filter="url(#anboto-mist)"><animate attributeName="cx" values="900;840;900" dur="22s" repeatCount="indefinite" /></ellipse>
    </g>
  )
}

// ITSASOA — Barco en el agua (translate y=390)
function ItsasoaMap() {
  return (
    <g>
      <defs>
        <linearGradient id="itsasoa-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF7E55" />
          <stop offset="40%" stopColor="#FFB58A" />
          <stop offset="80%" stopColor="#C97A55" />
          <stop offset="100%" stopColor="#6B4A6B" />
        </linearGradient>
        <linearGradient id="itsasoa-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5BA8B8" />
          <stop offset="40%" stopColor="#3A7F95" />
          <stop offset="100%" stopColor="#1F4A5C" />
        </linearGradient>
        <radialGradient id="itsasoa-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="55%" stopColor="#FFD53D" />
          <stop offset="100%" stopColor="#E8B53B" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="380" fill="url(#itsasoa-sky)" />
      <rect y="380" width="1200" height="220" fill="url(#itsasoa-sea)" />
      <circle cx="1050" cy="200" r="90" fill="url(#itsasoa-sun)">
        <animate attributeName="r" values="90;100;90" dur="5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.95;1;0.95" dur="5s" repeatCount="indefinite" />
      </circle>
      <circle cx="1050" cy="200" r="42" fill="#FFFDE7" />
      <circle cx="1050" cy="200" r="35" fill="#FFE5A8" opacity="0.7"><animate attributeName="opacity" values="0.7;0.9;0.7" dur="3s" repeatCount="indefinite" /></circle>
      <ellipse cx="1050" cy="400" rx="75" ry="7" fill="#FFFDE7" opacity="0.6"><animate attributeName="rx" values="75;82;75" dur="3s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="1050" cy="418" rx="55" ry="4" fill="#FFD53D" opacity="0.45"><animate attributeName="rx" values="55;62;55" dur="3.4s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="1050" cy="435" rx="42" ry="3" fill="#FFD53D" opacity="0.35"><animate attributeName="rx" values="42;48;42" dur="3.8s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="1050" cy="450" rx="32" ry="2" fill="#FFD53D" opacity="0.25" />
      <ellipse cx="240" cy="80" rx="200" ry="22" fill="#FFE5D0" opacity="0.85"><animate attributeName="cx" values="240;300;240" dur="60s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="120" cy="55" rx="100" ry="12" fill="#FFFDE7" opacity="0.7"><animate attributeName="cx" values="120;180;120" dur="55s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="640" cy="120" rx="240" ry="26" fill="#FFE5D0" opacity="0.7"><animate attributeName="cx" values="640;580;640" dur="65s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="850" cy="170" rx="150" ry="14" fill="#FFE5D0" opacity="0.5"><animate attributeName="cx" values="850;900;850" dur="50s" repeatCount="indefinite" /></ellipse>
      <path d="M 0 380 L 0 280 L 60 260 L 140 290 L 220 270 L 280 300 L 320 290 L 380 310 L 440 300 L 500 320 L 540 330 L 580 350 L 620 380 Z" fill="#3D2A3D" opacity="0.7" />
      <g>
        <rect x="180" y="262" width="24" height="22" fill="#8B6F3A" />
        <path d="M 178 262 L 192 250 L 206 262 Z" fill="#C24617" />
        <rect x="186" y="270" width="5" height="8" fill="#FFD53D"><animate attributeName="opacity" values="0.85;0.5;0.85" dur="3s" repeatCount="indefinite" /></rect>
        <rect x="195" y="270" width="5" height="8" fill="#FFD53D"><animate attributeName="opacity" values="0.5;0.85;0.5" dur="3.4s" repeatCount="indefinite" /></rect>
      </g>
      <g fill="#FFFDE7">
        <g><path d="M 0 0 q 11 -9 22 0 q -11 -4 -22 0 z" /><animateMotion dur="25s" repeatCount="indefinite" path="M -30 200 Q 300 180 600 220 Q 900 260 1230 200" /></g>
        <g><path d="M 0 0 q 9 -8 18 0 q -9 -3 -18 0 z" /><animateMotion dur="20s" repeatCount="indefinite" begin="2s" path="M 1230 130 Q 800 160 400 200 Q 100 240 -30 180" /></g>
        <g><path d="M 0 0 q 10 -8 20 0 q -10 -3 -20 0 z" /><animateMotion dur="28s" repeatCount="indefinite" begin="4s" path="M -30 270 Q 350 230 700 280 Q 1000 330 1230 250" /></g>
        <path d="M 230 260 q 8 -6 16 0 q -8 -2 -16 0 z" opacity="0.7" />
        <path d="M 650 230 q 7 -6 14 0 q -7 -2 -14 0 z" opacity="0.7" />
        <path d="M 900 130 q 9 -7 18 0 q -9 -3 -18 0 z" opacity="0.7" />
      </g>
      {/* BARCO en el agua: translate y=390 (antes 350 que estaba en el cielo) */}
      <g>
        <g transform="translate(380, 390)">
          <path d="M -20 0 L 20 0 L 16 8 L -16 8 Z" fill="#2A1F1F" />
          <line x1="0" y1="0" x2="0" y2="-30" stroke="#3D2A20" strokeWidth="1.5" />
          <path d="M 0 -30 L 15 -10 L 0 -10 Z" fill="#FFFDE7" />
          <path d="M 0 -30 L -12 -8 L 0 -8 Z" fill="#FFE5D0" />
          <animateTransform attributeName="transform" type="rotate" values="-3 0 8; 3 0 8; -3 0 8" dur="4s" repeatCount="indefinite" additive="sum" />
        </g>
        <animateTransform attributeName="transform" type="translate" values="0,0; 0,-2; 0,0; 0,2; 0,0" dur="4s" repeatCount="indefinite" />
      </g>
      <ellipse cx="720" cy="455" rx="220" ry="42" fill="#2F5F3F" />
      <ellipse cx="720" cy="446" rx="190" ry="32" fill="#3D7048" />
      <ellipse cx="720" cy="437" rx="160" ry="22" fill="#4F8F4F" />
      <ellipse cx="745" cy="430" rx="18" ry="9" fill="#3D2A20" />
      <ellipse cx="745" cy="427" rx="14" ry="6" fill="#5A4A3A" />
      <g transform="translate(745, 388)">
        <path d="M -14 36 Q -22 42 -38 50 Q -42 58 -36 64 L -28 60 L -16 56 L -8 52 Z" fill="#3A7F95">
          <animate attributeName="d" values="M -14 36 Q -22 42 -38 50 Q -42 58 -36 64 L -28 60 L -16 56 L -8 52 Z;M -14 36 Q -22 44 -36 50 Q -40 56 -34 62 L -28 60 L -16 56 L -8 52 Z;M -14 36 Q -22 42 -38 50 Q -42 58 -36 64 L -28 60 L -16 56 L -8 52 Z" dur="3s" repeatCount="indefinite" />
        </path>
        <path d="M -38 50 Q -48 52 -52 58 L -36 64 Z" fill="#5BA8B8" />
        <path d="M -42 58 L -54 62 L -48 68 L -36 64 Z" fill="#3A7F95" opacity="0.85" />
        <circle cx="-22" cy="48" r="1.5" fill="#5BA8B8" opacity="0.6" />
        <circle cx="-28" cy="52" r="1.5" fill="#5BA8B8" opacity="0.6" />
        <circle cx="-16" cy="46" r="1.5" fill="#5BA8B8" opacity="0.6" />
        <ellipse cx="0" cy="22" rx="12" ry="20" fill="#FFFDE7" opacity="0.7" />
        <ellipse cx="0" cy="22" rx="10" ry="18" fill="#A8DFE6" opacity="0.5" />
        <rect x="-8" y="20" width="16" height="2" fill="#8B6F1A" />
        <ellipse cx="-9" cy="18" rx="3" ry="9" fill="#E8B58A" transform="rotate(-15 -9 18)" />
        <ellipse cx="10" cy="14" rx="3" ry="9" fill="#E8B58A" transform="rotate(35 10 14)" />
        <rect x="-14" y="12" width="3" height="6" fill="#FFD53D" />
        <line x1="-14" y1="14" x2="-15" y2="18" stroke="#FFD53D" strokeWidth="0.8" />
        <line x1="-12" y1="14" x2="-12" y2="19" stroke="#FFD53D" strokeWidth="0.8" />
        <line x1="-10" y1="14" x2="-9" y2="18" stroke="#FFD53D" strokeWidth="0.8" />
        <circle cx="14" cy="6" r="3.5" fill="#C0E0E8" stroke="#FFD53D" strokeWidth="0.8"><animate attributeName="opacity" values="1;0.7;1" dur="2.5s" repeatCount="indefinite" /></circle>
        <circle cx="0" cy="-2" r="9" fill="#E8B58A" />
        <circle cx="-2.5" cy="-3" r="0.7" fill="#1A1A2E" />
        <circle cx="2.5" cy="-3" r="0.7" fill="#1A1A2E" />
        <path d="M -2 1 Q 0 2.5 2 1" fill="none" stroke="#A85D3D" strokeWidth="0.6" />
        <path d="M -9 -4 Q -16 18 -10 40 Q -2 36 0 24 Q 2 36 10 40 Q 16 18 9 -4 Q 5 -11 -5 -11 Z" fill="#FFD53D" opacity="0.95">
          <animate attributeName="d" values="M -9 -4 Q -16 18 -10 40 Q -2 36 0 24 Q 2 36 10 40 Q 16 18 9 -4 Q 5 -11 -5 -11 Z;M -9 -4 Q -18 20 -12 42 Q -3 38 0 24 Q 3 38 12 42 Q 18 20 9 -4 Q 5 -11 -5 -11 Z;M -9 -4 Q -16 18 -10 40 Q -2 36 0 24 Q 2 36 10 40 Q 16 18 9 -4 Q 5 -11 -5 -11 Z" dur="4s" repeatCount="indefinite" />
        </path>
        <path d="M -8 8 Q -14 18 -12 28" stroke="#E8B53B" strokeWidth="0.8" fill="none" opacity="0.8" />
        <path d="M 9 8 Q 14 18 12 28" stroke="#E8B53B" strokeWidth="0.8" fill="none" opacity="0.8" />
      </g>
      <ellipse cx="280" cy="475" rx="130" ry="26" fill="#2F5F3F" />
      <ellipse cx="280" cy="468" rx="105" ry="18" fill="#3D7048" />
      <ellipse cx="270" cy="463" rx="8" ry="3" fill="#3D2A20" />
      <line x1="270" y1="463" x2="270" y2="448" stroke="#3D2A20" strokeWidth="1.5" />
      <circle cx="266" cy="445" r="3" fill="#3D7048" />
      <circle cx="272" cy="442" r="3.5" fill="#3D7048" />
      <circle cx="276" cy="446" r="3" fill="#5B8B3A" />
      <ellipse cx="1090" cy="500" rx="100" ry="20" fill="#2F5F3F" />
      <ellipse cx="1090" cy="494" rx="75" ry="13" fill="#3D7048" />
      <g fill="none" stroke="#FFFDE7" strokeWidth="1.5" opacity="0.6">
        <path d="M 50 420 Q 80 415 110 420 T 170 420"><animate attributeName="d" values="M 50 420 Q 80 415 110 420 T 170 420;M 50 420 Q 80 425 110 420 T 170 420;M 50 420 Q 80 415 110 420 T 170 420" dur="2.5s" repeatCount="indefinite" /></path>
        <path d="M 400 460 Q 430 455 460 460 T 520 460"><animate attributeName="d" values="M 400 460 Q 430 455 460 460 T 520 460;M 400 460 Q 430 465 460 460 T 520 460;M 400 460 Q 430 455 460 460 T 520 460" dur="2.8s" repeatCount="indefinite" /></path>
        <path d="M 850 450 Q 880 445 910 450 T 970 450"><animate attributeName="d" values="M 850 450 Q 880 445 910 450 T 970 450;M 850 450 Q 880 455 910 450 T 970 450;M 850 450 Q 880 445 910 450 T 970 450" dur="3s" repeatCount="indefinite" /></path>
        <path d="M 150 500 Q 180 495 210 500 T 270 500" />
        <path d="M 550 530 Q 580 525 610 530 T 670 530" />
        <path d="M 950 510 Q 980 505 1010 510 T 1070 510" />
        <path d="M 200 555 Q 240 550 280 555 T 360 555" />
        <path d="M 700 565 Q 740 560 780 565 T 860 565" />
      </g>
      <ellipse cx="500" cy="455" rx="16" ry="3" fill="#FFFDE7" opacity="0.7"><animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite" /><animate attributeName="rx" values="16;22;16" dur="3s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="950" cy="465" rx="18" ry="3" fill="#FFFDE7" opacity="0.6"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="3.5s" repeatCount="indefinite" /></ellipse>
    </g>
  )
}

// BASOA (sin cambios)
function BasoaMap() {
  return (
    <g>
      <defs>
        <linearGradient id="basoa-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A5A3A" />
          <stop offset="40%" stopColor="#2A4A2E" />
          <stop offset="100%" stopColor="#0F2A1A" />
        </linearGradient>
        <radialGradient id="basoa-light" cx="0.5" cy="0.3" r="0.6">
          <stop offset="0%" stopColor="#F0E0A8" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#A8C878" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <filter id="basoa-blur"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>
      <rect width="1200" height="600" fill="url(#basoa-bg)" />
      <polygon points="380,0 320,600 460,600 440,0" fill="url(#basoa-light)" opacity="0.7"><animate attributeName="opacity" values="0.7;0.95;0.7" dur="6s" repeatCount="indefinite" /></polygon>
      <polygon points="780,0 750,600 880,600 850,0" fill="url(#basoa-light)" opacity="0.55"><animate attributeName="opacity" values="0.55;0.8;0.55" dur="7s" repeatCount="indefinite" /></polygon>
      <polygon points="160,0 130,600 230,600 210,0" fill="url(#basoa-light)" opacity="0.4"><animate attributeName="opacity" values="0.4;0.65;0.4" dur="5s" repeatCount="indefinite" /></polygon>
      <g fill="#0F2A1A" opacity="0.85" filter="url(#basoa-blur)">
        {Array.from({ length: 18 }, (_, i) => {
          const x = 20 + i * 70
          const h = 250 + ((i * 37) % 80)
          return <rect key={i} x={x} y={600 - h} width="9" height={h} />
        })}
      </g>
      <g fill="#3D2A20">
        <path d="M 80 600 L 100 240 L 118 240 L 134 600 Z" />
        <path d="M 220 600 L 240 190 L 260 190 L 278 600 Z" />
        <path d="M 920 600 L 940 210 L 960 210 L 978 600 Z" />
        <path d="M 1080 600 L 1100 270 L 1120 270 L 1138 600 Z" />
        <path d="M 730 600 L 745 280 L 760 280 L 775 600 Z" />
      </g>
      <g fill="#5B8B3A" opacity="0.65">
        <ellipse cx="108" cy="400" rx="22" ry="15" />
        <ellipse cx="108" cy="450" rx="20" ry="11" />
        <ellipse cx="248" cy="380" rx="24" ry="15" />
        <ellipse cx="950" cy="400" rx="24" ry="15" />
        <ellipse cx="1108" cy="430" rx="20" ry="11" />
        <ellipse cx="752" cy="420" rx="18" ry="12" />
      </g>
      <g fill="#3D5C2A">
        <ellipse cx="108" cy="220" rx="110" ry="90"><animate attributeName="cx" values="108;112;108" dur="6s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="248" cy="170" rx="130" ry="100"><animate attributeName="cx" values="248;244;248" dur="7s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="950" cy="185" rx="125" ry="95"><animate attributeName="cx" values="950;954;950" dur="8s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="1108" cy="240" rx="105" ry="85" />
        <ellipse cx="752" cy="250" rx="95" ry="78" />
      </g>
      <g fill="#5B8B3A" opacity="0.85">
        <ellipse cx="80" cy="200" rx="75" ry="60" />
        <ellipse cx="225" cy="145" rx="92" ry="68" />
        <ellipse cx="935" cy="160" rx="88" ry="65" />
        <ellipse cx="1085" cy="215" rx="70" ry="55" />
        <ellipse cx="730" cy="225" rx="68" ry="55" />
      </g>
      <g fill="#7CD876" opacity="0.7">
        <ellipse cx="60" cy="180" rx="22" ry="16" />
        <ellipse cx="195" cy="125" rx="28" ry="20" />
        <ellipse cx="905" cy="140" rx="25" ry="18" />
      </g>
      <g>
        {Array.from({ length: 14 }, (_, i) => {
          const x = (i * 89) % 1200
          const dur = 10 + (i % 5) * 2
          const begin = (i * 0.7) % 8
          const color = i % 3 === 0 ? '#C24617' : i % 3 === 1 ? '#E8B53B' : '#5B8B3A'
          return (
            <g key={i} fill={color} opacity="0.85">
              <ellipse cx="0" cy="0" rx="4" ry="2.5" transform={`rotate(${(i * 31) % 360})`} />
              <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${begin}s`} path={`M ${x} -20 Q ${x + 40} 200 ${x - 30} 400 Q ${x + 20} 500 ${x - 10} 620`} />
              <animateTransform attributeName="transform" type="rotate" values="0;360" dur={`${4 + (i % 3)}s`} repeatCount="indefinite" additive="sum" />
            </g>
          )
        })}
      </g>
      <path d="M 0 480 Q 200 460 400 475 Q 600 485 800 470 Q 1000 480 1200 465 L 1200 600 L 0 600 Z" fill="#2A1F14" />
      <path d="M 470 600 Q 510 570 490 540 Q 470 510 510 480 Q 540 460 525 440" stroke="#5BA8B8" strokeWidth="6" fill="none" opacity="0.7" />
      <g fill="#5B8B3A">
        <path d="M 180 540 Q 175 510 170 490 Q 168 500 162 502 Q 168 506 165 514 Q 158 514 158 522 Q 165 522 163 530 Q 156 530 156 538 Q 162 538 160 546 Z" />
        <path d="M 360 555 Q 355 525 350 505 Q 348 515 342 517 Q 348 521 345 529 Q 338 529 338 537 Q 345 537 343 545 Q 336 545 336 553 Z" />
        <path d="M 620 560 Q 615 530 610 510 Q 608 520 602 522 Q 608 526 605 534 Q 598 534 598 542 Q 605 542 603 550 Q 596 550 596 558 Z" />
        <path d="M 880 555 Q 875 525 870 505 Q 868 515 862 517 Q 868 521 865 529 Q 858 529 858 537 Q 865 537 863 545 Q 856 545 856 553 Z" />
        <path d="M 1020 545 Q 1015 515 1010 495 Q 1008 505 1002 507 Q 1008 511 1005 519 Q 998 519 998 527 Q 1005 527 1003 535 Q 996 535 996 543 Z" />
      </g>
      <g>
        {[{x:320,y:562},{x:460,y:575},{x:680,y:568},{x:850,y:580},{x:1050,y:565}].map((p,i)=>(
          <g key={i}>
            <path d={`M ${p.x} ${p.y} Q ${p.x} ${p.y-18} ${p.x+12} ${p.y-18} Q ${p.x+24} ${p.y-18} ${p.x+24} ${p.y} Z`} fill="#C24617"><animate attributeName="opacity" values="0.85;1;0.85" dur={`${3+(i%3)}s`} repeatCount="indefinite" /></path>
            <circle cx={p.x+8} cy={p.y-10} r="1.8" fill="#FFFDE7" />
            <circle cx={p.x+16} cy={p.y-7} r="1.5" fill="#FFFDE7" />
            <circle cx={p.x+12} cy={p.y-14} r="1.3" fill="#FFFDE7" />
            <rect x={p.x+9} y={p.y} width="6" height="10" fill="#F0E0C0" />
          </g>
        ))}
      </g>
      <g>
        <g fill="#FFD53D" opacity="0.9">
          <g><ellipse cx="-3" cy="0" rx="4" ry="6" /><ellipse cx="3" cy="0" rx="4" ry="6" /><ellipse cx="-3" cy="6" rx="3" ry="4" /><ellipse cx="3" cy="6" rx="3" ry="4" /><rect x="-0.5" y="-2" width="1" height="10" fill="#1A1A2E" /></g>
          <animateMotion dur="14s" repeatCount="indefinite" path="M 580 360 Q 650 320 720 380 Q 790 440 720 500 Q 650 460 580 410 Q 510 380 580 360" />
        </g>
        <g fill="#FF7E55" opacity="0.85">
          <g><ellipse cx="-3" cy="0" rx="3.5" ry="5" /><ellipse cx="3" cy="0" rx="3.5" ry="5" /><rect x="-0.5" y="-2" width="1" height="8" fill="#1A1A2E" /></g>
          <animateMotion dur="18s" repeatCount="indefinite" begin="2s" path="M 380 380 Q 450 340 520 400 Q 580 460 480 480 Q 380 460 350 420 Z" />
        </g>
      </g>
      <g opacity="0.75" fill="#0E0A08">
        <ellipse cx="555" cy="395" rx="22" ry="42" />
        <circle cx="555" cy="358" r="14" />
        <path d="M 540 355 Q 535 395 542 420 L 568 420 Q 575 395 570 355 Z" />
        <circle cx="551" cy="356" r="1.5" fill="#FFD53D"><animate attributeName="opacity" values="0.8;0.2;0.8;0.8;1;0.8" dur="4s" repeatCount="indefinite" /></circle>
        <circle cx="559" cy="356" r="1.5" fill="#FFD53D"><animate attributeName="opacity" values="0.8;0.2;0.8;0.8;1;0.8" dur="4s" repeatCount="indefinite" /></circle>
        <line x1="572" y1="395" x2="585" y2="440" stroke="#3D2A20" strokeWidth="3" />
      </g>
    </g>
  )
}

// KOBAZULOA
function KobazuloaMap() {
  return (
    <g>
      <defs>
        <radialGradient id="kobazuloa-bg" cx="0.5" cy="0.85" r="0.7">
          <stop offset="0%" stopColor="#6B4A2A" />
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
      <g fill="#2A1B14">
        <path d="M 60 0 L 78 0 L 70 90 Z" />
        <path d="M 140 0 L 158 0 L 149 65 Z" />
        <path d="M 220 0 L 240 0 L 230 110 Z" />
        <path d="M 320 0 L 338 0 L 329 55 Z" />
        <path d="M 410 0 L 432 0 L 421 100 Z" />
        <path d="M 510 0 L 526 0 L 518 45 Z" />
        <path d="M 590 0 L 606 0 L 598 35 Z" />
        <path d="M 660 0 L 680 0 L 670 90 Z" />
        <path d="M 740 0 L 758 0 L 749 70 Z" />
        <path d="M 820 0 L 838 0 L 829 50 Z" />
        <path d="M 890 0 L 910 0 L 900 105 Z" />
        <path d="M 970 0 L 988 0 L 979 60 Z" />
        <path d="M 1040 0 L 1062 0 L 1051 95 Z" />
        <path d="M 1110 0 L 1132 0 L 1121 75 Z" />
      </g>
      <circle cx="230" cy="115" r="1.5" fill="#A8DFE6" opacity="0.8"><animate attributeName="cy" values="115;180;180" dur="4s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.8;0.8;0" dur="4s" repeatCount="indefinite" /></circle>
      <circle cx="900" cy="110" r="1.5" fill="#A8DFE6" opacity="0.8"><animate attributeName="cy" values="110;185;185" dur="5s" repeatCount="indefinite" begin="2s" /><animate attributeName="opacity" values="0.8;0.8;0" dur="5s" repeatCount="indefinite" begin="2s" /></circle>
      <circle cx="420" cy="105" r="1.3" fill="#A8DFE6" opacity="0.8"><animate attributeName="cy" values="105;170;170" dur="4.5s" repeatCount="indefinite" begin="1s" /><animate attributeName="opacity" values="0.8;0.8;0" dur="4.5s" repeatCount="indefinite" begin="1s" /></circle>
      <circle cx="670" cy="95" r="1.5" fill="#A8DFE6" opacity="0.8"><animate attributeName="cy" values="95;160;160" dur="5.5s" repeatCount="indefinite" begin="3s" /><animate attributeName="opacity" values="0.8;0.8;0" dur="5.5s" repeatCount="indefinite" begin="3s" /></circle>
      <circle cx="1050" cy="100" r="1.3" fill="#A8DFE6" opacity="0.8"><animate attributeName="cy" values="100;165;165" dur="4.8s" repeatCount="indefinite" begin="0.5s" /><animate attributeName="opacity" values="0.8;0.8;0" dur="4.8s" repeatCount="indefinite" begin="0.5s" /></circle>
      <path d="M 0 60 Q 100 45 200 60 Q 350 80 480 60 Q 600 50 720 70 Q 850 85 980 65 Q 1100 50 1200 70 L 1200 380 L 0 380 Z" fill="#3D2818" opacity="0.7" />
      <g fill="#C24617" opacity="0.5" transform="translate(180, 210)">
        <ellipse cx="0" cy="0" rx="22" ry="9" />
        <ellipse cx="-18" cy="-2" rx="6" ry="5" />
        <line x1="-22" y1="3" x2="-22" y2="14" stroke="#C24617" strokeWidth="2" />
        <line x1="-18" y1="3" x2="-18" y2="14" stroke="#C24617" strokeWidth="2" />
        <line x1="16" y1="3" x2="16" y2="14" stroke="#C24617" strokeWidth="2" />
        <line x1="20" y1="3" x2="20" y2="14" stroke="#C24617" strokeWidth="2" />
      </g>
      <g fill="#C24617" opacity="0.45" transform="translate(950, 230)">
        <path d="M -8 8 Q -10 -2 -6 -8 Q -2 -10 0 -6 Q 2 -10 6 -8 Q 10 -2 8 8 Z" />
      </g>
      <g>
        <polygon points="180,200 188,180 196,200 188,220" fill="#A8DFE6" opacity="0.7"><animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite" /></polygon>
        <polygon points="380,170 386,155 392,170 386,185" fill="#C8E5EC" opacity="0.6"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite" /></polygon>
        <polygon points="620,210 628,190 636,210 628,230" fill="#A8DFE6" opacity="0.7"><animate attributeName="opacity" values="0.7;0.4;0.7" dur="3.5s" repeatCount="indefinite" /></polygon>
        <polygon points="860,180 866,165 872,180 866,195" fill="#C8E5EC" opacity="0.65"><animate attributeName="opacity" values="0.4;0.7;0.4" dur="2.8s" repeatCount="indefinite" /></polygon>
        <polygon points="1040,220 1048,200 1056,220 1048,240" fill="#A8DFE6" opacity="0.6"><animate attributeName="opacity" values="0.6;0.3;0.6" dur="3.2s" repeatCount="indefinite" /></polygon>
        <polygon points="450,250 456,235 462,250 456,265" fill="#C8E5EC" opacity="0.55"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="3.8s" repeatCount="indefinite" /></polygon>
      </g>
      <path d="M 0 450 Q 200 430 400 445 Q 600 460 800 440 Q 1000 450 1200 435 L 1200 600 L 0 600 Z" fill="#1A100A" />
      <g fill="#1A100A">
        <path d="M 130 600 L 138 480 L 146 600 Z" />
        <path d="M 240 600 L 252 460 L 264 600 Z" />
        <path d="M 920 600 L 930 470 L 940 600 Z" />
        <path d="M 1080 600 L 1090 490 L 1100 600 Z" />
        <path d="M 60 600 L 70 510 L 80 600 Z" />
        <path d="M 800 600 L 810 500 L 820 600 Z" />
      </g>
      <g transform="translate(600, 480)">
        <ellipse cx="0" cy="20" rx="55" ry="9" fill="#1A100A" />
        <ellipse cx="-44" cy="15" rx="12" ry="7" fill="#3D2818" />
        <ellipse cx="-22" cy="20" rx="10" ry="6" fill="#3D2818" />
        <ellipse cx="0" cy="22" rx="12" ry="6" fill="#3D2818" />
        <ellipse cx="22" cy="20" rx="10" ry="6" fill="#3D2818" />
        <ellipse cx="44" cy="15" rx="12" ry="7" fill="#3D2818" />
        <ellipse cx="0" cy="0" rx="140" ry="100" fill="url(#kobazuloa-fire)" opacity="0.85"><animate attributeName="rx" values="140;160;140" dur="2.4s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.85;1;0.85" dur="2.4s" repeatCount="indefinite" /></ellipse>
        <path d="M -16 12 Q -10 -14 0 -32 Q 10 -14 16 12 Q 10 5 0 8 Q -10 5 -16 12 Z" fill="#FFD53D"><animate attributeName="d" values="M -16 12 Q -10 -14 0 -32 Q 10 -14 16 12 Q 10 5 0 8 Q -10 5 -16 12 Z;M -14 12 Q -8 -12 0 -28 Q 8 -12 14 12 Q 8 5 0 8 Q -8 5 -14 12 Z;M -16 12 Q -10 -14 0 -32 Q 10 -14 16 12 Q 10 5 0 8 Q -10 5 -16 12 Z" dur="0.5s" repeatCount="indefinite" /></path>
        <path d="M -10 8 Q -5 -6 0 -18 Q 5 -6 10 8 Z" fill="#FFFDE7"><animate attributeName="d" values="M -10 8 Q -5 -6 0 -18 Q 5 -6 10 8 Z;M -8 8 Q -4 -4 0 -14 Q 4 -4 8 8 Z;M -10 8 Q -5 -6 0 -18 Q 5 -6 10 8 Z" dur="0.4s" repeatCount="indefinite" /></path>
        {Array.from({ length: 8 }, (_, i) => {
          const x = ((i * 13) % 20) - 10
          const dur = 1.8 + (i % 3) * 0.4
          return (
            <circle key={i} cx={x} cy="-20" r={0.7 + (i % 3) * 0.2} fill="#FFD53D">
              <animate attributeName="cy" values={`-20;-${50 + i * 4};-${50 + i * 4}`} dur={`${dur}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
              <animate attributeName="opacity" values="1;1;0" dur={`${dur}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
              <animate attributeName="cx" values={`${x};${x + (i % 2 === 0 ? 8 : -8)};${x + (i % 2 === 0 ? 8 : -8)}`} dur={`${dur}s`} repeatCount="indefinite" begin={`${i * 0.3}s`} />
            </circle>
          )
        })}
      </g>
      <g opacity="0.4" fill="#0A0608"><ellipse cx="120" cy="395" rx="18" ry="38" /><circle cx="120" cy="362" r="11" /></g>
      <g opacity="0.35" fill="#0A0608"><ellipse cx="1080" cy="400" rx="20" ry="42" /><circle cx="1080" cy="365" r="12" /></g>
      <g>
        <circle cx="116" cy="358" r="2" fill="#FF4422"><animate attributeName="opacity" values="0;0.9;0.9;0" dur="6s" repeatCount="indefinite" /></circle>
        <circle cx="124" cy="358" r="2" fill="#FF4422"><animate attributeName="opacity" values="0;0.9;0.9;0" dur="6s" repeatCount="indefinite" /></circle>
        <circle cx="1076" cy="362" r="2" fill="#FF4422"><animate attributeName="opacity" values="0;0;0.9;0.9;0" dur="7s" repeatCount="indefinite" /></circle>
        <circle cx="1084" cy="362" r="2" fill="#FF4422"><animate attributeName="opacity" values="0;0;0.9;0.9;0" dur="7s" repeatCount="indefinite" /></circle>
      </g>
      <g fill="#0A0608">
        <g opacity="0.85"><path d="M 0 0 q -10 -6 -16 -2 q 6 -2 10 1 q -6 0 -10 4 q 8 -2 14 1 q 6 -3 14 -1 q -4 -4 -10 -4 q 4 -3 10 -1 q -6 -4 -14 1 z" /><animateMotion dur="14s" repeatCount="indefinite" path="M -30 130 Q 250 80 500 150 Q 750 200 1000 130 Q 1200 100 1230 130" /></g>
        <g opacity="0.7"><path d="M 0 0 q -8 -5 -13 -1 q 5 -1 8 1 q -5 0 -8 3 q 6 -1 12 1 q 5 -2 12 -1 q -3 -3 -8 -3 q 3 -2 8 -1 q -5 -3 -12 1 z" transform="scale(0.8)" /><animateMotion dur="10s" repeatCount="indefinite" begin="3s" path="M 1230 240 Q 900 200 600 260 Q 300 320 -30 250" /></g>
        <g opacity="0.8"><path d="M 0 0 q -9 -6 -15 -1 q 6 -2 9 1 q -6 0 -9 4 q 7 -2 13 1 q 6 -3 13 -1 q -4 -4 -9 -4 q 4 -3 9 -1 q -6 -4 -13 1 z" /><animateMotion dur="16s" repeatCount="indefinite" begin="6s" path="M -30 280 Q 300 240 600 300 Q 900 360 1230 270" /></g>
      </g>
    </g>
  )
}

// IRATIA
function IratiaMap() {
  return (
    <g>
      <defs>
        <linearGradient id="iratia-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0A0E2A" /><stop offset="60%" stopColor="#1A1F4A" /><stop offset="100%" stopColor="#2A2A3F" /></linearGradient>
        <radialGradient id="iratia-moon" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stopColor="#FFFDE7" /><stop offset="30%" stopColor="#F0E5C8" /><stop offset="100%" stopColor="#F0E5C8" stopOpacity="0" /></radialGradient>
        <filter id="iratia-glow"><feGaussianBlur stdDeviation="1.5" /></filter>
      </defs>
      <rect width="1200" height="600" fill="url(#iratia-sky)" />
      <g fill="#FFFDE7">
        {Array.from({ length: 60 }, (_, i) => {
          const x = (i * 137) % 1200
          const y = (i * 71) % 320
          const r = 0.6 + ((i * 13) % 10) / 12
          return (
            <circle key={i} cx={x} cy={y} r={r}>
              <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + (i % 5) * 0.5}s`} repeatCount="indefinite" begin={`${(i * 0.2) % 3}s`} />
            </circle>
          )
        })}
      </g>
      <circle cx="880" cy="130" r="120" fill="url(#iratia-moon)" opacity="0.5"><animate attributeName="r" values="120;135;120" dur="6s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.5;0.7;0.5" dur="6s" repeatCount="indefinite" /></circle>
      <circle cx="880" cy="130" r="65" fill="#FFFDE7" />
      <circle cx="862" cy="118" r="7" fill="#E8DCB8" opacity="0.7" />
      <circle cx="900" cy="140" r="5" fill="#E8DCB8" opacity="0.7" />
      <circle cx="872" cy="148" r="4" fill="#E8DCB8" opacity="0.6" />
      <ellipse cx="600" cy="290" rx="700" ry="45" fill="#5A5A8A" opacity="0.3"><animate attributeName="cx" values="600;560;600" dur="20s" repeatCount="indefinite" /></ellipse>
      <g fill="#0A0E1A">
        <path d="M 100 600 L 100 340 L 80 370 L 120 370 L 100 400 L 75 410 L 125 410 L 100 440 L 70 450 L 130 450 L 100 490 L 65 510 L 135 510 L 100 600 Z" />
        <path d="M 220 600 L 220 310 L 195 350 L 245 350 L 220 385 L 190 395 L 250 395 L 220 430 L 185 440 L 255 440 L 220 480 L 180 500 L 260 500 L 220 600 Z" />
        <path d="M 350 600 L 350 370 L 330 400 L 370 400 L 350 430 L 325 440 L 375 440 L 350 470 L 320 490 L 380 490 L 350 600 Z" />
        <path d="M 460 600 L 460 320 L 435 360 L 485 360 L 460 395 L 430 405 L 490 405 L 460 440 L 425 450 L 495 450 L 460 490 L 420 510 L 500 510 L 460 600 Z" />
        <ellipse cx="580" cy="380" rx="55" ry="95" />
        <rect x="572" y="450" width="16" height="150" />
        <path d="M 780 600 L 780 340 L 755 380 L 805 380 L 780 415 L 750 425 L 810 425 L 780 460 L 745 470 L 815 470 L 780 510 L 740 530 L 820 530 L 780 600 Z" />
        <path d="M 1020 600 L 1020 370 L 1000 400 L 1040 400 L 1020 430 L 995 440 L 1045 440 L 1020 470 L 990 490 L 1050 490 L 1020 600 Z" />
        <path d="M 1140 600 L 1140 340 L 1115 380 L 1165 380 L 1140 415 L 1110 425 L 1170 425 L 1140 460 L 1105 470 L 1175 470 L 1140 600 Z" />
      </g>
      <ellipse cx="200" cy="540" rx="280" ry="30" fill="#5A5A8A" opacity="0.35" filter="url(#iratia-glow)"><animate attributeName="cx" values="200;250;200" dur="22s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="700" cy="555" rx="350" ry="35" fill="#5A5A8A" opacity="0.3" filter="url(#iratia-glow)"><animate attributeName="cx" values="700;650;700" dur="25s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="1050" cy="545" rx="250" ry="28" fill="#5A5A8A" opacity="0.3" filter="url(#iratia-glow)"><animate attributeName="cx" values="1050;1100;1050" dur="20s" repeatCount="indefinite" /></ellipse>
      <g>
        {Array.from({ length: 18 }, (_, i) => {
          const x = 130 + ((i * 71) % 950)
          const y = 370 + ((i * 41) % 200)
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3.5" fill="#A8FFA8" filter="url(#iratia-glow)" opacity="0.9">
                <animate attributeName="opacity" values="0.2;1;0.2" dur={`${1.5 + (i % 4) * 0.4}s`} repeatCount="indefinite" begin={`${(i * 0.3) % 2}s`} />
                <animate attributeName="cy" values={`${y};${y - 18};${y}`} dur={`${3 + (i % 3) * 0.5}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={x} cy={y} r="1.3" fill="#FFFDE7" opacity="0.95">
                <animate attributeName="opacity" values="0.2;1;0.2" dur={`${1.5 + (i % 4) * 0.4}s`} repeatCount="indefinite" begin={`${(i * 0.3) % 2}s`} />
                <animate attributeName="cy" values={`${y};${y - 18};${y}`} dur={`${3 + (i % 3) * 0.5}s`} repeatCount="indefinite" />
              </circle>
            </g>
          )
        })}
      </g>
      <g opacity="0.75" fill="#0A0E1A">
        <g>
          <path d="M -16 36 L -14 0 L 14 0 L 16 36 Z" />
          <circle cx="0" cy="-8" r="9" fill="#1A1A2E" />
          <path d="M -12 -10 L 0 -36 L 12 -10 Z" />
          <ellipse cx="0" cy="-9" rx="17" ry="3" />
          <circle cx="-3" cy="-9" r="1" fill="#FFD53D"><animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite" /></circle>
          <circle cx="3" cy="-9" r="1" fill="#FFD53D"><animate attributeName="opacity" values="1;0.3;1" dur="3s" repeatCount="indefinite" /></circle>
          <rect x="-30" y="14" width="42" height="3" fill="#3D2A20" />
          <path d="M -30 12 L -45 14 L -45 18 L -30 19 Z" fill="#5B8B3A" />
        </g>
        <animateMotion dur="30s" repeatCount="indefinite" path="M -50 320 Q 300 300 600 350 Q 900 400 1250 330" />
      </g>
      <g transform="translate(280, 380)">
        <ellipse cx="0" cy="0" rx="9" ry="13" fill="#3D2A20" />
        <ellipse cx="0" cy="-2" rx="7" ry="6" fill="#3D2A20" />
        <circle cx="-3" cy="-3" r="2.2" fill="#FFFDE7" />
        <circle cx="3" cy="-3" r="2.2" fill="#FFFDE7" />
        <circle cx="-3" cy="-3" r="1.2" fill="#FFD53D"><animate attributeName="opacity" values="1;0.1;1;1;1" dur="5s" repeatCount="indefinite" /></circle>
        <circle cx="3" cy="-3" r="1.2" fill="#FFD53D"><animate attributeName="opacity" values="1;0.1;1;1;1" dur="5s" repeatCount="indefinite" /></circle>
        <path d="M -1 -1 L 0 1 L 1 -1 Z" fill="#C24617" />
      </g>
    </g>
  )
}

// AKELARRE
function AkelarreMap() {
  return (
    <g>
      <defs>
        <linearGradient id="akelarre-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0A0418" /><stop offset="50%" stopColor="#1A0E2A" /><stop offset="100%" stopColor="#3A1F3F" /></linearGradient>
        <radialGradient id="akelarre-moon-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stopColor="#FFE5A8" stopOpacity="0.5" /><stop offset="60%" stopColor="#FFE5A8" stopOpacity="0.15" /><stop offset="100%" stopColor="#FFE5A8" stopOpacity="0" /></radialGradient>
        <radialGradient id="akelarre-fire" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stopColor="#FFFDE7" /><stop offset="30%" stopColor="#FFD53D" /><stop offset="70%" stopColor="#C24617" stopOpacity="0.5" /><stop offset="100%" stopColor="#0A0418" stopOpacity="0" /></radialGradient>
        <filter id="akelarre-blur"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>
      <rect width="1200" height="600" fill="url(#akelarre-sky)" />
      <ellipse cx="900" cy="170" rx="200" ry="180" fill="url(#akelarre-moon-glow)"><animate attributeName="rx" values="200;230;200" dur="6s" repeatCount="indefinite" /><animate attributeName="ry" values="180;210;180" dur="6s" repeatCount="indefinite" /></ellipse>
      <circle cx="900" cy="170" r="85" fill="#FFFDE7" opacity="0.95" />
      <circle cx="878" cy="155" r="9" fill="#E8DCB8" opacity="0.7" />
      <circle cx="920" cy="180" r="7" fill="#E8DCB8" opacity="0.7" />
      <circle cx="888" cy="195" r="5" fill="#E8DCB8" opacity="0.6" />
      <g fill="#FFFDE7">
        {Array.from({ length: 40 }, (_, i) => {
          const x = (i * 131) % 1200
          const y = (i * 67) % 280
          return (
            <circle key={i} cx={x} cy={y} r={0.7 + ((i * 13) % 10) / 14}>
              <animate attributeName="opacity" values="0.4;1;0.4" dur={`${2 + (i % 5) * 0.5}s`} repeatCount="indefinite" begin={`${(i * 0.3) % 3}s`} />
            </circle>
          )
        })}
      </g>
      <g fill="#0A0418" filter="url(#akelarre-blur)">
        <path d="M 0 600 L 0 350 L 50 320 L 100 360 L 150 330 L 220 370 L 280 340 L 350 380 L 420 350 L 480 390 L 550 360 L 620 400 L 700 370 L 780 410 L 850 380 L 920 420 L 1000 390 L 1080 430 L 1150 400 L 1200 440 L 1200 600 Z" />
      </g>
      <ellipse cx="600" cy="600" rx="700" ry="200" fill="#1F0A2A" />
      <ellipse cx="600" cy="570" rx="500" ry="80" fill="#2A1438" />
      <g fill="#0F0512">
        <ellipse cx="320" cy="510" rx="22" ry="6" />
        <rect x="305" y="450" width="30" height="60" />
        <ellipse cx="475" cy="500" rx="22" ry="6" />
        <rect x="460" y="440" width="30" height="60" />
        <ellipse cx="730" cy="500" rx="22" ry="6" />
        <rect x="715" y="440" width="30" height="60" />
        <ellipse cx="880" cy="510" rx="22" ry="6" />
        <rect x="865" y="450" width="30" height="60" />
        <rect x="455" y="430" width="285" height="10" />
      </g>
      <g transform="translate(600, 520)">
        <ellipse cx="0" cy="22" rx="60" ry="10" fill="#0F0512" />
        <ellipse cx="-44" cy="18" rx="12" ry="6" fill="#2A1438" />
        <ellipse cx="-20" cy="22" rx="10" ry="5" fill="#2A1438" />
        <ellipse cx="20" cy="22" rx="10" ry="5" fill="#2A1438" />
        <ellipse cx="44" cy="18" rx="12" ry="6" fill="#2A1438" />
        <ellipse cx="0" cy="-10" rx="170" ry="120" fill="url(#akelarre-fire)" opacity="0.85"><animate attributeName="rx" values="170;195;170" dur="2.6s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.85;1;0.85" dur="2.6s" repeatCount="indefinite" /></ellipse>
        <path d="M -22 14 Q -14 -22 0 -50 Q 14 -22 22 14 Q 14 6 0 10 Q -14 6 -22 14 Z" fill="#FFD53D"><animate attributeName="d" values="M -22 14 Q -14 -22 0 -50 Q 14 -22 22 14 Q 14 6 0 10 Q -14 6 -22 14 Z;M -18 14 Q -10 -16 0 -44 Q 10 -16 18 14 Q 10 6 0 10 Q -10 6 -18 14 Z;M -22 14 Q -14 -22 0 -50 Q 14 -22 22 14 Q 14 6 0 10 Q -14 6 -22 14 Z" dur="0.5s" repeatCount="indefinite" /></path>
        <path d="M -12 10 Q -6 -8 0 -22 Q 6 -8 12 10 Z" fill="#FFFDE7"><animate attributeName="d" values="M -12 10 Q -6 -8 0 -22 Q 6 -8 12 10 Z;M -10 10 Q -5 -6 0 -18 Q 5 -6 10 10 Z;M -12 10 Q -6 -8 0 -22 Q 6 -8 12 10 Z" dur="0.4s" repeatCount="indefinite" /></path>
        {Array.from({ length: 10 }, (_, i) => {
          const x = ((i * 17) % 30) - 15
          const dur = 2 + (i % 3) * 0.5
          return (
            <circle key={i} cx={x} cy="-25" r={0.8 + (i % 3) * 0.3} fill="#FFD53D">
              <animate attributeName="cy" values={`-25;-${65 + i * 4};-${65 + i * 4}`} dur={`${dur}s`} repeatCount="indefinite" begin={`${i * 0.2}s`} />
              <animate attributeName="opacity" values="1;1;0" dur={`${dur}s`} repeatCount="indefinite" begin={`${i * 0.2}s`} />
              <animate attributeName="cx" values={`${x};${x + ((i % 2) * 16 - 8)};${x + ((i % 2) * 16 - 8)}`} dur={`${dur}s`} repeatCount="indefinite" begin={`${i * 0.2}s`} />
            </circle>
          )
        })}
      </g>
      <g fill="#0A0418">
        <g transform="translate(390, 480)">
          <g>
            <path d="M -12 30 L -10 -5 L 10 -5 L 12 30 Z" />
            <circle cx="0" cy="-12" r="8" />
            <path d="M -10 -14 L 0 -34 L 10 -14 Z" />
            <ellipse cx="0" cy="-13" rx="14" ry="2.5" />
            <circle cx="-2" cy="-13" r="0.7" fill="#FFD53D" />
            <circle cx="2" cy="-13" r="0.7" fill="#FFD53D" />
            <animateTransform attributeName="transform" type="rotate" values="-6 0 28;6 0 28;-6 0 28" dur="3s" repeatCount="indefinite" />
          </g>
        </g>
        <g transform="translate(810, 480)">
          <g>
            <path d="M -12 30 L -10 -5 L 10 -5 L 12 30 Z" />
            <circle cx="0" cy="-12" r="8" />
            <path d="M -10 -14 L 0 -34 L 10 -14 Z" />
            <ellipse cx="0" cy="-13" rx="14" ry="2.5" />
            <circle cx="-2" cy="-13" r="0.7" fill="#FFD53D" />
            <circle cx="2" cy="-13" r="0.7" fill="#FFD53D" />
            <animateTransform attributeName="transform" type="rotate" values="6 0 28;-6 0 28;6 0 28" dur="3s" repeatCount="indefinite" />
          </g>
        </g>
      </g>
      <g fill="#0A0418" transform="translate(560, 560)">
        <ellipse cx="0" cy="0" rx="14" ry="6" />
        <circle cx="-13" cy="-3" r="6" />
        <path d="M -17 -8 L -15 -12 L -13 -7 Z" />
        <path d="M -11 -8 L -10 -13 L -8 -7 Z" />
        <circle cx="-15" cy="-3" r="0.8" fill="#FFD53D"><animate attributeName="opacity" values="1;0.4;1" dur="3.5s" repeatCount="indefinite" /></circle>
        <circle cx="-12" cy="-3" r="0.8" fill="#FFD53D"><animate attributeName="opacity" values="1;0.4;1" dur="3.5s" repeatCount="indefinite" /></circle>
        <path d="M 14 0 Q 22 -5 24 -12" fill="none" stroke="#0A0418" strokeWidth="2"><animate attributeName="d" values="M 14 0 Q 22 -5 24 -12;M 14 0 Q 24 -3 26 -10;M 14 0 Q 22 -5 24 -12" dur="2s" repeatCount="indefinite" /></path>
      </g>
      <g fill="#3D5C2A" transform="translate(660, 565)">
        <ellipse cx="0" cy="0" rx="10" ry="6"><animate attributeName="ry" values="6;5;6" dur="1.6s" repeatCount="indefinite" /></ellipse>
        <circle cx="-4" cy="-3" r="2" fill="#5B8B3A" />
        <circle cx="4" cy="-3" r="2" fill="#5B8B3A" />
        <circle cx="-4" cy="-3" r="1" fill="#FFD53D" />
        <circle cx="4" cy="-3" r="1" fill="#FFD53D" />
      </g>
      <g stroke="#3D2A20" strokeWidth="2.5" fill="none">
        <line x1="220" y1="555" x2="280" y2="540" />
        <line x1="950" y1="555" x2="1010" y2="540" />
      </g>
      <path d="M 275 538 L 290 540 L 285 548 L 273 545 Z" fill="#5B8B3A" />
      <path d="M 1005 538 L 1020 540 L 1015 548 L 1003 545 Z" fill="#5B8B3A" />
    </g>
  )
}

// BURDINOLA
function BurdinolaMap() {
  return (
    <g>
      <defs>
        <linearGradient id="burdinola-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3A1F18" /><stop offset="50%" stopColor="#2A1410" /><stop offset="100%" stopColor="#0F0608" /></linearGradient>
        <radialGradient id="burdinola-glow" cx="0.5" cy="0.7" r="0.6"><stop offset="0%" stopColor="#FFD53D" stopOpacity="0.7" /><stop offset="40%" stopColor="#FF7E22" stopOpacity="0.35" /><stop offset="100%" stopColor="#0F0608" stopOpacity="0" /></radialGradient>
        <radialGradient id="burdinola-forge" cx="0.5" cy="0.5" r="0.5"><stop offset="0%" stopColor="#FFFDE7" /><stop offset="20%" stopColor="#FFD53D" /><stop offset="60%" stopColor="#FF4422" /><stop offset="100%" stopColor="#1F0A0A" stopOpacity="0.4" /></radialGradient>
      </defs>
      <rect width="1200" height="600" fill="url(#burdinola-bg)" />
      <ellipse cx="600" cy="420" rx="600" ry="280" fill="url(#burdinola-glow)"><animate attributeName="opacity" values="0.85;1;0.85" dur="1.4s" repeatCount="indefinite" /><animate attributeName="rx" values="600;640;600" dur="1.4s" repeatCount="indefinite" /></ellipse>
      <g fill="#1A0F0A">
        <rect x="0" y="0" width="1200" height="80" />
        <rect x="0" y="0" width="180" height="600" />
        <rect x="1020" y="0" width="180" height="600" />
      </g>
      <g fill="#3D2818" opacity="0.85">
        {Array.from({ length: 8 }, (_, i) => {
          const x = 20 + (i % 4) * 35
          const y = 40 + Math.floor(i / 4) * 28
          return <rect key={`l-${i}`} x={x} y={y} width="28" height="20" rx="3" />
        })}
        {Array.from({ length: 8 }, (_, i) => {
          const x = 1040 + (i % 4) * 35
          const y = 40 + Math.floor(i / 4) * 28
          return <rect key={`r-${i}`} x={x} y={y} width="28" height="20" rx="3" />
        })}
        {Array.from({ length: 25 }, (_, i) => {
          const x = (i * 50) % 1200
          return <rect key={`t-${i}`} x={x} y="20" width="40" height="18" rx="3" />
        })}
      </g>
      <g fill="#2A1F1A" opacity="0.7">
        <ellipse cx="600" cy="100" rx="220" ry="35"><animate attributeName="cy" values="100;80;100" dur="6s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.7;0.5;0.7" dur="6s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="450" cy="60" rx="140" ry="22"><animate attributeName="cy" values="60;40;60" dur="7s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="750" cy="60" rx="160" ry="24"><animate attributeName="cy" values="60;45;60" dur="8s" repeatCount="indefinite" /></ellipse>
      </g>
      <g transform="translate(600, 470)">
        <path d="M -65 0 L 65 0 L 60 -8 L 55 -12 L 50 -10 L -50 -10 L -55 -12 L -60 -8 Z" fill="#1A1A2E" />
        <path d="M -45 0 L 45 0 L 40 30 L -40 30 Z" fill="#0F0F1F" />
        <ellipse cx="0" cy="32" rx="50" ry="6" fill="#0A0608" />
      </g>
      <g transform="translate(595, 462)">
        <rect x="0" y="0" width="80" height="6" fill="url(#burdinola-forge)" />
        <rect x="0" y="0" width="60" height="6" fill="#FFFDE7" opacity="0.7"><animate attributeName="opacity" values="0.7;1;0.7" dur="1.4s" repeatCount="indefinite" /></rect>
      </g>
      <g>
        <g>
          <rect x="-3" y="0" width="6" height="100" fill="#3D2A20" transform="translate(600, 380)" />
          <rect x="-22" y="-18" width="44" height="22" rx="3" fill="#1A1A2E" transform="translate(600, 380)" />
          <rect x="-20" y="-14" width="40" height="6" fill="#3A3A4A" opacity="0.7" transform="translate(600, 380)" />
          <animateTransform attributeName="transform" type="rotate" values="-40 600 380;-40 600 380;-15 600 380;0 600 380;-40 600 380" keyTimes="0;0.3;0.5;0.55;1" dur="1.4s" repeatCount="indefinite" />
        </g>
      </g>
      <g fill="#FFD53D">
        {Array.from({ length: 18 }, (_, i) => {
          const x = 600 + ((i * 47) % 80) - 40
          const dx = ((i * 23) % 100) - 50
          const dur = 1.5 + (i % 4) * 0.3
          return (
            <circle key={i} cx={x} cy={460} r={0.8 + (i % 3) * 0.3}>
              <animate attributeName="cy" values={`460;320;320`} dur={`${dur}s`} repeatCount="indefinite" begin={`${(i * 0.1) % 1.5}s`} />
              <animate attributeName="cx" values={`${x};${x + dx};${x + dx}`} dur={`${dur}s`} repeatCount="indefinite" begin={`${(i * 0.1) % 1.5}s`} />
              <animate attributeName="opacity" values="1;1;0" dur={`${dur}s`} repeatCount="indefinite" begin={`${(i * 0.1) % 1.5}s`} />
            </circle>
          )
        })}
      </g>
      <path d="M 180 600 L 180 530 Q 600 510 1020 530 L 1020 600 Z" fill="#0A0408" />
      <g fill="#0A0408" opacity="0.9">
        <ellipse cx="320" cy="440" rx="32" ry="65" />
        <circle cx="320" cy="380" r="22" />
        <path d="M 298 376 Q 290 430 296 478 L 344 478 Q 350 430 342 376 Z" />
        <circle cx="316" cy="378" r="2" fill="#FFD53D"><animate attributeName="opacity" values="0.7;1;0.4;1;0.7" dur="3s" repeatCount="indefinite" /></circle>
        <circle cx="324" cy="378" r="2" fill="#FFD53D"><animate attributeName="opacity" values="0.7;1;0.4;1;0.7" dur="3s" repeatCount="indefinite" /></circle>
        <ellipse cx="350" cy="430" rx="10" ry="22" transform="rotate(20 350 430)" />
      </g>
      <g fill="#0A0408" opacity="0.9">
        <ellipse cx="880" cy="440" rx="32" ry="65" />
        <circle cx="880" cy="380" r="22" />
        <path d="M 858 376 Q 850 430 856 478 L 904 478 Q 910 430 902 376 Z" />
        <circle cx="876" cy="378" r="2" fill="#FFD53D"><animate attributeName="opacity" values="1;0.4;1;0.7;1" dur="2.6s" repeatCount="indefinite" /></circle>
        <circle cx="884" cy="378" r="2" fill="#FFD53D"><animate attributeName="opacity" values="1;0.4;1;0.7;1" dur="2.6s" repeatCount="indefinite" /></circle>
        <ellipse cx="850" cy="430" rx="10" ry="22" transform="rotate(-20 850 430)" />
      </g>
    </g>
  )
}

// ITSASERTZA — Barco AHORA en el agua (translate y=310 desde 380)
function ItsasertzaMap() {
  return (
    <g>
      <defs>
        <linearGradient id="itsasertza-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4F8FB8" /><stop offset="60%" stopColor="#A8DFE6" /><stop offset="100%" stopColor="#E8F0F5" /></linearGradient>
        <linearGradient id="itsasertza-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3A7F95" /><stop offset="100%" stopColor="#1F4A5C" /></linearGradient>
      </defs>
      <rect width="1200" height="300" fill="url(#itsasertza-sky)" />
      <rect y="300" width="1200" height="300" fill="url(#itsasertza-sea)" />
      <circle cx="900" cy="140" r="55" fill="#FFFDE7" opacity="0.7"><animate attributeName="r" values="55;62;55" dur="5s" repeatCount="indefinite" /></circle>
      <circle cx="900" cy="140" r="40" fill="#FFE5A8" opacity="0.85" />
      <g fill="#FFFDE7">
        <ellipse cx="200" cy="60" rx="160" ry="20" opacity="0.95"><animate attributeName="cx" values="200;260;200" dur="50s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="240" cy="50" rx="100" ry="14" opacity="0.85" />
        <ellipse cx="560" cy="100" rx="200" ry="22" opacity="0.85"><animate attributeName="cx" values="560;620;560" dur="60s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="880" cy="170" rx="180" ry="20" opacity="0.7"><animate attributeName="cx" values="880;820;880" dur="55s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="1100" cy="80" rx="120" ry="16" opacity="0.85" />
      </g>
      <path d="M 0 600 L 0 240 Q 60 200 120 220 Q 180 240 240 230 Q 300 220 360 250 Q 380 270 380 300 L 380 600 Z" fill="#5A4A3A" />
      <path d="M 0 240 Q 60 200 120 220 Q 180 240 240 230 Q 300 220 360 250 Q 380 270 380 300 L 380 320 Q 300 300 240 310 Q 180 320 120 305 Q 60 290 0 320 Z" fill="#7B6B5A" />
      <path d="M 1200 600 L 1200 320 Q 1140 290 1080 310 Q 1020 330 960 320 L 960 600 Z" fill="#5A4A3A" />
      <path d="M 960 320 Q 1020 330 1080 310 Q 1140 290 1200 320 L 1200 360 Q 1140 340 1080 350 Q 1020 360 960 350 Z" fill="#7B6B5A" />
      <g transform="translate(180, 130)">
        <rect x="-12" y="0" width="24" height="80" fill="#FFFDE7" />
        <rect x="-12" y="0" width="24" height="14" fill="#C24617" />
        <rect x="-12" y="28" width="24" height="14" fill="#C24617" />
        <rect x="-12" y="56" width="24" height="14" fill="#C24617" />
        <path d="M -16 80 L 16 80 L 18 92 L -18 92 Z" fill="#5A4A3A" />
        <rect x="-14" y="-14" width="28" height="14" fill="#3D2A20" />
        <rect x="-10" y="-12" width="20" height="10" fill="#FFD53D" opacity="0.9"><animate attributeName="opacity" values="0.9;0.5;1;0.9" dur="3s" repeatCount="indefinite" /></rect>
        <path d="M -16 -14 L 0 -28 L 16 -14 Z" fill="#3D2A20" />
        <g>
          <path d="M 0 -8 L 800 -120 L 800 -60 Z" fill="#FFFDE7" opacity="0.18" />
          <animateTransform attributeName="transform" type="rotate" values="0 0 -8;360 0 -8" dur="8s" repeatCount="indefinite" />
        </g>
      </g>
      <g fill="#5B8B3A">
        <ellipse cx="120" cy="218" rx="80" ry="6" />
        <ellipse cx="280" cy="225" rx="60" ry="5" />
        <ellipse cx="1080" cy="308" rx="80" ry="5" />
      </g>
      <g fill="#FFFDE7">
        <g><path d="M 0 0 q 12 -10 24 0 q -12 -4 -24 0 z" /><animateMotion dur="20s" repeatCount="indefinite" path="M -30 180 Q 300 130 600 200 Q 900 250 1230 170" /></g>
        <g><path d="M 0 0 q 9 -8 18 0 q -9 -3 -18 0 z" /><animateMotion dur="25s" repeatCount="indefinite" begin="3s" path="M 1230 220 Q 800 270 400 230 Q 100 200 -30 250" /></g>
        <g><path d="M 0 0 q 11 -9 22 0 q -11 -4 -22 0 z" /><animateMotion dur="18s" repeatCount="indefinite" begin="2s" path="M -30 100 Q 350 80 700 130 Q 1000 170 1230 110" /></g>
        <path d="M 540 280 q 8 -6 16 0 q -8 -2 -16 0 z" opacity="0.7" />
        <path d="M 820 250 q 10 -8 20 0 q -10 -3 -20 0 z" opacity="0.7" />
      </g>
      <ellipse cx="380" cy="350" rx="50" ry="30" fill="#FFFDE7" opacity="0.8"><animate attributeName="rx" values="50;70;50" dur="2.5s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.8;1;0.8" dur="2.5s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="380" cy="340" rx="40" ry="20" fill="#FFFDE7" opacity="0.9"><animate attributeName="rx" values="40;58;40" dur="2.5s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="960" cy="370" rx="40" ry="22" fill="#FFFDE7" opacity="0.75"><animate attributeName="rx" values="40;58;40" dur="2.8s" repeatCount="indefinite" /></ellipse>
      <g fill="none" stroke="#FFFDE7" strokeWidth="1.5" opacity="0.6">
        <path d="M 450 400 Q 480 395 510 400 T 570 400" />
        <path d="M 600 440 Q 630 435 660 440 T 720 440" />
        <path d="M 480 480 Q 510 475 540 480 T 600 480" />
        <path d="M 700 510 Q 730 505 760 510 T 820 510" />
        <path d="M 850 470 Q 880 465 910 470 T 970 470" />
        <path d="M 550 540 Q 580 535 610 540 T 670 540" />
      </g>
      {/* BARCO en el agua: translate y=310 (antes 380 con velas sumergidas) */}
      <g>
        <g transform="translate(700, 310)">
          <path d="M -22 0 L 22 0 L 18 10 L -18 10 Z" fill="#3D2A20" />
          <line x1="0" y1="0" x2="0" y2="-22" stroke="#5A4A3A" strokeWidth="1.5" />
          <path d="M 0 -22 L 12 -8 L 0 -8 Z" fill="#FFFDE7" />
          <animateTransform attributeName="transform" type="rotate" values="-2 0 5;2 0 5;-2 0 5" dur="3.5s" repeatCount="indefinite" additive="sum" />
        </g>
        <animateMotion dur="80s" repeatCount="indefinite" path="M 0 0 Q 100 -5 200 0 Q 300 5 400 0" />
      </g>
      <g transform="translate(560, 480)">
        <ellipse cx="0" cy="0" rx="35" ry="10" fill="#3D2A20" />
        <path d="M -25 -5 Q -20 -20 -10 -22 Q 0 -25 10 -22 Q 22 -18 25 -5 Z" fill="#5A4A3A" />
      </g>
    </g>
  )
}

// LARRE
function LarreMap() {
  return (
    <g>
      <defs>
        <linearGradient id="larre-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5BA8D8" /><stop offset="80%" stopColor="#A8DFE6" /><stop offset="100%" stopColor="#FFFDE7" /></linearGradient>
        <linearGradient id="larre-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5B8B3A" /><stop offset="100%" stopColor="#3D5C2A" /></linearGradient>
      </defs>
      <rect width="1200" height="360" fill="url(#larre-sky)" />
      <rect y="360" width="1200" height="240" fill="url(#larre-grass)" />
      <g>
        <circle cx="950" cy="120" r="50" fill="#FFFDE7" opacity="0.95"><animate attributeName="r" values="50;56;50" dur="4s" repeatCount="indefinite" /></circle>
        <g stroke="#FFFDE7" strokeWidth="2.5" opacity="0.7">
          <line x1="950" y1="50" x2="950" y2="35" />
          <line x1="950" y1="190" x2="950" y2="205" />
          <line x1="880" y1="120" x2="865" y2="120" />
          <line x1="1020" y1="120" x2="1035" y2="120" />
          <line x1="903" y1="73" x2="893" y2="63" />
          <line x1="997" y1="167" x2="1007" y2="177" />
          <line x1="997" y1="73" x2="1007" y2="63" />
          <line x1="903" y1="167" x2="893" y2="177" />
          <animateTransform attributeName="transform" type="rotate" values="0 950 120;360 950 120" dur="60s" repeatCount="indefinite" />
        </g>
      </g>
      <g fill="#FFFDE7">
        <ellipse cx="180" cy="100" rx="80" ry="22"><animate attributeName="cx" values="180;240;180" dur="40s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="220" cy="90" rx="60" ry="18" />
        <ellipse cx="500" cy="130" rx="100" ry="25"><animate attributeName="cx" values="500;560;500" dur="50s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="750" cy="80" rx="90" ry="22" />
      </g>
      <path d="M 0 360 L 0 280 L 80 220 L 150 270 L 220 230 L 300 280 L 380 240 L 460 290 L 540 240 L 620 280 L 700 230 L 780 270 L 860 230 L 940 280 L 1020 240 L 1100 290 L 1200 250 L 1200 360 Z" fill="#7B8B9B" opacity="0.6" />
      <path d="M 0 360 L 100 310 L 200 340 L 320 290 L 450 330 L 580 285 L 720 325 L 850 280 L 980 325 L 1100 295 L 1200 330 L 1200 360 Z" fill="#9BAFC0" opacity="0.7" />
      <g transform="translate(360, 300)">
        <rect x="-30" y="-25" width="60" height="40" fill="#E8E0D0" />
        <path d="M -34 -25 L 0 -50 L 34 -25 Z" fill="#C24617" />
        <line x1="-25" y1="-20" x2="-25" y2="15" stroke="#3D2A20" strokeWidth="2" />
        <line x1="25" y1="-20" x2="25" y2="15" stroke="#3D2A20" strokeWidth="2" />
        <line x1="-30" y1="-10" x2="30" y2="-10" stroke="#3D2A20" strokeWidth="1.5" />
        <rect x="-18" y="-15" width="10" height="10" fill="#FFD53D" opacity="0.85"><animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" /></rect>
        <rect x="8" y="-15" width="10" height="10" fill="#FFD53D" opacity="0.85"><animate attributeName="opacity" values="0.85;1;0.85" dur="3.4s" repeatCount="indefinite" /></rect>
        <rect x="-5" y="0" width="10" height="15" fill="#3D2A20" />
      </g>
      <g>
        <rect x="98" y="380" width="10" height="40" fill="#3D2A20" />
        <ellipse cx="103" cy="370" rx="32" ry="38" fill="#3D5C2A"><animate attributeName="cx" values="103;106;103" dur="4s" repeatCount="indefinite" /></ellipse>
        <ellipse cx="103" cy="362" rx="26" ry="30" fill="#5B8B3A"><animate attributeName="cx" values="103;106;103" dur="4s" repeatCount="indefinite" /></ellipse>
      </g>
      <g>
        <rect x="1098" y="390" width="10" height="40" fill="#3D2A20" />
        <ellipse cx="1103" cy="378" rx="30" ry="35" fill="#3D5C2A" />
        <ellipse cx="1103" cy="372" rx="24" ry="28" fill="#5B8B3A" />
      </g>
      <g transform="translate(450, 480)">
        <ellipse cx="0" cy="0" rx="40" ry="20" fill="#3D2A20" />
        <ellipse cx="0" cy="-2" rx="36" ry="16" fill="#5A4A3A" />
        <path d="M -30 -10 L -45 -25 L -38 -25 L -22 -8 Z" fill="#3D2A20" />
        <ellipse cx="-45" cy="-26" rx="10" ry="6" fill="#3D2A20" />
        <rect x="-26" y="14" width="6" height="22" fill="#3D2A20" />
        <rect x="-16" y="16" width="6" height="20" fill="#3D2A20" />
        <rect x="10" y="14" width="6" height="22" fill="#3D2A20" />
        <rect x="20" y="16" width="6" height="20" fill="#3D2A20" />
        <path d="M 38 -5 Q 50 5 48 22" stroke="#1A0E08" strokeWidth="6" fill="none"><animate attributeName="d" values="M 38 -5 Q 50 5 48 22;M 38 -5 Q 54 3 52 20;M 38 -5 Q 50 5 48 22" dur="2.5s" repeatCount="indefinite" /></path>
        <circle cx="-48" cy="-27" r="1" fill="#FFD53D" />
      </g>
      <g transform="translate(800, 510)">
        <ellipse cx="0" cy="0" rx="30" ry="15" fill="#5A4A3A" />
        <ellipse cx="0" cy="-2" rx="26" ry="12" fill="#7B6B5A" />
        <path d="M -22 -8 L -34 -20 L -28 -20 L -16 -6 Z" fill="#5A4A3A" />
        <ellipse cx="-34" cy="-21" rx="8" ry="5" fill="#5A4A3A" />
        <rect x="-20" y="10" width="5" height="18" fill="#5A4A3A" />
        <rect x="-12" y="12" width="5" height="16" fill="#5A4A3A" />
        <rect x="8" y="10" width="5" height="18" fill="#5A4A3A" />
        <rect x="16" y="12" width="5" height="16" fill="#5A4A3A" />
        <path d="M 28 -3 Q 38 3 36 17" stroke="#3D2A20" strokeWidth="5" fill="none"><animate attributeName="d" values="M 28 -3 Q 38 3 36 17;M 28 -3 Q 40 1 38 15;M 28 -3 Q 38 3 36 17" dur="2.2s" repeatCount="indefinite" /></path>
      </g>
      <g>
        <g fill="#FFD53D" opacity="0.9">
          <g><ellipse cx="-3" cy="0" rx="4" ry="6" /><ellipse cx="3" cy="0" rx="4" ry="6" /><ellipse cx="-3" cy="6" rx="3" ry="4" /><ellipse cx="3" cy="6" rx="3" ry="4" /><rect x="-0.5" y="-2" width="1" height="10" fill="#1A1A2E" /></g>
          <animateMotion dur="14s" repeatCount="indefinite" path="M 280 320 Q 380 280 480 340 Q 580 400 480 460 Q 380 440 280 400 Q 200 350 280 320" />
        </g>
        <g fill="#FF7E55" opacity="0.85">
          <g><ellipse cx="-3" cy="0" rx="4" ry="6" /><ellipse cx="3" cy="0" rx="4" ry="6" /><rect x="-0.5" y="-2" width="1" height="8" fill="#1A1A2E" /></g>
          <animateMotion dur="18s" repeatCount="indefinite" begin="2s" path="M 600 380 Q 700 340 800 400 Q 900 460 800 500 Q 700 480 650 440 Q 600 410 600 380" />
        </g>
        <g fill="#C24617" opacity="0.85">
          <g><ellipse cx="-3" cy="0" rx="3.5" ry="5" /><ellipse cx="3" cy="0" rx="3.5" ry="5" /><rect x="-0.5" y="-2" width="1" height="8" fill="#1A1A2E" /></g>
          <animateMotion dur="16s" repeatCount="indefinite" begin="4s" path="M 950 400 Q 1050 360 1100 420 Q 1150 480 1050 500 Q 950 480 920 440 Z" />
        </g>
      </g>
      <g>
        {[200, 380, 560, 720, 880, 1040].map((x, i) => (
          <g key={i} transform={`translate(${x}, ${520 + (i % 2) * 20})`}>
            <circle cx="0" cy="0" r="2.5" fill="#FFD53D" />
            <circle cx="-3" cy="0" r="2.2" fill="#FFFDE7" />
            <circle cx="3" cy="0" r="2.2" fill="#FFFDE7" />
            <circle cx="0" cy="-3" r="2.2" fill="#FFFDE7" />
            <circle cx="0" cy="3" r="2.2" fill="#FFFDE7" />
            <line x1="0" y1="3" x2="0" y2="15" stroke="#3D5C2A" strokeWidth="1" />
          </g>
        ))}
      </g>
    </g>
  )
}

// MENDITONTORRA
function MenditontorraMap() {
  return (
    <g>
      <defs>
        <linearGradient id="mendi-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1F4A95" /><stop offset="60%" stopColor="#4F8FB8" /><stop offset="100%" stopColor="#A8DFE6" /></linearGradient>
        <linearGradient id="mendi-snow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FFFDE7" /><stop offset="100%" stopColor="#A8DFE6" /></linearGradient>
      </defs>
      <rect width="1200" height="600" fill="url(#mendi-sky)" />
      <circle cx="1000" cy="110" r="40" fill="#FFFDE7"><animate attributeName="r" values="40;46;40" dur="5s" repeatCount="indefinite" /></circle>
      <circle cx="1000" cy="110" r="60" fill="#FFFDE7" opacity="0.3"><animate attributeName="r" values="60;72;60" dur="5s" repeatCount="indefinite" /></circle>
      <ellipse cx="200" cy="80" rx="150" ry="8" fill="#FFFDE7" opacity="0.85"><animate attributeName="cx" values="200;270;200" dur="60s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="600" cy="50" rx="180" ry="9" fill="#FFFDE7" opacity="0.75"><animate attributeName="cx" values="600;540;600" dur="55s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="900" cy="100" rx="120" ry="8" fill="#FFFDE7" opacity="0.6" />
      <path d="M 0 600 L 0 400 L 100 320 L 200 380 L 320 280 L 440 350 L 580 260 L 720 340 L 850 260 L 980 330 L 1100 280 L 1200 360 L 1200 600 Z" fill="#4F6F8F" opacity="0.7" />
      <path d="M 100 320 L 130 350 L 90 360 Z" fill="#FFFDE7" opacity="0.85" />
      <path d="M 320 280 L 350 320 L 290 330 Z" fill="#FFFDE7" opacity="0.85" />
      <path d="M 580 260 L 610 300 L 550 310 Z" fill="#FFFDE7" opacity="0.85" />
      <path d="M 850 260 L 880 295 L 820 305 Z" fill="#FFFDE7" opacity="0.85" />
      <path d="M 1100 280 L 1130 315 L 1070 325 Z" fill="#FFFDE7" opacity="0.85" />
      <path d="M 300 600 L 380 480 L 460 400 L 540 320 L 600 240 L 660 320 L 740 400 L 820 480 L 900 600 Z" fill="#5A6F8F" />
      <path d="M 600 240 L 660 320 L 740 400 L 820 480 L 900 600 L 600 600 Z" fill="#3D5577" opacity="0.65" />
      <path d="M 540 320 L 600 240 L 660 320 L 640 340 L 600 320 L 560 340 Z" fill="url(#mendi-snow)" />
      <g fill="#3D2A20">
        <g>
          <path d="M -30 0 Q -22 -8 -10 -5 L 0 0 L 10 -5 Q 22 -8 30 0 L 16 4 L 0 5 L -16 4 Z" />
          <circle cx="0" cy="0" r="3" />
          <path d="M 0 3 L 2 8 L -2 8 Z" />
        </g>
        <animateMotion dur="22s" repeatCount="indefinite" path="M -50 220 Q 300 180 600 230 Q 900 280 1250 200" />
      </g>
      <g fill="#3D2A20" opacity="0.7">
        <path d="M 0 0 q -10 -5 -7 -3 L 0 0 L 7 -3 q 13 -2 20 5 L 11 2 L 0 3 L -11 2 Z" transform="scale(0.7)" />
        <animateMotion dur="30s" repeatCount="indefinite" begin="5s" path="M 1250 350 Q 900 320 600 380 Q 300 440 -50 360" />
      </g>
      <ellipse cx="200" cy="500" rx="200" ry="20" fill="#FFFDE7" opacity="0.55"><animate attributeName="cx" values="200;250;200" dur="18s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="500" cy="550" rx="180" ry="18" fill="#FFFDE7" opacity="0.45"><animate attributeName="cx" values="500;560;500" dur="22s" repeatCount="indefinite" /></ellipse>
      <ellipse cx="900" cy="520" rx="200" ry="22" fill="#FFFDE7" opacity="0.55"><animate attributeName="cx" values="900;850;900" dur="20s" repeatCount="indefinite" /></ellipse>
      <g>
        <rect x="100" y="510" width="6" height="50" fill="#3D2A20" />
        <ellipse cx="103" cy="500" rx="20" ry="25" fill="#3D5C2A" />
        <ellipse cx="103" cy="492" rx="14" ry="18" fill="#FFFDE7" opacity="0.85" />
      </g>
      <g>
        <rect x="1090" y="520" width="6" height="50" fill="#3D2A20" />
        <ellipse cx="1093" cy="510" rx="18" ry="22" fill="#3D5C2A" />
        <ellipse cx="1093" cy="503" rx="13" ry="16" fill="#FFFDE7" opacity="0.85" />
      </g>
      <g fill="#FFFDE7">
        {Array.from({ length: 40 }, (_, i) => {
          const x = (i * 89) % 1200
          const r = 0.8 + ((i * 7) % 6) / 6
          return (
            <circle key={i} cx={x} cy={-10} r={r}>
              <animate attributeName="cy" values={`${-10};${620}`} dur={`${7 + (i % 6)}s`} repeatCount="indefinite" begin={`${(i * 0.3) % 7}s`} />
              <animate attributeName="cx" values={`${x};${x + 30};${x - 20};${x + 25}`} dur={`${7 + (i % 6)}s`} repeatCount="indefinite" begin={`${(i * 0.3) % 7}s`} />
            </circle>
          )
        })}
      </g>
    </g>
  )
}
