'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createKbArticle } from '@/app/actions/settings'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { KbCategory } from '@/types/database'

export function NewArticleForm({ categories }: { categories: KbCategory[] }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const title = fd.get('title') as string
    const content = fd.get('content') as string
    const categoryId = fd.get('category_id') as string
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

    try {
      await createKbArticle({
        title,
        content,
        slug,
        category_id: categoryId || undefined,
        is_published: false,
      })
      toast.success('記事を作成しました')
      setOpen(false)
    } catch (err) {
      toast.error('作成に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
          記事を作成
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>新しい記事</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">タイトル</Label>
            <Input id="title" name="title" required placeholder="記事のタイトル" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="category_id">カテゴリ</Label>
            <Select name="category_id">
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="content">内容（Markdown）</Label>
            <Textarea
              id="content"
              name="content"
              required
              rows={10}
              placeholder="# 記事タイトル&#10;&#10;ここに内容を書きます..."
              className="mt-1 font-mono text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? '保存中...' : '下書き保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
