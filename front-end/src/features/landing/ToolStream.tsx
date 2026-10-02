/**
 * The row of supported tools under the hero: a full-width white band with the tool names
 * (or logos) in grey that turn blue on hover. Tools are configured in src/config/site.ts → tools.
 */
import type { CSSProperties } from 'react'
import { site, type Tool } from '../../config/site'
import styles from './ToolStream.module.css'

export function ToolStream() {
  if (site.tools.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby="tools-heading">
      <div className="container">
        <p id="tools-heading" className={styles.heading}>
          {site.toolsHeading}
        </p>
        <ul className={styles.row}>
          {site.tools.map((tool) => (
            <ToolName key={tool.name} tool={tool} />
          ))}
        </ul>
      </div>
    </section>
  )
}

function ToolName({ tool }: { tool: Tool }) {
  const style = tool.color ? ({ '--accent': tool.color } as CSSProperties) : undefined
  return (
    <li className={styles.tool} style={style}>
      {tool.logo ? <img src={tool.logo} alt={tool.name} /> : tool.name}
    </li>
  )
}
