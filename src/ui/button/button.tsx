import { ElementType } from 'react'
import classNames from 'classnames'

import styles from './button.module.scss'
import { ButtonProps } from './button.types'

const defaultElement = 'button'

export default function Button<E extends ElementType = typeof defaultElement>({
  variant = 'orange',
  bordered = false,
  block = false,
  children,
  as,
  className,
  ...props
}: ButtonProps<E>) {
  const TagName = as || defaultElement

  const elClassName = classNames(
    styles.root,
    styles[`root_${variant}`],
    { [styles.root_bordered]: bordered, [styles.block]: block },
    className
  )

  return (
    <TagName {...props} className={elClassName}>
      {children}
    </TagName>
  )
}
