import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from('kb_articles')
    .select('*, category:kb_categories(name)')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !article) notFound()

  // Increment views (fire and forget)
  supabase
    .from('kb_articles')
    .update({ views: article.views + 1 })
    .eq('id', article.id)
    .then(() => {})

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100 py-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/help" className="hover:text-gray-600">ヘルプ</Link>
          <span>/</span>
          <span className="text-gray-700">{article.title}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
        <p className="text-sm text-gray-400 mb-8">
          {(article as { category?: { name: string } }).category?.name} · {article.views}回閲覧 ·{' '}
          {new Date(article.updated_at).toLocaleDateString('ja-JP')}
        </p>
        <div className="prose prose-gray max-w-none">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
            {article.content}
          </pre>
        </div>
      </div>
    </div>
  )
}
