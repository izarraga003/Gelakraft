import Hero from '@/components/Hero'
import HowItWorksSection from '@/components/HowItWorksSection'
import ToolsSection from '@/components/ToolsSection'
import MythologySection from '@/components/MythologySection'
import AudienceSection from '@/components/AudienceSection'
import PrivacySection from '@/components/PrivacySection'
import CTASection from '@/components/CTASection'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorksSection />
      <ToolsSection />
      <MythologySection />
      <AudienceSection />
      <PrivacySection />
      <CTASection />
      <Footer />
    </>
  )
}
