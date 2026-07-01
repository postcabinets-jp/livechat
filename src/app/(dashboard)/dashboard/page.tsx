import { Suspense } from 'react'
import { getDashboardStats } from '@/app/actions/conversations'
import { getAgents } from '@/app/actions/agents'
import { getConversations } from '@/app/actions/conversations'
import { Badge } from '@/components/ui/badge'

function StatCard({
  label,
  value,
  sub,
  color = 'blue',
}: {
  label: string
  value: string | number
  sub?: string
  color?: 'blue' | 'green' | 'yellow' | 'red'
}) {
  const colors = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    red: 'border-red-200 bg-red-50',
  }
  const textColors = {
    blue: 'text-blue-700',
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    red: 'text-red-700',
  }

  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${textColors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  idle: 'bg-yellow-400',
  busy: 'bg-red-500',
  offline: 'bg-gray-300',
}

const statusLabels: Record<string, string> = {
  online: 'オンライン',
  idle: 'アイドル',
  busy: '対応中',
  offline: 'オフライン',
}

async function DashboardContent() {
  const [stats, agents, recentConversations] = await Promise.all([
    getDashboardStats(),
    getAgents(),
    getConversations('pending'),
  ])

  const frtLabel = stats.avgFirstResponseMinutes < 60
    ? `${stats.avgFirstResponseMinutes}分`
    : `${Math.round(stats.avgFirstResponseMinutes / 60)}時間`

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">ダッシュボード</h1>
        <p className="text-sm text-gray-500 mt-0.5">本日の概要</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="本日の会話数" value={stats.todayConversations} color="blue" />
        <StatCard
          label="未対応"
          value={stats.pendingConversations}
          color={stats.pendingConversations > 5 ? 'red' : 'yellow'}
        />
        <StatCard label="本日の解決数" value={stats.resolvedToday} color="green" />
        <StatCard
          label="平均初回応答時間"
          value={stats.avgFirstResponseMinutes === 0 ? '-' : frtLabel}
          sub="過去7日間"
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active agents */}
        <div className="border border-gray-200 rounded-xl p-5">
          <h2 className="font-medium text-gray-900 mb-4">エージェント</h2>
          <div className="space-y-3">
            {agents.length === 0 && (
              <p className="text-sm text-gray-400">エージェントがいません</p>
            )}
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-700">
                      {agent.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${statusColors[agent.status]}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{agent.display_name}</p>
                  <p className="text-xs text-gray-400">{statusLabels[agent.status]}</p>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs capitalize"
                >
                  {agent.role}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent pending conversations */}
        <div className="border border-gray-200 rounded-xl p-5">
          <h2 className="font-medium text-gray-900 mb-4">未対応の会話</h2>
          <div className="space-y-3">
            {recentConversations.length === 0 && (
              <p className="text-sm text-gray-400">未対応の会話はありません</p>
            )}
            {recentConversations.slice(0, 5).map((conv) => (
              <a
                key={conv.id}
                href={`/inbox/${conv.id}`}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {(conv.contact?.name || conv.contact?.email || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {conv.contact?.name || conv.contact?.email || '匿名'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {conv.subject || '件名なし'}
                  </p>
                </div>
                <span className="text-xs text-gray-300 group-hover:text-blue-500">→</span>
              </a>
            ))}
          </div>
          {recentConversations.length > 0 && (
            <a
              href="/inbox?status=pending"
              className="block mt-3 text-center text-sm text-blue-600 hover:text-blue-700"
            >
              すべて見る ({recentConversations.length})
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-400">読み込み中...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
