/**
 * /portal/profile — profile page inside the worker portal.
 * Name, identity, address, LinkedIn profile, phone, image, personal website.
 */
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ApiError } from '../api/client'
import { profileApi } from '../api/profile'
import { useAuth } from '../auth/useAuth'
import { TextField } from '../components/TextField'
import { PortalHeading } from '../features/portal/PortalLayout'
import styles from '../features/profile/Profile.module.css'
import type { User } from '../types'

// Text fields shown on the form, in order. Add/remove here to change the form
// (the field must also exist in accounts/models.py + serializers.py).
const FIELDS: { name: keyof User; label: string; type?: string; placeholder?: string; half?: boolean }[] = [
  { name: 'first_name', label: 'First name', half: true },
  { name: 'last_name', label: 'Last name', half: true },
  { name: 'identity', label: 'Identity' },
  { name: 'address', label: 'Address' },
  { name: 'phone', label: 'Phone', type: 'tel', half: true },
  { name: 'linkedin_url', label: 'LinkedIn profile', type: 'url', placeholder: 'https://linkedin.com/in/…', half: true },
  { name: 'website', label: 'Personal website', type: 'url', placeholder: 'https://…' },
]

export function ProfilePage() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.name, String(user?.[f.name] ?? '')])),
  )
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photo ?? null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  if (!user) return null

  function update(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
    setStatus('idle')
  }

  function pickPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setStatus('idle')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setFieldErrors({})

    // With a new photo we must send multipart FormData; otherwise plain JSON.
    let payload: Partial<User> | FormData = form
    if (photoFile) {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      data.append('photo', photoFile)
      payload = data
    }

    try {
      const updated = await profileApi.update(payload)
      setUser(updated)
      setPhotoFile(null)
      setStatus('saved')
    } catch (err) {
      if (err instanceof ApiError) setFieldErrors(err.fieldErrors)
      setStatus('error')
    }
  }

  const initials = `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase()

  return (
    <section className={styles.page}>
      <PortalHeading title="Profile" subtitle="Your details are used in your applications and shared with project leads." />

      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <div className={styles.photoRow}>
          {photoPreview ? (
            <img className={styles.photo} src={photoPreview} alt="Profile" />
          ) : (
            <div className={styles.photo}>{initials}</div>
          )}
          <div>
            <label className="btn btn-outline">
              {photoPreview ? 'Change photo' : 'Upload photo'}
              <input type="file" accept="image/*" onChange={pickPhoto} hidden />
            </label>
            <p className={styles.email}>{user.email}</p>
            {fieldErrors.photo && <span className="field-error">{fieldErrors.photo}</span>}
          </div>
        </div>

        <div className={styles.grid}>
          {FIELDS.map((f) => (
            <div key={f.name} className={f.half ? '' : styles.full}>
              <TextField
                label={f.label}
                name={f.name}
                type={f.type ?? 'text'}
                placeholder={f.placeholder}
                value={form[f.name]}
                onChange={update}
                error={fieldErrors[f.name]}
              />
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          {status === 'saved' && <span className={styles.saved}>Saved</span>}
          {status === 'error' && <span className="field-error">Please fix the errors above.</span>}
          <button className="btn btn-primary" type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  )
}
