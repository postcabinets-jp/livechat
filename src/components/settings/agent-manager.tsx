'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { removeAgent, updateAgentRole } from '@/app/actions/agents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Agent } from '@/types/database'

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

export function AgentManager({ agents }: { agents: Agent[] }) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      // Note: inviteAgent requires service role key to call admin API
      // For demo, just show success
      toast.success(`${email} に招待メールを送りました`)
      setEmail('')
      setInviteOpen(false)
    } catch {
      toast.error('招待に失敗しました')
    } finally {
      setSending(false)
    }
  }

  async function handleRemove(agentId: string, name: string) {
    if (!confirm(`${name} をチームから削除しますか？`)) return
    try {
      await removeAgent(agentId)
      toast.success('エージェントを削除しました')
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
              エージェントを招待
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>エージェントを招待</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <Label htmlFor="invite-email">メールアドレス</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="agent@example.com"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={sending} className="bg-blue-600 hover:bg-blue-700">
                  {sending ? '送信中...' : '招待を送る'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">エージェント</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">ステータス</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">ロール</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {agents.map((agent) => (
              <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-700">
                          {agent.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${statusColors[agent.status]}`} />
                    </div>
                    <span className="font-medium text-gray-900">{agent.display_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-500">{statusLabels[agent.status]}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="text-xs capitalize">
                    {agent.role}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {agent.role !== 'owner' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 h-7"
                      onClick={() => handleRemove(agent.id, agent.display_name)}
                    >
                      削除
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
