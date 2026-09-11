import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSiteContent } from '@/shared/content'

import { ContentEditor } from '../../_components/ContentEditor'
import { IconBack } from '../../_components/icons'
import { groupById } from '../../_lib/groups'
import styles from '../../admin.module.scss'

export default async function GroupPage({
  params
}: {
  params: { group: string }
}) {
  const def = groupById(params.group)
  if (!def) notFound()

  const content = await getSiteContent()

  return (
    <>
      <div className={styles.topbar}>
        <Link href="/admin/content" className={styles.back}>
          <IconBack /> Ко всем разделам
        </Link>
      </div>

      <h1 className={styles.pageTitle} style={{ marginBottom: 8 }}>
        {def.title}
      </h1>
      <p className={styles.saveNote} style={{ marginBottom: 24 }}>{def.desc}</p>

      <ContentEditor group={def.id} content={content} />
    </>
  )
}
