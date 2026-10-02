// Label + input + error message, used by every form.
import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
  error?: string
}

export function TextField({ label, name, error, id, ...inputProps }: TextFieldProps) {
  const inputId = id ?? `field-${name}`
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} name={name} aria-invalid={!!error} {...inputProps} />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
