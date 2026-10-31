import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import styles from './RichText.module.css'

/** Renders a rich text field from the admin (festival significance, blog posts). */
export function RichText({ data, className = '' }) {
  if (!data?.root?.children?.length) return null
  return <LexicalRichText data={data} className={`${styles.prose} ${className}`} />
}
