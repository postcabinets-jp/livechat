import { Suspense } from 'react'
import { getReportStats } from '@/app/actions/settings'

const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  idle: 'bg-yellow-400',
  busy: 'bg-red-500',
  offline: 'bg-gray-300',
}

async function ReportContent({ days }: { days: number }) {
  const stats = await getReportStats(days)

  const resolutionRate = stats.totalConversations > 0
    ? Math.round((stats.resolvedConversations / stats.totalConversations) * 100)
    : 0

  const maxCount = Math.max(...stats.conversationsByDay.map((d) => d.count), 1)

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400">総会話数</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalConversations}</p>
          <p className="text-xs text-gray-400 mt-1">過去{days}日間</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400">解決済み</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{stats.resolvedConversations}</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400">解決率</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{resolutionRate}%</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-400">平均初回応答時間</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {stats.avgFirstResponseMinutes === 0 ? '-' : `${stats.avgFirstResponseMinutes}分`}
          </p>
        </div>
      </div>

      {/* Conversation trend */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="font-medium text-gray-900 mb-4">会話数の推移</h2>
        <div className="flex items-end gap-1 h-24">
          {stats.conversationsByDay.map((day) => (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1"
              title={`${day.date}: ${day.count}件`}
            >
              <div
                className="w-full bg-blue-500 rounded-sm min-h-[2px]"
                style={{ height: `${(day.count / maxCount) * 88 + 4}px` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-300">
          <span>{stats.conversationsByDay[0]?.date.slice(5)}</span>
          <span>{stats.conversationsByDay[stats.conversationsByDay.length - 1]?.date.slice(5)}</span>
        </div>
      </div>

      {/* Agent report */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="font-medium text-gray-900 mb-4">エージェント別</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 text-xs font-medium text-gray-400">エージェント</th>
              <th className="text-left py-2 text-xs font-medium text-gray-400">ステータス</th>
              <th className="text-right py-2 text-xs font-medium text-gray-400">総会話</th>
              <th className="text-right py-2 text-xs font-medium text-gray-400">解決済</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(stats.agents as Array<{ id: string; display_name: string; status: string; conversations?: Array<{ status: string }> }>).map((agent) => {
              const agentConvs = agent.conversations ?? []
              const resolved = agentConvs.filter((c) => c.status === 'resolved').length
              return (
                <tr key={agent.id}>
                  <td className="py-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs text-blue-700">{agent.display_name.charAt(0)}</span>
                    </div>
                    {agent.display_name}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
                      <span className="text-xs text-gray-500">{agent.status}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-gray-700">{agentConvs.length}</td>
                  <td className="py-3 text-right text-green-600">{resolved}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>
}) {
  const params = await searchParams
  const days = Number(params.days || 30)

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <h1 className="text-sm font-semibold text-gray-900">レポート</h1>
        <div className="flex items-center gap-1">
          {[7, 30, 90].map((d) => (
            <a
              key={d}
              href={`/reports?days=${d}`}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                days === d
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {d}日
            </a>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <Suspense key={days} fallback={<div className="p-8 text-sm text-gray-400">読み込み中...</div>}>
          <ReportContent days={days} />
        </Suspense>
      </div>
    </div>
  )
}
