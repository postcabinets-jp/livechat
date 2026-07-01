import { Suspense } from 'react'
import Link from 'next/link'
import { getKbArticles, getKbCategories } from '@/app/actions/settings'
import { NewArticleForm } from '@/components/knowledge-base/new-article-form'

async function KbContent() {
  const [articles, categories] = await Promise.all([getKbArticles(), getKbCategories()])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">ナレッジベース</h1>
          <p className="text-sm text-gray-500 mt-0.5">{articles.length}件の記事</p>
        </div>
        <NewArticleForm categories={categories} />
      </div>

      <div className="space-y-2">
        {articles.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
            記事がありません。最初の記事を作成しましょう。
          </div>
        )}
        {articles.map((article) => (
          <div
            key={article.id}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-gray-900 truncate">{article.title}</h2>
                {!article.is_published && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">下書き</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {(article as { category?: { name: string } }).category?.name || 'カテゴリなし'} · {article.views}回閲覧
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {new Date(article.updated_at).toLocaleDateString('ja-JP')}
              </span>
              <Link
                href={`/help/${article.slug}`}
                className="text-xs text-blue-600 hover:text-blue-700"
                target="_blank"
              >
                プレビュー
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function KnowledgeBasePage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-400">読み込み中...</div>}>
      <KbContent />
    </Suspense>
  )
}
