import { CSSProperties, FC } from 'react'
import classNames from 'classnames'

import styles from './icon.module.scss'

export type IconName =
  | 'coins'
  | 'helmet'
  | 'kid'
  | 'smile'
  | 'directions'
  | 'discount'
  | 'forest'
  | 'stock'
  | 'hourglass'
  | 'check-circle'

type IconProps = {
  name: IconName
  size?: number
  className?: string
}

export const Icon: FC<IconProps> = ({ name, size = 24, className }) => {
  const style: CSSProperties | undefined =
    size === 24 ? undefined : { width: size, height: size }

  return (
    <i
      className={classNames(styles.ic, styles[`ic_${name}`], className)}
      style={style}
      aria-hidden="true"
    />
  )
}
