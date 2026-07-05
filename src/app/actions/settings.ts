'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  updateOrganizationSchema,
  createInboxSchema,
  updateInboxSchema,
  createCannedResponseSchema,
  deleteCannedResponseSchema,
  createLabelSchema,
  createKbArticleSchema,
  updateKbArticleSchema,
  deleteKbArticleSchema,
  getReportStatsSchema,
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

export async function getOrganization() {
  const { supabase, agent } = await getAgentContext()
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', agent.organization_id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateOrganization(updates: { name?: string; timezone?: string }) {
  const parsed = updateOrganizationSchema.safeParse({ updates })
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()
  const { error } = await supabase
    .from('organizations')
    .update(parsed.data.updates)
    .eq('id', agent.organization_id)
  if (error) throw new Error(error.message)
  revalidatePath('/settings/general')
}

export async function getInboxes() {
  const { supabase, agent } = await getAgentContext()
  const { data, error } = await supabase
    .from('inboxes')
    .select('*')
    .eq('organization_id', agent.organization_id)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createInbox(data: {
  name: string
  channel?: string
  site_url?: string
  widget_color?: string
  welcome_message?: string
}) {
  const parsed = createInboxSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()
  const { error } = await supabase.from('inboxes').insert({
    organization_id: agent.organization_id,
    ...parsed.data,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/settings/inboxes')
}

export async function updateInbox(id: string, updates: {
  name?: string
  widget_color?: string
  welcome_message?: string
  is_active?: boolean
}) {
  const parsed = updateInboxSchema.safeParse({ id, updates })
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()
  const { error } = await supabase
    .from('inboxes')
    .update(parsed.data.updates)
    .eq('id', parsed.data.id)
    .eq('organization_id', agent.organization_id)
  if (error) throw new Error(error.message)
  revalidatePath('/settings/inboxes')
}

export async function getCannedResponses() {
  const { supabase, agent } = await getAgentContext()
  const { data, error } = await supabase
    .from('canned_responses')
    .select('*')
    .eq('organization_id', agent.organization_id)
    .order('short_code')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createCannedResponse(shortCode: string, content: string) {
  const parsed = createCannedResponseSchema.safeParse({ shortCode, content })
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()
  const { error } = await supabase.from('canned_responses').insert({
    organization_id: agent.organization_id,
    short_code: parsed.data.shortCode,
    content: parsed.data.content,
    created_by: agent.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/settings/canned-responses')
}

export async function deleteCannedResponse(id: string) {
  const parsed = deleteCannedResponseSchema.safeParse({ id })
  if (!parsed.success) {
    throw new Error(`Invalid ID: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()
  const { error } = await supabase
    .from('canned_responses')
    .delete()
    .eq('id', parsed.data.id)
    .eq('organization_id', agent.organization_id)
  if (error) throw new Error(error.message)
  revalidatePath('/settings/canned-responses')
}

export async function getLabels() {
  const { supabase, agent } = await getAgentContext()
  const { data, error } = await supabase
    .from('labels')
    .select('*')
    .eq('organization_id', agent.organization_id)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createLabel(title: string, color: string) {
  const parsed = createLabelSchema.safeParse({ title, color })
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()
  const { error } = await supabase.from('labels').insert({
    organization_id: agent.organization_id,
    title: parsed.data.title,
    color: parsed.data.color,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/inbox')
}

export async function getKbArticles() {
  const { supabase, agent } = await getAgentContext()
  const { data, error } = await supabase
    .from('kb_articles')
    .select('*, category:kb_categories(id, name, icon)')
    .eq('organization_id', agent.organization_id)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getKbCategories() {
  const { supabase, agent } = await getAgentContext()
  const { data, error } = await supabase
    .from('kb_categories')
    .select('*')
    .eq('organization_id', agent.organization_id)
    .order('position')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createKbArticle(data: {
  title: string
  content: string
  slug: string
  category_id?: string
  is_published?: boolean
}) {
  const parsed = createKbArticleSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()
  const { error } = await supabase.from('kb_articles').insert({
    organization_id: agent.organization_id,
    author_id: agent.id,
    ...parsed.data,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/knowledge-base')
}

export async function updateKbArticle(id: string, updates: {
  title?: string
  content?: string
  is_published?: boolean
  category_id?: string
}) {
  const parsed = updateKbArticleSchema.safeParse({ id, updates })
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()
  const { error } = await supabase
    .from('kb_articles')
    .update(parsed.data.updates)
    .eq('id', parsed.data.id)
    .eq('organization_id', agent.organization_id)
  if (error) throw new Error(error.message)
  revalidatePath('/knowledge-base')
}

export async function deleteKbArticle(id: string) {
  const parsed = deleteKbArticleSchema.safeParse({ id })
  if (!parsed.success) {
    throw new Error(`Invalid ID: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()
  const { error } = await supabase
    .from('kb_articles')
    .delete()
    .eq('id', parsed.data.id)
    .eq('organization_id', agent.organization_id)
  if (error) throw new Error(error.message)
  revalidatePath('/knowledge-base')
}

export async function getReportStats(days = 30) {
  const parsed = getReportStatsSchema.safeParse({ days })
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()
  const since = new Date(Date.now() - parsed.data.days * 24 * 60 * 60 * 1000).toISOString()
  const orgId = agent.organization_id

  const [conversations, resolved, frtData, agentsData] = await Promise.all([
    supabase.from('conversations').select('id, created_at, status')
      .eq('organization_id', orgId).gte('created_at', since),
    supabase.from('conversations').select('id')
      .eq('organization_id', orgId).eq('status', 'resolved').gte('resolved_at', since),
    supabase.from('conversations').select('first_reply_at, created_at')
      .eq('organization_id', orgId).not('first_reply_at', 'is', null).gte('created_at', since),
    supabase.from('agents').select('id, display_name, status, conversations(id, status)')
      .eq('organization_id', orgId),
  ])

  let avgFrt = 0
  if (frtData.data && frtData.data.length > 0) {
    const total = frtData.data.reduce((sum, c) => {
      return sum + (new Date(c.first_reply_at!).getTime() - new Date(c.created_at).getTime())
    }, 0)
    avgFrt = Math.round(total / frtData.data.length / 60000)
  }

  return {
    totalConversations: conversations.data?.length ?? 0,
    resolvedConversations: resolved.data?.length ?? 0,
    avgFirstResponseMinutes: avgFrt,
    agents: agentsData.data ?? [],
    conversationsByDay: groupByDay(conversations.data ?? [], parsed.data.days),
  }
}

function groupByDay(conversations: Array<{ created_at: string }>, days: number) {
  const result: Record<string, number> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    result[d.toISOString().split('T')[0]] = 0
  }
  for (const c of conversations) {
    const day = c.created_at.split('T')[0]
    if (day in result) result[day]++
  }
  return Object.entries(result).map(([date, count]) => ({ date, count }))
}
