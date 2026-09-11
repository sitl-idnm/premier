import { FC, SVGProps } from 'react'

/** Thin-line single-colour glyphs (paint via currentColor), from the handoff. */
const base: SVGProps<SVGSVGElement> = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none'
}

export const IconGrid: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
  </svg>
)

export const IconDoc: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg {...base} {...p}>
    <path d="M6 3h9l4 4v14H6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <line x1="9" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="9" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

export const IconChart: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg {...base} {...p}>
    <line x1="5" y1="20" x2="5" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="12" y1="20" x2="12" y2="5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="19" y1="20" x2="19" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

export const IconBack: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg {...base} {...p}>
    <line x1="19" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <polyline points="11,6 5,12 11,18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const IconLogout: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg {...base} {...p}>
    <path d="M14 4h4a1 1 0 011 1v14a1 1 0 01-1 1h-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <polyline points="9,8 4,12 9,16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="4" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

export const IconPlus: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg {...base} {...p}>
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

export const IconTrash: FC<SVGProps<SVGSVGElement>> = (p) => (
  <svg {...base} {...p}>
    <polyline points="4,7 20,7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M9 7V5h6v2M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
