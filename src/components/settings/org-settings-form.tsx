'use client'

import { toast } from 'sonner'
import { updateOrganization } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Organization } from '@/types/database'

const timezones = [
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Shanghai',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
]

export function OrgSettingsForm({ org }: { org: Organization }) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await updateOrganization({
        name: fd.get('name') as string,
        timezone: fd.get('timezone') as string,
      })
      toast.success('設定を保存しました')
    } catch {
      toast.error('保存に失敗しました')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          組織名
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={org.name}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">
          タイムゾーン
        </Label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={org.timezone}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label className="text-sm font-medium text-gray-700">プラン</Label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-gray-900 capitalize">{org.plan}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            現在のプラン
          </span>
        </div>
      </div>
      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
        保存
      </Button>
    </form>
  )
}
