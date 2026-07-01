'use client'

import { logout } from '@/app/actions/auth'
import { updateAgentStatus as setStatus } from '@/app/actions/agents'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Agent } from '@/types/database'

const statusColors = {
  online: 'bg-green-500',
  idle: 'bg-yellow-400',
  busy: 'bg-red-500',
  offline: 'bg-gray-400',
}

const statusLabels = {
  online: 'オンライン',
  idle: 'アイドル',
  busy: '対応中',
  offline: 'オフライン',
}

export function Header({ agent }: { agent: Agent & { organizations: { name: string } } }) {
  return (
    <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{agent.organizations?.name}</span>
      </div>

      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 transition-colors">
            <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
            <span className="text-xs text-gray-600">{statusLabels[agent.status]}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs">ステータス変更</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map((s) => (
              <DropdownMenuItem
                key={s}
                onSelect={async () => {
                  await setStatus(s)
                }}
                className="gap-2"
              >
                <div className={`w-2 h-2 rounded-full ${statusColors[s]}`} />
                {statusLabels[s]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xs font-medium text-blue-700">
                {agent.display_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-700 hidden sm:block">{agent.display_name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs">{agent.display_name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => { window.location.href = '/settings/general' }}>
              設定
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={async () => { await logout() }} className="text-red-600">
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
