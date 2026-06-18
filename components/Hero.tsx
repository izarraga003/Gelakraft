import Image from 'next/image'
import Link from 'next/link'
import TopBar from './TopBar'
import EmojiRain from './fun/EmojiRain'
import { ArrowRightIcon } from './icons'

/**
 * Hero principal de la landing.
 */
export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <Image
          src="/mari-anboto.jpg"
          alt="Mari, Anbotoko jainkosa, bere kobazuloan"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center right' }}
        />
      </div>
      <div className="hero-overlay" />

      <TopBar />

      <div className="hero-content">
        <div className="hero-inner">
          <div className="hero-eyebrow">Euskal mitologiazko ikasgela</div>
          <h1>
            Bihurtu zure ikasgela{' '}
            <EmojiRain emojis={['🌙', '🔥', '⚡', '✨', '🐻']} count={18}>
              <span className="accent">abentura epiko</span>
            </EmojiRain>{' '}
            batean.
          </h1>
          <p className="hero-sub">
            Euskal mitologia, gamifikazioa eta jolasa, dena ikasgelaren erdian. Mari zure gidari,
            Sugaar zure erronka.
          </p>
          <div className="hero-ctas">
            <Link href="/izen-ematea" className="btn-primary">
              Izen-ematea
              <ArrowRightIcon />
            </Link>
            <a href="#nola-dabilen" className="btn-secondary">
              Nola dabilen ikusi →
            </a>
          </div>
        </div>
      </div>

      <div className="hero-mark">Anbotoko kobazulotik · 2026</div>

      <div className="scroll-cue">
        <span>gehiago jakin</span>
        <div className="scroll-cue-line" />
      </div>
    </section>
  )
}
