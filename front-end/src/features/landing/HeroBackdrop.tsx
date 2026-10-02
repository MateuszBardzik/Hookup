/**
 * Moving background behind the whole first screen (hero text + picture + tool strip):
 *   - network lines that leave the glowing nodes of the illustration and run across the section,
 *     with nodes and light pulses travelling along them
 *   - small particles drifting slowly upward
 *   - three large, blurred indigo orbs moving very slowly
 *   - soft wave lines along the bottom 
 *   - on desktop, a soft light that follows the mouse and brightens nearby nodes
 * The effects are strongest around the picture and fade out behind the text (see .network mask).
 * Animations pause when the hero is off screen or the tab is hidden, and are not shown at all
 * to visitors who prefer reduced motion. Node positions come from heroPicture.ts (ANCHORS).
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import styles from './HeroBackdrop.module.css'
import { ANCHORS, PICTURE, useReducedMotion } from './heroPicture'

type Point = { x: number; y: number }
type Layout = { w: number; h: number; anchors: Point[]; box: { left: number; top: number; right: number; bottom: number } }

/**
 * Where each network line goes: node index (in ANCHORS) → target point in the section, worked out
 * from the section size (w, h) and the picture box (box.left/top/right/bottom).
 */
const LINES: { node: number; to: (l: Layout) => Point }[] = [
  { node: 0, to: (l) => ({ x: l.box.left * 0.55, y: l.box.top + (l.box.bottom - l.box.top) * 0.2 }) },
  { node: 0, to: (l) => ({ x: l.box.left * 0.72, y: l.box.bottom + (l.h - l.box.bottom) * 0.35 }) },
  { node: 1, to: (l) => ({ x: l.box.left * 0.82, y: l.h * 0.06 }) },
  { node: 1, to: (l) => ({ x: l.box.left + (l.box.right - l.box.left) * 0.62, y: 0 }) },
  { node: 3, to: (l) => ({ x: l.box.left + (l.box.right - l.box.left) * 0.9, y: 0 }) },
  { node: 3, to: (l) => ({ x: l.w, y: l.box.top + (l.box.bottom - l.box.top) * 0.12 }) },
  { node: 4, to: (l) => ({ x: l.w, y: l.box.top + (l.box.bottom - l.box.top) * 0.62 }) },
  { node: 2, to: (l) => ({ x: l.box.right + (l.w - l.box.right) * 0.4, y: l.h * 0.98 }) },
]

// Particles: [left %, top %, size px, duration s, delay s]
const PARTICLES: [number, number, number, number, number][] = Array.from({ length: 28 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1 // fixed pseudo-random
  return [Math.round(r(1) * 100), Math.round(30 + r(2) * 70), 2 + Math.round(r(3) * 4), 9 + Math.round(r(4) * 10), -Math.round(r(5) * 18)]
})

function curve(a: Point, b: Point) {
  const dx = (b.x - a.x) * 0.5
  return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} C${(a.x + dx).toFixed(1)} ${a.y.toFixed(1)} ${(b.x - dx).toFixed(1)} ${b.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
}

