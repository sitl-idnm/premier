import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Lazily register GSAP's ScrollTrigger once, on the client only.
 * Returns the shared `gsap` + `ScrollTrigger` instances for scroll animations.
 */
let registered = false

export function getGsap() {
  if (!registered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
  return { gsap, ScrollTrigger }
}

/** True when the visitor asked for reduced motion — skip decorative animation. */
export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
