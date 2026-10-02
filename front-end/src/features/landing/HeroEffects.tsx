/**
 * Moving details drawn ON TOP of the hero picture (public/hero-engivexlab.webp). The picture itself
 * never moves; only these small parts do:
 *   - halos pulsing around the blue nodes, small handles of the 3D part's box blinking
 *   - light pulses running along the dashed connector lines
 *   - a glossy light sweeping across the PCB board, and the chip glowing
 *   - checklist ticks lighting up one after another
 *   - the annotation box around the cube "marching" (moving dashes)
 *   - a scan line passing over the 3D part, and one over the picture on the image card
 *   - a light streak gliding along the blue ribbon
 *   - small cursor tags of people at work, drifting gently (CURSORS; empty list = no tags)
 *
 * Coordinates are pixels of the 988 × 741 picture (PICTURE in heroPicture.ts). If you change the
 * picture, update the positions here. Visitors who prefer reduced motion get no effects, and the
 * animations pause when the picture is off screen or the tab is hidden.
 */
import { useEffect, useRef } from 'react'
import styles from './HeroEffects.module.css'
import { ANCHORS, PICTURE, useReducedMotion } from './heroPicture'

// Dashed lines in the picture that carry a travelling light (SVG paths, picture pixels)
const WIRES = [
  'M274 73 L392 132', // top node → checklist
  'M97 389 L185 336', // left node → PCB board
  'M484 228 V392', // the vertical line between checklist and annotation card
  'M445 585 V510', // bottom node → annotation card
  'M608 562 L833 680', // line under the annotation card
  'M660 75 L772 132 V320', // edges of the 3D part's box
  'M810 77 L660 75 V357',
]

// Small square handles of the 3D part's box: [x, y]
const HANDLES: [number, number][] = [
  [660, 75], [772, 132], [659, 234], [772, 320], [660, 357], [846, 126], [538, 290],
]

// Checklist ticks: centre [x, y]
const TICKS: [number, number][] = [
  [446, 80],
  [446, 122],
  [446, 164],
]

// Outline of the PCB board (for the light sweep) and of the annotation box around the cube
const PCB = 'M164 148 L440 285 Q452 291 452 304 L452 492 L164 350 Q157 346 157 338 L157 156 Q157 145 164 148 Z'
const ANNOTATION_BOX = 'M435 403 L563 466 L563 570 L435 506 Z'

const CURSORS = [
  { x: 352, y: 292, name: 'Leo · PCB review', tone: styles.cursorIndigo, delay: '0s' },
  { x: 500, y: 168, name: 'Maya · QA', tone: styles.cursorViolet, delay: '-2.5s' },
  { x: 578, y: 508, name: 'Ana · Annotation', tone: styles.cursorSky, delay: '-5s' },
]

export function HeroEffects() {
  const reduced = useReducedMotion()
  const svgRef = useRef<SVGSVGElement>(null)

  // Pause when the picture is off screen or the browser tab is hidden.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    let visible = true
    const update = () => {
      const run = visible && !document.hidden
      svg.classList.toggle(styles.paused, !run)
      if (run) svg.unpauseAnimations()
      else svg.pauseAnimations()
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      update()
    })
    io.observe(svg)
    document.addEventListener('visibilitychange', update)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [reduced])

  if (reduced) return null

  return (
    <svg
      ref={svgRef}
      className={styles.layer}
      viewBox={`${PICTURE.x} ${PICTURE.y} ${PICTURE.width} ${PICTURE.height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id="fx-dot">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.4" stopColor="#b9adff" />
          <stop offset="1" stopColor="#5038ee" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fx-glow">
          <stop offset="0" stopColor="#8b7bff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#8b7bff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fx-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fx-scan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8b7bff" stopOpacity="0" />
          <stop offset="1" stopColor="#8b7bff" stopOpacity="0.35" />
        </linearGradient>
        <clipPath id="fx-pcb">
          <path d={PCB} />
        </clipPath>
        <clipPath id="fx-part">
          <path d="M660 75 L810 77 L846 126 L846 272 L772 320 L660 357 L538 290 L538 200 Z" />
        </clipPath>
        <clipPath id="fx-photo">
          <path d="M744 403 L796 428 L796 478 L744 452 Z" />
        </clipPath>
      </defs>

      {/* PCB: chip glow + a glossy light sweeping across the board */}
      <ellipse className={styles.chipGlow} cx="312" cy="320" rx="70" ry="48" fill="url(#fx-glow)" />
      <g clipPath="url(#fx-pcb)">
        <rect className={styles.sheen} x="40" y="100" width="110" height="460" fill="url(#fx-sheen)" transform="skewX(-20)" />
      </g>

      {/* 3D part: a scan plane passing over it */}
      <g clipPath="url(#fx-part)">
        <path className={styles.partScan} d="M530 60 L860 225 L860 245 L530 80 Z" fill="url(#fx-scan)" />
      </g>

      {/* image card: scan line over the picture */}
      <g clipPath="url(#fx-photo)">
        <path className={styles.photoScan} d="M740 398 L800 428" />
      </g>

      {/* annotation box: moving dashes + blinking corners */}
      <path className={styles.annotation} d={ANNOTATION_BOX} />

      {/* ribbon: a light streak gliding along it */}
      <path className={styles.ribbonStreak} d="M768 392 L986 292" pathLength={100} />

      {/* checklist ticks lighting up one after another */}
      {TICKS.map(([x, y], i) => (
        <circle key={`t${i}`} className={styles.tickRing} style={{ animationDelay: `${i * 0.7}s` }} cx={x} cy={y} r={15} />
      ))}

      {/* halos around the nodes, blinking handles */}
      {ANCHORS.slice(0, 3).map(([x, y], i) => (
        <circle key={`n${i}`} className={styles.halo} style={{ animationDelay: `${i * 0.8}s` }} cx={x} cy={y} r={10} />
      ))}
      <circle className={styles.halo} style={{ animationDelay: '1.2s' }} cx={484} cy={259} r={7} />
      {HANDLES.map(([x, y], i) => (
        <rect key={`h${i}`} className={styles.handle} style={{ animationDelay: `${i * 0.4}s` }} x={x - 5} y={y - 5} width={10} height={10} rx={2} />
      ))}

      {/* light pulses along the dashed lines */}
      {WIRES.map((d, i) => (
        <circle key={`w${i}`} r="6" fill="url(#fx-dot)">
          <animateMotion dur={`${2.6 + (i % 3) * 0.8}s`} begin={`${i * 0.6}s`} repeatCount="indefinite" path={d} />
        </circle>
      ))}

      {/* people at work */}
      {CURSORS.map(({ x, y, name, tone, delay }) => (
        <g key={name} className={`${styles.cursor} ${tone}`} style={{ animationDelay: delay }}>
          <g transform={`translate(${x} ${y})`}>
            <path d="M0 0 L0 19 L5.2 14.3 L9 22.5 L12.6 20.9 L8.7 12.8 L15.2 12.6 Z" className={styles.cursorArrow} />
            <rect x={12} y={21} width={name.length * 7.5 + 24} height={27} rx={13.5} className={styles.cursorPill} />
            <text x={24} y={39} className={styles.cursorText}>
              {name}
            </text>
          </g>
        </g>
      ))}
    </svg>
  )
}
