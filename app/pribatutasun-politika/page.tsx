import Link from 'next/link'
import styles from './legal.module.css'

export const metadata = {
  title: 'Pribatutasun politika — Gelakraft',
  description:
    'Gelakrafteko erabiltzaileen datu pertsonalen tratamendua eta babesa azaltzen duen politika.',
}

export default function PribatutasunPolitika() {
  return (
    <main className={styles.legal}>
      <article className={styles.container}>
        <Link href="/" className={styles.back}>
          ← Hasierara itzuli
        </Link>

        <header className={styles.header}>
          <span className={styles.tagline}>Lege-oharra</span>
          <h1>Pribatutasun politika</h1>
          <p className={styles.subtitle}>
            Politika honek Gelakraftek erabiltzaileen datu pertsonalak nola
            biltzen, gordetzen eta babesten dituen azaltzen du.
          </p>
        </header>

        <section className={styles.section}>
          <h2>Sarrera</h2>
          <p>
            Gelakraft hezkuntza-tresna gamifikatua da, mitologia euskaldunaren
            testuinguruan kokatua, irakasle eta ikasleentzat sortua. Politika hau
            zure datu pertsonalak nola tratatzen ditugun azaltzeko prestatu dugu,
            beti Europako Datuen Babes Erregelamenduarekin (RGPD/EBDB) bat
            etorriz.
          </p>
        </section>

        <section className={styles.section}>
          <h2>1. Arduraduna</h2>
          <p>
            <strong>Gelakraft</strong> (gelakraft.eus). Datu pertsonalei buruzko
            zalantza edo eskubideen baliatzea egiteko, jarri gurekin
            harremanetan: <em>info@gelakraft.eus</em>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Bildutako datuak</h2>

          <h3>Irakasleen datuak</h3>
          <ul>
            <li>Helbide elektronikoa (kautotzeko)</li>
            <li>Profil-informazioa: izena, ikastetxea (aukerakoa)</li>
            <li>
              Erabilera-datuak: sortutako aulak, sortutako misioak, gehitutako
              ikasleak
            </li>
          </ul>

          <h3>Ikasleen datuak</h3>
          <ul>
            <li>Erabiltzaile-izena</li>
            <li>Izen-abizenak (irakasleak gehitzen ditu)</li>
            <li>
              Aulako jolas-datuak: XP, bihotzak, mana, osatutako misioak,
              lortutako sariak
            </li>
            <li>Saio-aldiak (saioa noiz hasi eta amaitu duen)</li>
          </ul>

          <h3>Datu teknikoak</h3>
          <ul>
            <li>IP helbidea (segurtasun-erregistroetarako bakarrik)</li>
            <li>Saio-kookieak (saioa irekita mantentzeko)</li>
            <li>Nabigatzaile mota (errore-erregistroetarako)</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. Erabilera</h2>
          <p>Datuak hurrengo helburuetarako biltzen ditugu:</p>
          <ul>
            <li>
              <strong>Plataforma funtzionatzeko</strong>: irakasle eta ikasleen
              kontuak kudeatzeko, jokoa eta puntuazioak gordetzeko.
            </li>
            <li>
              <strong>Kautotzea</strong>: irakasleak helbide elektronikoz
              (magic link), ikasleak erabiltzaile-izenez.
            </li>
            <li>
              <strong>Hobekuntza estatistikoak</strong>: erabilera anonimizatua,
              plataforma hobetzeko bakarrik.
            </li>
          </ul>
          <p className={styles.callout}>
            Ez ditugu zure datuak inolaz publizitatera, marketingera edo
            jokabidearen jarraipenetara bideratzen.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Adingabeen datuak</h2>
          <p>
            Gelakraft ikastetxeetan erabiltzeko diseinatuta dago, eta horrek
            esan nahi du adingabeen datuak prozesatu egiten direla. Datu hauek{' '}
            <strong>ikastetxearen ardurapean</strong> daude eta soilik
            hezkuntza-helburuetarako erabiltzen dira.
          </p>
          <p>
            Ikastetxeek familiei behar bezala jakinarazteko erantzukizuna dute.
            Gurasoek datuak ezabatzeko eskaera egin dezakete edozein unetan,
            ikastetxearen edo gure helbide elektronikoaren bidez.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Hirugarrenei lagatzea</h2>
          <p>
            <strong>Ez ditugu zure datuak inori saltzen</strong>. Hirugarrenei
            lagatzen badizkiogu, kasu hauek dira posibleak:
          </p>
          <ul>
            <li>
              <strong>Datuak prozesatzeko zerbitzariak</strong>: Supabase Inc.
              (datu-basea, Frankfurten kokatutako zerbitzaria) eta Vercel Inc.
              (hosting, EBko zerbitzariak).
            </li>
            <li>
              <strong>Legezko betebeharrak</strong>: agintaritzak legez hala
              eskatuz gero soilik.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>6. Cookie-ak</h2>
          <p>Cookie funtzional-tekniko hauek erabiltzen ditugu:</p>
          <ul>
            <li>
              <strong>Saio-kookieak</strong>: zure saioa irekita mantentzeko
              (irakaslearen kasuan Supabase auth bidez; ikaslearen kasuan
              iron-session bidez).
            </li>
          </ul>
          <p>
            <strong>Ez dugu</strong> jarraipen-kookierik (tracking) ezta
            publizitate-kookierik ere erabiltzen. Ez gara analitika-tresnen jabe
            diren hirugarrenekin konektatzen.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Datuen babesa eta segurtasuna</h2>
          <p>
            Datu pertsonalak zifratuta gordetzen ditugu eta industria-eredu
            egokiak jarraitzen ditugu:
          </p>
          <ul>
            <li>HTTPS zifratzea konexio guztietarako</li>
            <li>Pasahitzen hash kriptografikoa (bcrypt)</li>
            <li>Sarbide-mugak datu-basean (Row Level Security)</li>
          </ul>
          <p>
            Hala ere, gogoratu inolako sistema digitalek ezin duela %100eko
            segurtasuna bermatu.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Zure eskubideak</h2>
          <p>
            Europako Datuen Babes Erregelamenduarekin (RGPD) bat etorriz,
            eskubide hauek dituzu:
          </p>
          <ul>
            <li>
              <strong>Sarbidea</strong>: gordetako zure datuak ikusteko.
            </li>
            <li>
              <strong>Zuzenketa</strong>: okerrak diren datuak zuzentzeko.
            </li>
            <li>
              <strong>Ezabaketa</strong> (ahanztearen eskubidea): zure datuak
              ezabatzeko eskatzeko.
            </li>
            <li>
              <strong>Aurkaritza</strong>: tratamendua mugatzeko edo aurka
              egiteko.
            </li>
            <li>
              <strong>Eramangarritasuna</strong>: zure datuak formatu estandarrean
              jasotzeko.
            </li>
          </ul>
          <p>
            Eskubide hauek baliatzeko, idatzi: <em>info@gelakraft.eus</em>. 30
            eguneko epean erantzungo dizugu.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Erreklamazioak</h2>
          <p>
            Zure eskubideak urratu direla uste baduzu, agintaritza eskudunera
            jo dezakezu:
          </p>
          <ul>
            <li>
              <strong>Datuak Babesteko Espainiar Agentzia (AEPD)</strong>:{' '}
              <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">
                www.aepd.es
              </a>
            </li>
            <li>
              <strong>Datuak Babesteko Euskal Bulegoa</strong>:{' '}
              <a
                href="https://www.avpd.euskadi.eus/"
                target="_blank"
                rel="noopener noreferrer"
              >
                avpd.euskadi.eus
              </a>
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>10. Politikaren aldaketak</h2>
          <p>
            Politika hau aldatuko balitz, jakinarazpena egingo genuke
            webgunearen orri nagusian. Webgunea erabiltzen jarraitzeak
            baldintza berriei men egiten diezula esan nahi du.
          </p>
        </section>

        <footer className={styles.footer}>
          <p>
            <strong>Azken eguneraketa</strong>: 2026ko ekaina
          </p>
          <Link href="/" className={styles.backFooter}>
            ← Hasierara itzuli
          </Link>
        </footer>
      </article>
    </main>
  )
}
