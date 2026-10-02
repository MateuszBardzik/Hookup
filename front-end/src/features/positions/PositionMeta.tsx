// Pay · contract type · location · countries, shown on position cards and in the details popup.
import { BriefcaseIcon, GlobeIcon, PayIcon, PinIcon } from '../../components/icons'
import type { Position } from '../../types'
import styles from './Positions.module.css'

export function PositionMeta({ position, withCountries = true }: { position: Position; withCountries?: boolean }) {
  const items = [
    { key: 'pay', icon: <PayIcon size={16} />, text: position.pay, label: 'Pay' },
    { key: 'type', icon: <BriefcaseIcon size={16} />, text: position.employment_type_label, label: 'Contract type' },
    { key: 'location', icon: <PinIcon size={16} />, text: position.location, label: 'Location' },
    { key: 'countries', icon: <GlobeIcon size={16} />, text: withCountries ? position.countries : '', label: 'Countries' },
  ].filter((item) => item.text)

  if (items.length === 0) return null

  return (
    <ul className={styles.meta}>
      {items.map((item) => (
        <li key={item.key} title={item.label} className={item.key === 'pay' ? styles.metaPay : ''}>
          {item.icon}
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  )
}
