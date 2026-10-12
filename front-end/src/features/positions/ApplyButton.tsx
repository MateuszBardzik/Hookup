// "Apply now" button used on position cards and in the details popup. Opens the Apply page
// with this position already selected.
// Positions that aren't active yet (no qualification test link on the admin pages) show a popup
// instead (NotOpenDialog; text in config/site.ts → apply.notOpen*), so nobody can start applying.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../../components/Modal'
import { site } from '../../config/site'
import type { Position } from '../../types'
import styles from './Positions.module.css'

interface Props {
  position: Pick<Position, 'id' | 'title' | 'is_active'>
  block?: boolean
}

export function ApplyButton({ position, block }: Props) {
  const navigate = useNavigate()
  const [notOpen, setNotOpen] = useState(false)
  return (
    <>
      <button
        className={`btn btn-primary ${block ? 'btn-block' : ''} ${position.is_active ? '' : styles.applyInactive}`}
        aria-haspopup={position.is_active ? undefined : 'dialog'}
        onClick={(e) => {
          e.stopPropagation() // don't also open the details popup when clicked on a card
          if (position.is_active) navigate(`/apply?position=${position.id}`)
          else setNotOpen(true)
        }}
      >
        Apply now
      </button>
      {notOpen && <NotOpenDialog title={position.title} onClose={() => setNotOpen(false)} />}
    </>
  )
}

/** "Not open for applications yet" popup. */
export function NotOpenDialog({ title, onClose }: { title: string; onClose: () => void }) {
  const a = site.apply
  const [before, after = ''] = a.notOpenText.split('{position}')
  return (
    <Modal title={a.notOpenTitle} onClose={onClose}>
      <div className={styles.notOpen}>
        <span className={styles.notOpenIcon} aria-hidden>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </span>
        <p>
          {before}
          <strong>{title}</strong>
          {after}
        </p>
      </div>
      <div className={styles.dialogFooter}>
        <button className="btn btn-primary" onClick={onClose} autoFocus>
          {a.notOpenButton}
        </button>
      </div>
    </Modal>
  )
}
