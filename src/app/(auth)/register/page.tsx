import Link from 'next/link'
import { register } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-gray-900">LiveChat</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">アカウント作成</h1>
            <p className="text-gray-500 mt-1 text-sm">
              5分でライブチャットを始めましょう
            </p>
          </div>

          <form action={register} className="space-y-4">
            <div>
              <Label htmlFor="org_name" className="text-sm font-medium text-gray-700">
                会社・チーム名
              </Label>
              <Input
                id="org_name"
                name="org_name"
                type="text"
                required
                placeholder="Acme Corp"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                メールアドレス
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                パスワード
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                minLength={8}
                className="mt-1"
              />
              <p className="text-xs text-gray-400 mt-1">8文字以上</p>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-2">
              無料で始める
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-400">
            登録することで
            <a href="#" className="underline">利用規約</a>と
            <a href="#" className="underline">プライバシーポリシー</a>
            に同意したとみなされます
          </p>

          <p className="mt-4 text-center text-sm text-gray-500">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
