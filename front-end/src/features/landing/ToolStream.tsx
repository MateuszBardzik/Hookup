/**
 * "Works with the tools you already know": a full-width white band under the hero with the tools
 * as small pills (icon + name) that scroll slowly from right to left, forever. The stream stops
 * while the mouse is over it, and stands still (wrapped in rows) for visitors who prefer reduced
 * motion. Tools are configured in src/config/site.ts → tools.
 */
import { useState, type CSSProperties } from 'react'
import { ToolIcon } from '../../components/icons'
import { site, type Tool } from '../../config/site'
import styles from './ToolStream.module.css'

export function ToolStream() {
  if (site.tools.length === 0) return null

  // seconds for one full loop: more tools → longer, so the speed stays the same
  const duration = { '--duration': `${site.tools.length * 5}s` } as CSSProperties

  return (
    <section className={styles.section} aria-labelledby="tools-heading">
      <p id="tools-heading" className={styles.heading}>
        {site.toolsHeading}
      </p>
      <div className={styles.viewport}>
        {/* the list is drawn twice so the loop has no gap; the copy is hidden from screen readers */}
        <div className={styles.track} style={duration}>
          <ul className={styles.list}>
            {site.tools.map((tool) => (
              <ToolPill key={tool.name} tool={tool} />
            ))}
          </ul>
          <ul className={`${styles.list} ${styles.copy}`} aria-hidden>
            {site.tools.map((tool) => (
              <ToolPill key={tool.name} tool={tool} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function ToolPill({ tool }: { tool: Tool }) {
  // official logo from public/tools/; if the file isn't there (yet), a small stand-in icon
  const [logoMissing, setLogoMissing] = useState(false)
  const showLogo = tool.logo && !logoMissing
  const style = tool.color ? ({ '--tool': tool.color } as CSSProperties) : undefined
  return (
    <li className={styles.pill} style={style}>
      <span className={`${styles.icon} ${showLogo ? styles.logo : ''}`}>
        {showLogo ? <img src={tool.logo} alt="" onError={() => setLogoMissing(true)} /> : <ToolIcon category={tool.category} />}
      </span>
      {tool.name}
    </li>
  )
}
