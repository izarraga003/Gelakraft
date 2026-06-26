// Catálogo de mapas para misiones.
// Cada mapa tiene un id, nombre y breve descripción narrativa.

export const MISSION_MAP_IDS = [
  'anboto',
  'itsasoa',
  'basoa',
  'kobazuloa',
  'iratia',
  'akelarre',
  'burdinola',
  'itsasertza',
  'larre',
  'menditontorra',
] as const

export type MissionMapId = (typeof MISSION_MAP_IDS)[number]

export type MissionMap = {
  id: MissionMapId
  name: string
  description: string
}

export const MISSION_MAPS: MissionMap[] = [
  {
    id: 'anboto',
    name: 'Anboto',
    description: 'Mariren bizilekua, ekaitzen menpe.',
  },
  {
    id: 'itsasoa',
    name: 'Itsasoa',
    description: 'Lamiak orraztu eta abesten dute.',
  },
  {
    id: 'basoa',
    name: 'Basoa',
    description: 'Pago zaharrak eta basajaunaren itzala.',
  },
  {
    id: 'kobazuloa',
    name: 'Kobazuloa',
    description: 'Jentilen sukaldea, harri tarteetan.',
  },
  {
    id: 'iratia',
    name: 'Iratiko basoa',
    description: 'Gauez, sorginen eta argi-mamuen aldea.',
  },
  {
    id: 'akelarre',
    name: 'Akelarrea',
    description: 'Sorginen bilkura, ilargi betearen pean.',
  },
  {
    id: 'burdinola',
    name: 'Burdinola',
    description: 'Jentilen olagizonen lantegia.',
  },
  {
    id: 'itsasertza',
    name: 'Itsasertza',
    description: 'Itsaslabarrak, faroa eta haize gaziz.',
  },
  {
    id: 'larre',
    name: 'Larre berdea',
    description: 'Pottoken larrea, mendien magalean.',
  },
  {
    id: 'menditontorra',
    name: 'Mendi tontorra',
    description: 'Elurraren erreinua, hodeien gainean.',
  },
]

export function getMissionMap(id: string): MissionMap {
  return MISSION_MAPS.find((m) => m.id === id) ?? MISSION_MAPS[0]
}
