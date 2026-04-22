import Hero from '../components/home/Hero'
import StatsBelt from '../components/home/StatsBelt'
import CrisisSection from '../components/home/CrisisSection'
import HowItWorks from '../components/home/HowItWorks'
import DepinSection from '../components/home/DepinSection'
import { VisionSection, HomeCTA } from '../components/home/VisionCTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBelt />
      <CrisisSection />
      <HowItWorks />
      <DepinSection />
      <VisionSection />
      <HomeCTA />
    </>
  )
}
