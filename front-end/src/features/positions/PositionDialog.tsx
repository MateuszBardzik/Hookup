/**
 * Position details popup (Careers page): pay / type / location / countries, description,
 * why apply, responsibilities, requirements, plugin description, image, guideline, Apply now.
 * Empty sections are skipped. Edit the texts on the admin pages (lists: one item per line).
 */
import { Modal } from '../../components/Modal'
import type { Position } from '../../types'
import { ApplyButton } from './ApplyButton'
import { AppliedLink } from './PositionCard'
import { PositionMeta } from './PositionMeta'
import styles from './Positions.module.css'

interface Props {
  position: Position
  onClose: () => void
  applied?: boolean
}

export function PositionDialog({ position, onClose, applied = false }: Props) {
  return (
    <Modal title={position.title} onClose={onClose} width={720}>
      <div className={styles.details}>
        <PositionMeta position={position} />
        <Section title="Job description" text={position.description} />
        <List title="Why apply" items={position.why_apply} />
        <List title="Responsibilities" items={position.responsibilities} />
        <List title="Requirements" items={position.requirements} />
        <Section title="Plugin description" text={position.plugin_description} />
        {position.image && <img className={styles.image} src={position.image} alt={position.title} />}
        <Section title="Instruction guideline" text={position.instruction_guideline} />
      </div>
      <div className={styles.dialogFooter}>
        {applied ? <AppliedLink /> : <ApplyButton positionId={position.id} block />}
      </div>
    </Modal>
  )
}

function Section({ title, text }: { title: string; text: string }) {
  if (!text) return null
  return (
    <section>
      <h4 className={styles.sectionTitle}>{title}</h4>
      {/* white-space: pre-line keeps the line breaks typed in the database */}
      <p className={styles.sectionText}>{text}</p>
    </section>
  )
}

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <section>
      <h4 className={styles.sectionTitle}>{title}</h4>
      <ul className={styles.bullets}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}
