import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HelpPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('kb_articles')
    .select('*, category:kb_categories(name, icon)')
    .eq('is_published', true)
    .order('views', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-blue-600 py-12 text-center">
        <h1 className="text-3xl font-bold text-white">ヘルプセンター</h1>
        <p className="text-blue-100 mt-2">よくある質問と使い方ガイド</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {(!articles || articles.length === 0) && (
          <p className="text-center text-gray-400">記事はまだありません</p>
        )}
        <div className="space-y-2">
          {articles?.map((article) => (
            <Link
              key={article.id}
              href={`/help/${article.slug}`}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div>
                <h2 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {(article as { category?: { name: string } }).category?.name} · {article.views}回閲覧
                </p>
              </div>
              <span className="text-gray-300 group-hover:text-blue-500">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
