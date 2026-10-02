// Shared facts about the hero picture (public/hero-engivexlab.webp), used by HeroEffects and HeroBackdrop.
// If you replace the picture, update its size and the positions below (pixels of the picture).
import { useSyncExternalStore } from 'react'

/** Size of the hero picture in pixels (the effects' coordinate system). */
export const PICTURE = { x: 0, y: 0, width: 988, height: 741 }

/**
 * The round blue nodes in the picture: [x, y]. They get a pulsing halo, and HeroBackdrop continues
 * network lines from them across the whole section.
 */
export const ANCHORS: [number, number][] = [
  [97, 389], // left, next to the PCB board
  [274, 73], // top, above the checklist
  [445, 585], // bottom, under the annotation card
  [810, 77], // top right corner of the 3D part's box
  [846, 272], // right side of the 3D part's box
]

export function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia('(prefers-reduced-motion: reduce)')
      query.addEventListener('change', onChange)
      return () => query.removeEventListener('change', onChange)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => true,
  )
}
