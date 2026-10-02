// Textarea and select with the same label / error layout as TextField.
import type { SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  name: string
  error?: string
}

export function TextArea({ label, name, error, id, ...props }: TextAreaProps) {
  const inputId = id ?? `field-${name}`
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <textarea id={inputId} name={name} aria-invalid={!!error} {...props} />
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  name: string
  error?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
}

export function Select({ label, name, error, id, options, placeholder, ...props }: SelectProps) {
  const inputId = id ?? `field-${name}`
  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <select id={inputId} name={name} aria-invalid={!!error} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
