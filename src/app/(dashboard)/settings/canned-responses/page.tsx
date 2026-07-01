import { Suspense } from 'react'
import { getCannedResponses } from '@/app/actions/settings'
import { CannedResponsesManager } from '@/components/settings/canned-responses-manager'

async function Content() {
  const responses = await getCannedResponses()
  return <CannedResponsesManager responses={responses} />
}

export default function CannedResponsesPage() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">缶詰回答</h1>
      <p className="text-sm text-gray-500 mb-6">
        <code className="bg-gray-100 px-1.5 py-0.5 rounded">/</code> キーで素早くショートカットを呼び出せます
      </p>
      <Suspense fallback={<div className="text-sm text-gray-400">読み込み中...</div>}>
        <Content />
      </Suspense>
    </div>
  )
}