export function HeroBackdrop() {
  const reduced = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [layout, setLayout] = useState<Layout | null>(null)
  const [paused, setPaused] = useState(false)
  const [mouse, setMouse] = useState<Point | null>(null)

  // Measure the section and the picture, and turn node positions into section coordinates.
  useEffect(() => {
    const root = rootRef.current
    const section = root?.parentElement
    const img = section?.querySelector<Element>('[data-hero-picture]')
    if (!root || !section || !img) return
    const measure = () => {
      const s = section.getBoundingClientRect()
      const b = img.getBoundingClientRect()
      const scale = Math.max(b.width / PICTURE.width, b.height / PICTURE.height) // object-fit: cover / preserveAspectRatio slice
      const offX = b.left - s.left + (b.width - PICTURE.width * scale) / 2 - PICTURE.x * scale
      const offY = b.top - s.top + (b.height - PICTURE.height * scale) / 2 - PICTURE.y * scale
      setLayout({
        w: s.width,
        h: s.height,
        anchors: ANCHORS.map(([x, y]) => ({ x: offX + x * scale, y: offY + y * scale })),
        box: { left: b.left - s.left, top: b.top - s.top, right: b.right - s.left, bottom: b.bottom - s.top },
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(section)
    observer.observe(img)
    return () => observer.disconnect()
  }, [reduced])

  // Pause everything when the hero is off screen or the browser tab is hidden.
  useEffect(() => {
    const section = rootRef.current?.parentElement
    if (!section) return
    let visible = true
    const update = () => setPaused(!visible || document.hidden)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      update()
    })
    io.observe(section)
    document.addEventListener('visibilitychange', update)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [reduced])
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    if (paused) svg.pauseAnimations()
    else svg.unpauseAnimations()
  }, [paused, layout])

  // Desktop only: light follows the mouse over the whole section.
  useEffect(() => {
    const section = rootRef.current?.parentElement
    if (!section || reduced) return
    let frame = 0
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const s = section.getBoundingClientRect()
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setMouse({ x: e.clientX - s.left, y: e.clientY - s.top }))
    }
    const onLeave = () => setMouse(null)
    section.addEventListener('pointermove', onMove)
    section.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced])

  if (reduced) return null

  const lines = layout
    ? LINES.map(({ node, to }) => ({ from: layout.anchors[node], to: to(layout) }))
    : []
  // a few cross links between line ends, so it reads as a network
  const links = lines.length >= 3 ? [[0, 2], [1, 0], [3, 4], [5, 6]].map(([a, b]) => ({ from: lines[a].to, to: lines[b].to })) : []
  const near = (p: Point) => (mouse ? Math.hypot(p.x - mouse.x, p.y - mouse.y) < 170 : false)

  return (
    <div
      ref={rootRef}
      className={`${styles.backdrop} ${paused ? styles.paused : ''}`}
      style={
        {
          '--mx': mouse ? `${mouse.x}px` : '-999px',
          '--my': mouse ? `${mouse.y}px` : '-999px',
          '--pic-left': layout ? `${layout.box.left}px` : '50%',
        } as CSSProperties
      }
      aria-hidden
    >
      <span className={`${styles.orb} ${styles.orb1}`} />
      <span className={`${styles.orb} ${styles.orb2}`} />
      <span className={`${styles.orb} ${styles.orb3}`} />

      <div className={styles.particles}>
        {PARTICLES.map(([left, top, size, dur, delay], i) => (
          <span
            key={i}
            className={styles.particle}
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}
          />
        ))}
      </div>

      {layout && (
        <svg ref={svgRef} className={styles.network} viewBox={`0 0 ${layout.w} ${layout.h}`} preserveAspectRatio="none">
          <defs>
            <radialGradient id="bd-pulse">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.4" stopColor="#a99bff" />
              <stop offset="1" stopColor="#5038ee" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[...lines, ...links].map((l, i) => (
            <path key={`l${i}`} id={`bd-line-${i}`} className={i < lines.length ? styles.line : styles.link} d={curve(l.from, l.to)} />
          ))}
          {lines.map((l, i) => (
            <circle key={`p${i}`} r="5" fill="url(#bd-pulse)">
              <animateMotion dur={`${3.2 + (i % 4) * 0.8}s`} begin={`${i * 0.7}s`} repeatCount="indefinite" path={curve(l.from, l.to)} />
            </circle>
          ))}
          {lines.map((l, i) => (
            <circle
              key={`n${i}`}
              className={`${styles.node} ${near(l.to) ? styles.nodeNear : ''}`}
              style={{ animationDelay: `${i * 0.5}s` }}
              cx={l.to.x}
              cy={l.to.y}
              r="4"
            />
          ))}
        </svg>
      )}

      <svg className={styles.waves} viewBox="0 0 2400 120" preserveAspectRatio="none">
        <path className={styles.wave1} d="M0 70 C200 30 400 30 600 70 S1000 110 1200 70 S1600 30 1800 70 S2200 110 2400 70" />
        <path className={styles.wave2} d="M0 85 C200 55 400 55 600 85 S1000 115 1200 85 S1600 55 1800 85 S2200 115 2400 85" />
        <path className={styles.wave3} d="M0 100 C200 80 400 80 600 100 S1000 120 1200 100 S1600 80 1800 100 S2200 120 2400 100" />
      </svg>

      <span className={styles.spotlight} />
    </div>
  )
}
