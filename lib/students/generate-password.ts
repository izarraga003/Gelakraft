/**
 * Generador de contraseñas memorables para alumnos.
 *
 * Formato: <palabra mitológica vasca>-<número 2-3 dígitos>
 * Ejemplos: "Mari-247", "Sugaar-83", "Lamia-156", "Mendi-92"
 *
 * Longitud aprox. 7-12 caracteres. Memorable porque solo hay una palabra
 * (familiar para el alumno por la temática del juego) y un número corto.
 */

const MITHO_WORDS = [
  // Deidades y criaturas
  'Mari',
  'Sugaar',
  'Sugoi',
  'Lamia',
  'Sorgina',
  'Jentila',
  'Basajaun',
  'Tartalo',
  'Galtxa',
  'Aker',
  'Eate',
  'Olentzero',
  'Mateo',
  // Naturaleza y mitología
  'Anbo',
  'Mendi',
  'Aizkorri',
  'Gorbea',
  'Akelarre',
  'Itsaso',
  'Erreka',
  'Iturri',
  'Haritz',
  'Pago',
  'Lizar',
  // Animales
  'Otso',
  'Hartz',
  'Lehoi',
  'Suge',
  'Belea',
  'Arrano',
  'Antxume',
  'Behi',
  'Zaldi',
  // Elementos
  'Eguzki',
  'Ilargi',
  'Izar',
  'Lurra',
  'Sua',
  'Ura',
  'Haize',
  // Objetos / lugares
  'Gaztelu',
  'Errota',
  'Zubi',
  'Atea',
  'Etxe',
  'Harria',
]

export function generatePassword(): string {
  const word = MITHO_WORDS[Math.floor(Math.random() * MITHO_WORDS.length)]
  // Número entre 10 y 999 (2-3 dígitos)
  const num = Math.floor(Math.random() * 990) + 10
  return `${word}-${num}`
}
