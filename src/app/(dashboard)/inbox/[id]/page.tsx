import { notFound } from 'next/navigation'
import { getConversation } from '@/app/actions/conversations'
import { ConversationView } from '@/components/inbox/conversation-view'

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let conversation
  try {
    conversation = await getConversation(id)
  } catch {
    notFound()
  }

  if (!conversation) notFound()

  return <ConversationView conversation={conversation} />
}
