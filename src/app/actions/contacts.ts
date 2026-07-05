'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  getContactsSchema,
  getContactSchema,
  updateContactSchema,
} from '@/lib/validations'

async function getAgentContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: agent } = await supabase
    .from('agents')
    .select('id, organization_id')
    .eq('user_id', user.id)
    .single()
  if (!agent) throw new Error('Agent not found')
  return { supabase, agent }
}

export async function getContacts(search?: string) {
  const parsed = getContactsSchema.safeParse({ search })
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()

  let query = supabase
    .from('contacts')
    .select('*, conversations(id, status)')
    .eq('organization_id', agent.organization_id)
    .order('updated_at', { ascending: false })
    .limit(100)

  if (parsed.data.search) {
    query = query.or(`name.ilike.%${parsed.data.search}%,email.ilike.%${parsed.data.search}%`)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getContact(id: string) {
  const parsed = getContactSchema.safeParse({ id })
  if (!parsed.success) {
    throw new Error(`Invalid contact ID: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()

  const { data, error } = await supabase
    .from('contacts')
    .select('*, conversations(*, inbox:inboxes(name), messages(id, content, created_at))')
    .eq('id', parsed.data.id)
    .eq('organization_id', agent.organization_id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateContact(id: string, updates: {
  name?: string
  email?: string
  phone?: string
  attributes?: Record<string, unknown>
}) {
  const parsed = updateContactSchema.safeParse({ id, updates })
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.issues.map(i => i.message).join(', ')}`)
  }

  const { supabase, agent } = await getAgentContext()

  const { error } = await supabase
    .from('contacts')
    .update(parsed.data.updates)
    .eq('id', parsed.data.id)
    .eq('organization_id', agent.organization_id)

  if (error) throw new Error(error.message)
  revalidatePath('/contacts')
  revalidatePath(`/contacts/${parsed.data.id}`)
}
