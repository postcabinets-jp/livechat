import { Suspense } from 'react'
import { getAgents } from '@/app/actions/agents'
import { AgentManager } from '@/components/settings/agent-manager'

async function Content() {
  const agents = await getAgents()
  return <AgentManager agents={agents} />
}

export default function AgentsSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">エージェント管理</h1>
      <Suspense fallback={<div className="text-sm text-gray-400">読み込み中...</div>}>
        <Content />
      </Suspense>
    </div>
  )
}
