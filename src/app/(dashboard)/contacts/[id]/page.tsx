import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getContact } from '@/app/actions/contacts'

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let contact
  try {
    contact = await getContact(id)
  } catch {
    notFound()
  }
  if (!contact) notFound()

  const attrs = contact.attributes as Record<string, string>
  const conversations = (contact as { conversations?: Array<{ id: string; status: string; subject: string | null; updated_at: string; inbox?: { name: string }; messages?: Array<{ content: string }> }> }).conversations ?? []

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-xl font-semibold text-blue-700">
            {(contact.name || contact.email || '?').charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{contact.name || '名前なし'}</h1>
          <p className="text-sm text-gray-500">{contact.email}</p>
          {contact.phone && <p className="text-sm text-gray-400 mt-0.5">{contact.phone}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">属性</h2>
          {Object.keys(attrs).length === 0 && (
            <p className="text-sm text-gray-400">属性なし</p>
          )}
          <div className="space-y-2">
            {Object.entries(attrs).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{key}</span>
                <span className="text-sm text-gray-700 font-medium">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            会話 ({conversations.length})
          </h2>
          <div className="space-y-2">
            {conversations.slice(0, 5).map((conv) => (
              <Link
                key={conv.id}
                href={`/inbox/${conv.id}`}
                className="block p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 truncate">
                    {conv.subject || conv.messages?.[0]?.content?.slice(0, 40) || '内容なし'}
                  </span>
                  <span className={`text-xs ml-2 flex-shrink-0 ${
                    conv.status === 'resolved' ? 'text-green-600' :
                    conv.status === 'pending' ? 'text-yellow-600' : 'text-blue-600'
                  }`}>
                    {conv.status === 'resolved' ? '解決済' : conv.status === 'pending' ? '未対応' : '対応中'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{conv.inbox?.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Link href="/contacts" className="text-sm text-blue-600 hover:text-blue-700">
          ← コンタクト一覧に戻る
        </Link>
      </div>
    </div>
  )
}
