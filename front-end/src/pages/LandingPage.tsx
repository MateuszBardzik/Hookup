// Home page, top to bottom:
//   hero + tool strip (together exactly one screen), our services, open roles (dark band),
//   hiring process (white band), why work with us, feedback (white band), FAQ, "Join our team" banner.
// Sections are separated by space and full-width bands instead of boxes (see global.css .panel / .band).
import { Faq } from '../features/landing/Faq'
import { Hero } from '../features/landing/Hero'
import { HeroBackdrop } from '../features/landing/HeroBackdrop'
import { HiringProcess } from '../features/landing/HiringProcess'
import { JoinBanner } from '../features/landing/JoinBanner'
import styles from '../features/landing/Landing.module.css'
import { OpenRoles } from '../features/landing/OpenRoles'
import { ServicesSection } from '../features/landing/ServicesSection'
import { Testimonials } from '../features/landing/Testimonials'
import { ToolStream } from '../features/landing/ToolStream'
import { WhyUs } from '../features/landing/WhyUs'

export function LandingPage() {
  return (
    <>
      {/* "Above the fold": hero + tool strip together fill exactly one screen, no scrolling. */}
      <div className={styles.fold}>
        <div className={styles.heroStage}>
          <HeroBackdrop />
          <div className={`container ${styles.heroWrap}`}>
            <Hero />
          </div>
        </div>
        <ToolStream />
      </div>
      <div className="container">
        <ServicesSection />
      </div>
      <div className="band-spacer" />
      <OpenRoles />
      <HiringProcess band />
      <div className="container">
        <WhyUs />
      </div>
      <div className="band-spacer" />
      <Testimonials />
      <div className="container" style={{ paddingBottom: 'var(--section-space)' }}>
        <Faq />
        <JoinBanner />
      </div>
    </>
  )
}
