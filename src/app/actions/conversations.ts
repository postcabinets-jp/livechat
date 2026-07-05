'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ConversationStatus } from '@/types/database'
import {
  getConversationsSchema,
  getConversationSchema,
  updateConversationStatusSchema,
  assignConversationSchema,
  sendMessageSchema,
} from '@/lib/validations'

async function getAgentContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: agent } = await supabase
    .from('agents')
    .select('id, organization_id, role')
    .eq('user_id', user.id)
    .single()
  if (!agent) throw new Error('Agent not found')

  return { supabase, agent }
}

export async function getConversations(status?: ConversationStatus) {
  const parsed = getConversationsSchema.safeParse({ status })
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()

  let query = supabase
    .from('conversations')
    .select(`
      *,
      contact:contacts(id, email, name, avatar_url),
      assigned_agent:agents!assigned_agent_id(id, display_name, avatar_url),
      inbox:inboxes(id, name),
      messages(id, content, created_at, sender_type)
    `)
    .eq('organization_id', agent.organization_id)
    .order('updated_at', { ascending: false })

  if (parsed.data.status) {
    query = query.eq('status', parsed.data.status)
  }

  const { data, error } = await query.limit(50)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getConversation(id: string) {
  const parsed = getConversationSchema.safeParse({ id })
  if (!parsed.success) {
    throw new Error(`Invalid conversation ID: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      contact:contacts(*),
      assigned_agent:agents!assigned_agent_id(id, display_name, avatar_url, status),
      inbox:inboxes(id, name, widget_color),
      messages(*, sender_agent:agents!sender_agent_id(id, display_name, avatar_url)),
      conversation_labels(label_id, labels(id, title, color))
    `)
    .eq('id', parsed.data.id)
    .eq('organization_id', agent.organization_id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateConversationStatus(id: string, status: ConversationStatus) {
  const parsed = updateConversationStatusSchema.safeParse({ id, status })
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()

  const updates: Record<string, unknown> = { status: parsed.data.status }
  if (parsed.data.status === 'resolved') updates.resolved_at = new Date().toISOString()
  if (parsed.data.status !== 'resolved') updates.resolved_at = null

  const { error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', parsed.data.id)
    .eq('organization_id', agent.organization_id)

  if (error) throw new Error(error.message)
  revalidatePath('/inbox')
  revalidatePath(`/inbox/${parsed.data.id}`)
}

export async function assignConversation(conversationId: string, agentId: string | null) {
  const parsed = assignConversationSchema.safeParse({ conversationId, agentId })
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()

  const { error } = await supabase
    .from('conversations')
    .update({ assigned_agent_id: parsed.data.agentId })
    .eq('id', parsed.data.conversationId)
    .eq('organization_id', agent.organization_id)

  if (error) throw new Error(error.message)
  revalidatePath('/inbox')
  revalidatePath(`/inbox/${parsed.data.conversationId}`)
}

export async function sendMessage(conversationId: string, content: string, isPrivateNote = false) {
  const parsed = sendMessageSchema.safeParse({ conversationId, content, isPrivateNote })
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()

  const { error } = await supabase.from('messages').insert({
    conversation_id: parsed.data.conversationId,
    organization_id: agent.organization_id,
    sender_type: 'agent',
    sender_agent_id: agent.id,
    message_type: 'outgoing',
    content_type: 'text',
    content: parsed.data.content,
    is_private_note: parsed.data.isPrivateNote,
  })

  if (error) throw new Error(error.message)

  // Update conversation updated_at and first_reply_at if needed
  const { data: conv } = await supabase
    .from('conversations')
    .select('first_reply_at')
    .eq('id', parsed.data.conversationId)
    .single()

  const convUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (!conv?.first_reply_at && !parsed.data.isPrivateNote) {
    convUpdates.first_reply_at = new Date().toISOString()
    convUpdates.status = 'open'
  }

  await supabase
    .from('conversations')
    .update(convUpdates)
    .eq('id', parsed.data.conversationId)

  revalidatePath(`/inbox/${parsed.data.conversationId}`)
}

export async function getDashboardStats() {
  const { supabase, agent } = await getAgentContext()
  const orgId = agent.organization_id

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [allConvs, pendingConvs, resolvedToday, messages] = await Promise.all([
    supabase.from('conversations').select('id', { count: 'exact' })
      .eq('organization_id', orgId)
      .gte('created_at', today.toISOString()),
    supabase.from('conversations').select('id', { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('status', 'pending'),
    supabase.from('conversations').select('id', { count: 'exact' })
      .eq('organization_id', orgId)
      .eq('status', 'resolved')
      .gte('resolved_at', today.toISOString()),
    supabase.from('conversations').select('first_reply_at, created_at')
      .eq('organization_id', orgId)
      .not('first_reply_at', 'is', null)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  let avgFrt = 0
  if (messages.data && messages.data.length > 0) {
    const totalMs = messages.data.reduce((sum, c) => {
      const diff = new Date(c.first_reply_at!).getTime() - new Date(c.created_at).getTime()
      return sum + diff
    }, 0)
    avgFrt = Math.round(totalMs / messages.data.length / 60000) // minutes
  }

  return {
    todayConversations: allConvs.count ?? 0,
    pendingConversations: pendingConvs.count ?? 0,
    resolvedToday: resolvedToday.count ?? 0,
    avgFirstResponseMinutes: avgFrt,
  }
}
