import { Suspense } from 'react'
import Link from 'next/link'
import { getConversations } from '@/app/actions/conversations'
import { Badge } from '@/components/ui/badge'
import type { ConversationStatus } from '@/types/database'

const statusConfig: Record<ConversationStatus, { label: string; color: string }> = {
  pending: { label: '未対応', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  open: { label: '対応中', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  resolved: { label: '解決済', color: 'bg-green-100 text-green-700 border-green-200' },
  snoozed: { label: 'スヌーズ', color: 'bg-gray-100 text-gray-600 border-gray-200' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'たった今'
  if (mins < 60) return `${mins}分前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}時間前`
  return `${Math.floor(hours / 24)}日前`
}

async function InboxContent({ status }: { status?: ConversationStatus }) {
  const conversations = await getConversations(status)

  return (
    <div className="divide-y divide-gray-100">
      {conversations.length === 0 && (
        <div className="p-12 text-center text-sm text-gray-400">
          会話がありません
        </div>
      )}
      {conversations.map((conv) => {
        const lastMessage = conv.messages?.[conv.messages.length - 1]
        const statusCfg = statusConfig[conv.status as ConversationStatus]

        return (
          <Link
            key={conv.id}
            href={`/inbox/${conv.id}`}
            className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-medium text-blue-700">
                {(conv.contact?.name || conv.contact?.email || '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {conv.contact?.name || conv.contact?.email || '匿名'}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded border ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
                {conv.assigned_agent && (
                  <span className="text-xs text-gray-400 truncate">
                    → {conv.assigned_agent.display_name}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">
                {conv.subject || lastMessage?.content || '内容なし'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-300">{conv.inbox?.name}</span>
              </div>
            </div>
            <span className="text-xs text-gray-300 flex-shrink-0 mt-1">
              {timeAgo(conv.updated_at)}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const status = params.status as ConversationStatus | undefined

  const tabs: Array<{ label: string; value?: ConversationStatus }> = [
    { label: 'すべて' },
    { label: '未対応', value: 'pending' },
    { label: '対応中', value: 'open' },
    { label: '解決済', value: 'resolved' },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 px-4 flex items-center gap-0">
        <h1 className="text-sm font-semibold text-gray-900 mr-6 py-3">インボックス</h1>
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.value ? `/inbox?status=${tab.value}` : '/inbox'}
            className={`px-3 py-3 text-sm border-b-2 transition-colors ${
              status === tab.value
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        <Suspense key={status} fallback={<div className="p-8 text-sm text-gray-400">読み込み中...</div>}>
          <InboxContent status={status} />
        </Suspense>
      </div>
    </div>
  )
}
