/** "Contact us" form (About page). Saved in the database: admin pages → Contact messages. */
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { ApiError } from '../../api/client'
import { contactApi } from '../../api/contact'
import { TextArea } from '../../components/FormFields'
import { TextField } from '../../components/TextField'
import styles from './Pages.module.css'

const EMPTY = { name: '', email: '', message: '' }

export function ContactForm() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  function update(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrors({})
    try {
      await contactApi.send(form)
      setForm(EMPTY)
      setStatus('sent')
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors)
        setMessage(err.status === 429 ? 'Too many messages. Please try again later.' : err.message)
      }
      setStatus('error')
    }
  }

  return (
    <form className={styles.contactForm} onSubmit={submit} noValidate>
      {status === 'sent' && <div className={styles.sent}>Thank you! Your message was sent. We'll reply by email.</div>}
      {status === 'error' && message && !Object.keys(errors).length && <div className="form-error">{message}</div>}
      <TextField label="Name *" name="name" value={form.name} onChange={update} error={errors.name} required />
      <TextField label="Email *" name="email" type="email" value={form.email} onChange={update} error={errors.email} required />
      <TextArea label="Message *" name="message" value={form.message} onChange={update} error={errors.message} rows={5} required />
      <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  )
}
