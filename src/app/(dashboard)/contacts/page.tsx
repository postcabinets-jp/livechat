import { Suspense } from 'react'
import Link from 'next/link'
import { getContacts } from '@/app/actions/contacts'

function timeAgo(dateStr: string | null) {
  if (!dateStr) return '-'
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '本日'
  if (days < 7) return `${days}日前`
  if (days < 30) return `${Math.floor(days / 7)}週間前`
  return `${Math.floor(days / 30)}ヶ月前`
}

async function ContactList({ search }: { search?: string }) {
  const contacts = await getContacts(search)

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">名前</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">メール</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide hidden md:table-cell">会社</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide hidden lg:table-cell">プラン</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">最終接触</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {contacts.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                コンタクトが見つかりません
              </td>
            </tr>
          )}
          {contacts.map((contact) => (
            <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/contacts/${contact.id}`} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-blue-700">
                      {(contact.name || contact.email || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                    {contact.name || '名前なし'}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-500">{contact.email || '-'}</td>
              <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                {(contact.attributes as Record<string, string>)?.company || '-'}
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                {(contact.attributes as Record<string, string>)?.plan ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {(contact.attributes as Record<string, string>).plan}
                  </span>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">
                {timeAgo(contact.last_seen_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const search = params.q

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <h1 className="text-sm font-semibold text-gray-900">コンタクト</h1>
        <form method="get" className="flex-1 max-w-xs">
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="名前・メールで検索..."
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>
      <div className="flex-1 overflow-auto">
        <Suspense key={search} fallback={<div className="p-8 text-sm text-gray-400">読み込み中...</div>}>
          <ContactList search={search} />
        </Suspense>
      </div>
    </div>
  )
}
