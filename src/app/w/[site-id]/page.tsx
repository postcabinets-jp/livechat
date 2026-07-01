import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { WidgetChat } from '@/components/chat/widget-chat'

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ 'site-id': string }>
}) {
  const { 'site-id': siteId } = await params
  const supabase = await createClient()

  const { data: inbox } = await supabase
    .from('inboxes')
    .select('id, name, widget_color, welcome_message, organization_id')
    .eq('id', siteId)
    .eq('is_active', true)
    .single()

  if (!inbox) notFound()

  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Chat</title>
      </head>
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <WidgetChat inbox={inbox} />
      </body>
    </html>
  )
}
