'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createInbox, updateInbox } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Inbox } from '@/types/database'

export function InboxManager({ inboxes }: { inboxes: Inbox[] }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://livechat.vercel.app'

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    try {
      await createInbox({
        name: fd.get('name') as string,
        site_url: fd.get('site_url') as string,
        widget_color: fd.get('widget_color') as string,
        welcome_message: fd.get('welcome_message') as string,
      })
      toast.success('インボックスを作成しました')
      setOpen(false)
    } catch {
      toast.error('作成に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(inbox: Inbox) {
    try {
      await updateInbox(inbox.id, { is_active: !inbox.is_active })
      toast.success('更新しました')
    } catch {
      toast.error('更新に失敗しました')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
              インボックスを追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しいインボックス</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">名前</Label>
                <Input id="name" name="name" required placeholder="Website Chat" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="site_url">サイトURL</Label>
                <Input id="site_url" name="site_url" type="url" placeholder="https://example.com" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="widget_color">ウィジェットカラー</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" id="widget_color" name="widget_color" defaultValue="#3B82F6" className="h-9 w-14 rounded border border-input cursor-pointer" />
                  <Input name="widget_color_text" placeholder="#3B82F6" className="flex-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="welcome_message">ウェルカムメッセージ</Label>
                <Input id="welcome_message" name="welcome_message" placeholder="こんにちは！何かお手伝いできることはありますか？" className="mt-1" />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? '作成中...' : '作成'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {inboxes.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
            インボックスがありません
          </div>
        )}
        {inboxes.map((inbox) => (
          <div key={inbox.id} className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex-shrink-0"
                style={{ backgroundColor: inbox.widget_color }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{inbox.name}</h3>
                  <Switch
                    checked={inbox.is_active}
                    onCheckedChange={() => handleToggleActive(inbox)}
                  />
                </div>
                {inbox.site_url && (
                  <p className="text-xs text-gray-400 mt-0.5">{inbox.site_url}</p>
                )}
                <div className="mt-3 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">埋め込みスクリプト</p>
                  <code className="text-xs text-gray-500 break-all">
                    {`<script src="${appUrl}/widget.js" data-site-id="${inbox.id}"></script>`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
