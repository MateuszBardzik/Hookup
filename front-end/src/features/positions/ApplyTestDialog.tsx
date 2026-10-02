/**
 * Qualification test popup (portal → Qualification tests): the position's test instructions and
 * a button that opens its Google Form in a new tab (name/email already filled in).
 *   text → positions_position.test_instructions   link → positions_position.test_form_url
 * Only shown once an admin moved the application to the "Qualification test" step.
 * Answers arrive in your Google Form responses.
 */
import { Modal } from '../../components/Modal'
import type { Application } from '../../types'
import styles from './Positions.module.css'

interface Props {
  application: Application
  onClose: () => void
}

export function ApplyTestDialog({ application, onClose }: Props) {
  const hasForm = Boolean(application.test_form_link)

  return (
    <Modal title={`Qualification test: ${application.position_title}`} onClose={onClose} width={600}>
      <div className={styles.testBadge}>Step 2 of 5</div>

      <p className={styles.testText}>
        {application.test_instructions || 'Complete the test in the form below. It takes about 30 minutes.'}
      </p>

      <div className={styles.dialogFooter}>
        <button className="btn btn-outline" onClick={onClose}>
          Close
        </button>
        {hasForm ? (
          <a className="btn btn-primary" href={application.test_form_link} target="_blank" rel="noopener noreferrer">
            Start the test ↗
          </a>
        ) : (
          <button className="btn btn-primary" disabled title="The test link hasn't been added yet">
            Test not available yet
          </button>
        )}
      </div>
    </Modal>
  )
}
