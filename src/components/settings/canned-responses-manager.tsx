'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createCannedResponse, deleteCannedResponse } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { CannedResponse } from '@/types/database'

export function CannedResponsesManager({ responses }: { responses: CannedResponse[] }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    try {
      await createCannedResponse(
        fd.get('short_code') as string,
        fd.get('content') as string
      )
      toast.success('缶詰回答を作成しました')
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '作成に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, shortCode: string) {
    if (!confirm(`/${shortCode} を削除しますか？`)) return
    try {
      await deleteCannedResponse(id)
      toast.success('削除しました')
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
              追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しい缶詰回答</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="short_code">ショートカット</Label>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-gray-400 text-sm">/</span>
                  <Input
                    id="short_code"
                    name="short_code"
                    required
                    placeholder="thanks"
                    pattern="[a-z0-9-]+"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">小文字・数字・ハイフンのみ</p>
              </div>
              <div>
                <Label htmlFor="content">内容</Label>
                <Textarea
                  id="content"
                  name="content"
                  required
                  rows={4}
                  placeholder="お問い合わせいただきありがとうございます..."
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                  {saving ? '保存中...' : '保存'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {responses.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
            缶詰回答がありません
          </div>
        )}
        {responses.map((r) => (
          <div
            key={r.id}
            className="flex items-start gap-4 border border-gray-200 rounded-xl p-4"
          >
            <div className="flex-shrink-0">
              <code className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-mono">
                /{r.short_code}
              </code>
            </div>
            <p className="flex-1 text-sm text-gray-700">{r.content}</p>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 h-7 flex-shrink-0"
              onClick={() => handleDelete(r.id, r.short_code)}
            >
              削除
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
