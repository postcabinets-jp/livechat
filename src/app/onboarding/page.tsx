import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: agent } = await supabase
    .from('agents')
    .select('*, organizations(*), inboxes:organizations(inboxes(*))')
    .eq('user_id', user.id)
    .single()

  const inbox = (agent as { inboxes?: { inboxes: Array<{ id: string }> } } | null)?.inboxes?.inboxes?.[0]
  const siteId = inbox?.id || 'YOUR_SITE_ID'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://livechat.vercel.app'

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">セットアップ完了！</h1>
          <p className="text-gray-500 mt-2">ウィジェットをサイトに設置するだけで始められます</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">1</div>
            <h2 className="font-semibold text-gray-900">以下のコードをサイトに貼り付ける</h2>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 break-all mb-2">
            {`<script src="${appUrl}/widget.js" data-site-id="${siteId}"></script>`}
          </div>
          <p className="text-xs text-gray-400 mb-6">
            {'</body>'} タグの直前に貼り付けてください
          </p>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">2</div>
            <h2 className="font-semibold text-gray-900">ダッシュボードで会話を確認</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            サイトを訪れたユーザーのメッセージがリアルタイムでインボックスに届きます
          </p>

          <Link href="/dashboard">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              ダッシュボードへ進む →
            </Button>
          </Link>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          後から変更したい場合は 設定 → インボックス から確認できます
        </p>
      </div>
    </div>
  )
}
