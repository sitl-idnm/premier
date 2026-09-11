'use client'

import { AnchorHTMLAttributes, FC } from 'react'
import { Goal, ymGoal } from '@/shared/lib/metrika'

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  goal: Goal
  goalParams?: Record<string, unknown>
}

/**
 * `<a>` that fires a Метрика goal on click — lets server components (footer)
 * track contact clicks without becoming client components themselves.
 */
export const TrackedLink: FC<TrackedLinkProps> = ({
  goal,
  goalParams,
  onClick,
  children,
  ...rest
}) => (
  <a
    {...rest}
    onClick={(e) => {
      ymGoal(goal, goalParams)
      onClick?.(e)
    }}
  >
    {children}
  </a>
)
