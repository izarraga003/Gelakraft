import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'
import AuthHashHandler from '@/components/auth/AuthHashHandler'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['opsz', 'SOFT', 'WONK'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GELAKRAFT · Gamifikazioa euskaraz',
  description:
    'Bihurtu zure ikasgela abentura epiko batean. Euskal mitologia, gamifikazioa eta jolasa, dena euskaraz.',
  metadataBase: new URL('https://gelakraft.eus'),
  openGraph: {
    title: 'GELAKRAFT · Gamifikazioa euskaraz',
    description:
      'Euskal mitologian errotutako gamifikazio-plataforma irakasleentzat. Mari zure gidari, Sugaar zure erronka.',
    url: 'https://gelakraft.eus',
    siteName: 'GELAKRAFT',
    locale: 'eu_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GELAKRAFT · Gamifikazioa euskaraz',
    description: 'Anbotoko kobazulotik egina. Euskal mitologia, gamifikazioa eta jolasa.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="eu" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <AuthHashHandler />
        {children}
      </body>
    </html>
  )
}
