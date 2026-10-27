import styles from './Logo.module.css'

/**
 * Official ISKCON Coimbatore logo. Its colour comes from --logo-color
 * (or --logo-color-on-dark when onDark) in src/styles/theme.css.
 */
export function Logo({ onDark = false, className = '' }) {
  return (
    <span
      role="img"
      aria-label="ISKCON Coimbatore"
      className={`${styles.logo} ${onDark ? styles.onDark : ''} ${className}`}
    />
  )
}
