/**
 * Catálogo de eventos por defecto.
 * Se cargan cuando el profesor pulsa "Kargatu lehenetsitako gertaerak".
 *
 * Estilo: nombres cortos evocadores, descripciones de 2-4 frases con
 * la mecánica completa (qué hacer, quién participa, qué se gana/pierde).
 */

export type EventTemplate = {
  title: string
  description: string
}

export const DEFAULT_EVENTS: EventTemplate[] = [
  {
    title: 'Anbotoko lainoa',
    description:
      'Mariren lainoa ikasgela inguratzen du. Eskolak iraun arte ahots baxuan hitz egingo duzue. Lortuz gero, +50 XP guztiei. Ozen mintzo den ikasleak -1 bihotz.',
  },
  {
    title: 'Sugaarren begia',
    description:
      'Sugaar suaren erregeak begi bat zabaldu du. Aukeratutako ikasle batek galdera zail bati erantzun behar dio. Asmatuz gero, +150 XP. Huts egiten badu, -2 bihotz.',
  },
  {
    title: 'Lamiaren oparia',
    description:
      'Lamiek poltsa bat utzi dute errekan. Klase osoari +40 XP bakoitzari. Inork ez du ezer galtzen.',
  },
  {
    title: 'Tartaloren igarkizuna',
    description:
      'Tartalo erraldoiak igarkizun bat eskaintzen dizue. Talde bakoitzak elkarrekin asmatu behar du. Asmatzen duten taldekoek +80 XP bakoitza.',
  },
  {
    title: 'Jentilen erronka',
    description:
      'Jentil zaharrek euskal hitz baten esanahia galdetu dute. Aukeratutako ikasle batek bakarrik erantzun behar du. Asmatuz gero, +100 XP. Hutsean, hurrengo ikasleak du saiakera.',
  },
  {
    title: 'Olentzeroren oparia',
    description:
      'Olentzero ikasgelara hurbildu da. Bihotzak ahul dauzkan ikasleari +1 bihotz. Gainerakoei +20 XP bakoitzak.',
  },
  {
    title: 'Akelarrearen gaua',
    description:
      'Akelarrera deitu zaituztete. Ikasle bakoitzak euskal mitologiako pertsonaia bat aukeratu eta bere ahalmen bat aipatu behar du. Egiten dutenei +50 XP. Uko egiten duenari -1 bihotz.',
  },
  {
    title: 'Mariren ametsa',
    description:
      'Mariri ametsa egin zaio. Aukeratutako ikasle batek azken eskolaren laburpena egin behar du minutu batean. Lortzen badu, +100 XP. Uko egiten badu, -2 bihotz.',
  },
  {
    title: 'Iratxoen jolasa',
    description:
      'Iratxoek hitzak nahastu dituzte. Bi ikasle aukeratu eta esaldi bera esan behar dute aldi berean, euskaraz akatsik gabe. Lortzen badute, +60 XP biei.',
  },
  {
    title: 'Klasea euskaraz',
    description:
      'Eskolak iraun arte euskara hutsean mintzatuko zarete. Erderaz hitz egiten duen bakoitzak -1 bihotz. Amaieran isilik gorde duen ikasleak +40 XP.',
  },
  {
    title: 'Basajaunaren itzala',
    description:
      'Basajaunek hurrengo ariketa elkarlanean egiteko eskatzen dizuete. Lortzen baduzue, +30 XP guztiei eta +1 bihotz ahul dagoenari.',
  },
  {
    title: 'Anbotoko mamua',
    description:
      'Anbotoko gailurrean mamu bat ikusi da. Bost minutuz isilean lan egin behar duzue. Lortzen baduzue, +60 XP guztiei. Norbaitek ozen hitz egiten badu, -2 bihotz hari bakarrik.',
  },
  {
    title: 'Sugaarren su-erronka',
    description:
      'Sugaarrek erronka jaurti du. Hiru ikasleri kalkulu mental azkarra eskatuko zaie. Asmatzen duenak +100 XP.',
  },
  {
    title: 'Galtzagorri etxean',
    description:
      'Etxeko iratxoa ikasgelan sartu da. Eskolan zehar lehen huts egiten duen ikasleak -2 bihotz. Inork hutsik egiten ez badu, klase osoari +30 XP.',
  },
  {
    title: 'Aker beltzaren auzia',
    description:
      'Aker beltzak salaketa bat aurkeztu du. Aukeratutako ikasleak euskaraz minutu bat hitz egin behar du gai libre batean. Lortzen badu, +120 XP. Uko egiten badu, -3 bihotz.',
  },
]
