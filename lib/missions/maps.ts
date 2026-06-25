/**
 * Catálogo de fondos de mapa disponibles para una misión.
 * Cada fondo es un ID + nombre legible + descripción temática.
 * El renderizado del fondo lo hace el componente MissionMapBackground.
 */

export type MissionMapId =
  | 'anboto'
  | 'itsasoa'
  | 'basoa'
  | 'kobazuloa'
  | 'iratia'

export type MissionMap = {
  id: MissionMapId
  name: string
  description: string
  /** Tema de color principal para coordinar elementos UI */
  accent: string
}

export const MISSION_MAPS: MissionMap[] = [
  {
    id: 'anboto',
    name: 'Anboto',
    description: 'Mariren mendi mitiko ekaitzpean',
    accent: '#C24617',
  },
  {
    id: 'itsasoa',
    name: 'Itsasoa',
    description: 'Lamien uharteak eta itsasoa',
    accent: '#3A77BB',
  },
  {
    id: 'basoa',
    name: 'Basoa',
    description: 'Pagoadi sakon eta misteriotsua',
    accent: '#4F8B3A',
  },
  {
    id: 'kobazuloa',
    name: 'Kobazuloa',
    description: 'Iratxoen aterpe ezkutua',
    accent: '#7E4FA8',
  },
  {
    id: 'iratia',
    name: 'Iratiko basoa',
    description: 'Gauez argitutako baso magikoa',
    accent: '#5BAE6F',
  },
]

export function getMissionMap(id: string): MissionMap {
  return MISSION_MAPS.find((m) => m.id === id) ?? MISSION_MAPS[0]
}
