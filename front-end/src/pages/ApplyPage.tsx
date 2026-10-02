/**
 * /apply (?position=<id> pre-selects a role) — the application form (hiring step 1).
 *   Experience & skills (+ resume) · Additional information
 *   (name, email, phone and location are taken from the account / profile automatically)
 * Login required (so the applicant can follow their progress on the dashboard);
 * logged-out visitors see Sign up / Log in buttons first.
 * Saved in the database: admin pages → Applications. Submitting moves the application straight to
 * step 2, so the success screen offers the position's qualification test (Google Form) right away.
 */
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/client'
import { positionsApi } from '../api/positions'
import { useAuth } from '../auth/useAuth'
import { Select, TextArea } from '../components/FormFields'
import { UploadIcon } from '../components/icons'
import { PageHero } from '../components/PageHero'
import { site } from '../config/site'
import { useAuthDialog } from '../features/auth/useAuthDialog'
import styles from '../features/pages/Pages.module.css'
import { ApplyTestDialog } from '../features/positions/ApplyTestDialog'
import type { Application, Position } from '../types'

const AVAILABILITY = [
  { value: 'under_10', label: 'Less than 10 hours / week' },
  { value: '10_20', label: '10 – 20 hours / week' },
  { value: '20_40', label: '20 – 40 hours / week' },
  { value: 'over_40', label: '40+ hours / week' },
]

export function ApplyPage() {
  const { user, loading } = useAuth()
  const { openAuthDialog } = useAuthDialog()
  const [params] = useSearchParams()
  const [positions, setPositions] = useState<Position[]>([])
  const [done, setDone] = useState<Application | null>(null)
  const [testOpen, setTestOpen] = useState(false)

  useEffect(() => {
    positionsApi.list().then(setPositions).catch(() => setPositions([]))
  }, [])

  return (
    <div className={`container ${styles.page}`}>
      <PageHero title={site.apply.title} subtitle={site.apply.subtitle} crumb="Apply" />

      <section className="panel" aria-label="Application form">
        {loading ? null : !user ? (
          <div className={styles.done}>
            <h2>Create a free account to apply</h2>
            <p>With an account you can follow your application, take the qualification test and see your projects.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={() => openAuthDialog('signup')}>
                Sign up
              </button>
              <button className="btn btn-outline" onClick={() => openAuthDialog('login')}>
                Log in
              </button>
            </div>
          </div>
        ) : done ? (
          <div className={styles.done}>
            <h2>Application sent!</h2>
            <p>
              Next step: the qualification test for <strong>{done.position_title}</strong>. Take it now or later from
              your dashboard (Qualification tests).
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
              <button className="btn btn-primary" onClick={() => setTestOpen(true)}>
                Take the qualification test
              </button>
              <Link to="/portal" className="btn btn-outline">
                Go to my dashboard
              </Link>
            </div>
            {testOpen && <ApplyTestDialog application={done} onClose={() => setTestOpen(false)} />}
          </div>
        ) : (
          <ApplyForm positions={positions} initialPosition={params.get('position') ?? ''} onDone={setDone} />
        )}
      </section>
    </div>
  )
}

function ApplyForm({
  positions,
  initialPosition,
  onDone,
}: {
  positions: Position[]
  initialPosition: string
  onDone: (application: Application) => void
}) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    position: initialPosition,
    related_experience: '',
    motivation: '',
    availability: '',
  })
  const [resume, setResume] = useState<File | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  function update(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setSending(true)
    setErrors({})
    setMessage('')
    const data = new FormData()
    Object.entries(form).forEach(([k, v]) => data.append(k, v))
    data.append('agreed_terms', String(agreed))
    if (resume) data.append('resume', resume)
    try {
      onDone(await positionsApi.apply(data))
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors)
        setMessage(err.message)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <form className={styles.applyForm} onSubmit={submit} noValidate>
      <div className={styles.formCol}>
        <h2>Experience & skills</h2>
        <Select
          label="Which position are you interested in? *"
          name="position"
          value={form.position}
          onChange={update}
          error={errors.position}
          placeholder="Select a position"
          options={positions.map((p) => ({ value: p.id, label: p.title }))}
        />
        <TextArea
          label="Related experience"
          name="related_experience"
          value={form.related_experience}
          onChange={update}
          error={errors.related_experience}
          placeholder="Tell us about your relevant experience or skills"
        />
        <div className="field">
          <label htmlFor="field-resume">Resume (optional)</label>
          <label className={styles.fileBox}>
            <UploadIcon />
            <span>{resume ? resume.name : 'Choose a file…'}</span>
            <input
              id="field-resume"
              type="file"
              accept=".pdf,.doc,.docx"
              hidden
              onChange={(e) => setResume(e.target.files?.[0] ?? null)}
            />
          </label>
          <span className={styles.hint}>PDF, DOC or DOCX, up to 5 MB</span>
          {errors.resume && <span className="field-error">{errors.resume}</span>}
        </div>
      </div>

      <div className={styles.formCol}>
        <h2>Additional information</h2>
        <TextArea
          label="Why do you want to join us? *"
          name="motivation"
          value={form.motivation}
          onChange={update}
          error={errors.motivation}
          placeholder="Tell us what motivates you"
        />
        <Select
          label="Availability *"
          name="availability"
          value={form.availability}
          onChange={update}
          error={errors.availability}
          placeholder="Select availability"
          options={AVAILABILITY}
        />
        <div>
          <label className={styles.terms}>
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            {site.apply.termsText}
          </label>
          {errors.agreed_terms && <span className="field-error">{errors.agreed_terms}</span>}
        </div>
      </div>

      <p className={styles.profileNote}>
        Applying as <strong>{user?.email}</strong>. Your name, phone and location are taken from your{' '}
        <Link to="/portal/profile">profile</Link>.
      </p>
      <div className={styles.submitRow}>
        {message && Object.keys(errors).length > 0 && <span className="field-error">{message}</span>}
        <button className="btn btn-primary" type="submit" disabled={sending}>
          {sending ? 'Sending…' : 'Submit application'}
        </button>
      </div>
    </form>
  )
}
