/**
 * "Our hiring process" section. Steps: config/site.ts → hiringSteps.
 *   <HiringProcess band />  full-width white band (home page, outside the page container)
 *   <HiringProcess />       open section inside a page container (Careers page)
 */
import { SectionHeading } from '../../components/SectionHeading'
import { site } from '../../config/site'
import { HiringSteps } from '../hiring/HiringSteps'

export function HiringProcess({ band = false }: { band?: boolean }) {
  const content = (
    <>
      <SectionHeading
        eyebrow={site.hiringSection.badge}
        title={site.hiringSection.title}
        subtitle={site.hiringSection.subtitle}
        id="hiring-heading"
        center
      />
      <HiringSteps />
    </>
  )
  return band ? (
    <section className="band band-white" aria-labelledby="hiring-heading">
      <div className="container">{content}</div>
    </section>
  ) : (
    <section className="panel" aria-labelledby="hiring-heading">
      {content}
    </section>
  )
}
