import { Suspense } from 'react'
import { getInboxes } from '@/app/actions/settings'
import { InboxManager } from '@/components/settings/inbox-manager'

async function Content() {
  const inboxes = await getInboxes()
  return <InboxManager inboxes={inboxes} />
}

export default function InboxesSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">インボックス設定</h1>
      <Suspense fallback={<div className="text-sm text-gray-400">読み込み中...</div>}>
        <Content />
      </Suspense>
    </div>
  )
}
