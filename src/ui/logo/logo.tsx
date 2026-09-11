import { CSSProperties, FC } from 'react'
import classNames from 'classnames'

import styles from './logo.module.scss'

/** «Премьер» wordmark (SVG from Figma), rendered as a recolorable CSS mask so
 *  it inherits `currentColor` — `dark` for light surfaces (header), `light`
 *  (white) for the dark footer. */
type LogoProps = {
  variant?: 'dark' | 'light'
  width?: number
  height?: number
  className?: string
}

export const Logo: FC<LogoProps> = ({
  variant = 'dark',
  width,
  height,
  className
}) => {
  const style: CSSProperties | undefined =
    width || height ? { width, height } : undefined

  return (
    <span
      className={classNames(styles.logo, styles[variant], className)}
      style={style}
      role="img"
      aria-label="Премьер"
    />
  )
}
