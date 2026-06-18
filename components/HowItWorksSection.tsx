import EmojiRain from './fun/EmojiRain'

/**
 * Sección "Cómo funciona" — explica los conceptos básicos del juego en bocados
 * pequeños y divertidos: XP, vidas, mana, poderes, equipos, eventos.
 */
export default function HowItWorksSection() {
  return (
    <section className="how-section" id="nola-dabilen">
      <div className="how-inner">
        <div className="how-eyebrow">Nola dabilen</div>
        <h2 className="how-title">
          Klasea, baina <span className="how-accent">jokoa balitz bezala</span>
        </h2>
        <p className="how-lead">
          Etxean gustatzen zaizkien munduetatik hartzen ditugu mekanikak —
          puntu, bihotz, talde, botere — eta ikasgelan biltzen ditugu. Ez du
          ezer ordeztu nahi: zure eskola-modua gehiago disfrutatzeko
          tresna-kaxa bat da.
        </p>

        <div className="how-grid">
          <article className="how-card how-card-xp">
            <EmojiRain emojis={['⚡', '✨', '⭐', '💫']} count={10}>
              <span className="how-card-icon" aria-hidden="true">⚡</span>
            </EmojiRain>
            <h3 className="how-card-title">Esperientzia (XP)</h3>
            <p className="how-card-desc">
              Ariketa zuzen, parte hartze, lankide bati lagundu… ekintza
              positibo bakoitzak XP ematen du. XPak mailak ematen ditu, eta
              mailek botere berriak eta avatar piezak desblokeatzen dituzte.
            </p>
            <p className="how-card-hint">Klikatu nire ikonoan ⚡</p>
          </article>

          <article className="how-card how-card-hearts">
            <EmojiRain emojis={['❤️', '💔', '💗', '💖']} count={10}>
              <span className="how-card-icon" aria-hidden="true">❤️</span>
            </EmojiRain>
            <h3 className="how-card-title">Bihotzak</h3>
            <p className="how-card-desc">
              Bizia. Berandu etorri, jokabide gaiztoa, materiala ez zaindu…
              bihotzak galtzen dira. Zerora iristen bada, Mariren patua
              eginen du: irakasleak zerrenda batetik ausazko ondorio bat
              exekutatuko du.
            </p>
            <p className="how-card-hint">Klikatu nire ikonoan ❤️</p>
          </article>

          <article className="how-card how-card-mana">
            <EmojiRain emojis={['🔮', '✨', '🪄', '💎']} count={10}>
              <span className="how-card-icon" aria-hidden="true">🔮</span>
            </EmojiRain>
            <h3 className="how-card-title">Mana eta botereak</h3>
            <p className="how-card-desc">
              Astero (irakasleak erabakitzen duen egunetan) ikasleek mana
              jasotzen dute. Manarekin botereak erabili ditzakete: taldekide
              bati sendatu, egun gehigarri bat eskatu lan baterako, atseden
              tarte bat lortu… Batzuk automatikoak dira; beste batzuek
              irakaslearen baieztapena behar dute.
            </p>
            <p className="how-card-hint">Klikatu nire ikonoan 🔮</p>
          </article>

          <article className="how-card how-card-team">
            <EmojiRain emojis={['🐻', '🐺', '🦉', '🌲']} count={10}>
              <span className="how-card-icon" aria-hidden="true">👥</span>
            </EmojiRain>
            <h3 className="how-card-title">Taldeak eta kooperazioa</h3>
            <p className="how-card-desc">
              Klasea heroi-taldeetan banatzen da: sorgina, lamia eta jentila
              klase bakoitzeko kide bana izanik. Bihotz partekatuak,
              taldekideak sendatzeko botereak, talde-erronkak… lankidetza
              saritzen duen mundua.
            </p>
            <p className="how-card-hint">Klikatu nire ikonoan 👥</p>
          </article>

          <article className="how-card how-card-events">
            <EmojiRain emojis={['📜', '🎲', '🌙', '🌌']} count={10}>
              <span className="how-card-icon" aria-hidden="true">📜</span>
            </EmojiRain>
            <h3 className="how-card-title">Ustekabeko gertaerak</h3>
            <p className="how-card-desc">
              Klasea pixka bat aspertzen ari da? Sakatu botoia eta euskal
              mitologiako gertaera ausazko bat agertuko da: iratxoak
              hitzekin jolasten, akelarrera deia, Sugaarren probaldia…
              Bost minutu, klasea kolpe batean piztu.
            </p>
            <p className="how-card-hint">Klikatu nire ikonoan 📜</p>
          </article>

          <article className="how-card how-card-fair">
            <EmojiRain emojis={['⚖️', '👍', '⚠️']} count={10}>
              <span className="how-card-icon" aria-hidden="true">⚖️</span>
            </EmojiRain>
            <h3 className="how-card-title">Ondorio justuak</h3>
            <p className="how-card-desc">
              Saria eta zigorra zerrenda editagarriko gauzak dira:{' '}
              <em>Ariketa pantailaratu zuzen egin · +50 XP</em>,{' '}
              <em>Berandu etorri · −2 bihotz</em>… Irakasleak bere taldera
              egokitzen ditu eta klik bakar batean aplikatzen dizkie.
            </p>
            <p className="how-card-hint">Klikatu nire ikonoan ⚖️</p>
          </article>
        </div>

        <p className="how-foot">
          Helburua sinplea da: <strong>etxean dakitenarekin lotuta</strong>{' '}
          dauden mekanika dibertigarriak erabiltzea, jokaera positiboa
          saritzeko eta lankidetza sustatzeko.
        </p>
      </div>
    </section>
  )
}
