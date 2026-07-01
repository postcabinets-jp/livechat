import { Suspense } from 'react'
import { getOrganization } from '@/app/actions/settings'
import { OrgSettingsForm } from '@/components/settings/org-settings-form'

async function Content() {
  const org = await getOrganization()
  return <OrgSettingsForm org={org} />
}

export default function GeneralSettingsPage() {
  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">一般設定</h1>
      <Suspense fallback={<div className="text-sm text-gray-400">読み込み中...</div>}>
        <Content />
      </Suspense>
    </div>
  )
}
