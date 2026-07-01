'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { AgentStatus, AgentRole } from '@/types/database'

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

export async function getAgents() {
  const { supabase, agent } = await getAgentContext()

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('organization_id', agent.organization_id)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getCurrentAgent() {
  const { supabase, agent } = await getAgentContext()

  const { data, error } = await supabase
    .from('agents')
    .select('*, organizations(*)')
    .eq('id', agent.id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateAgentStatus(status: AgentStatus) {
  const { supabase, agent } = await getAgentContext()

  // Close previous log entry
  await supabase
    .from('agent_status_log')
    .update({ ended_at: new Date().toISOString() })
    .eq('agent_id', agent.id)
    .is('ended_at', null)

  // Update agent status
  const { error } = await supabase
    .from('agents')
    .update({ status, status_updated_at: new Date().toISOString() })
    .eq('id', agent.id)

  if (error) throw new Error(error.message)

  // Create new log entry
  await supabase.from('agent_status_log').insert({
    agent_id: agent.id,
    status,
    started_at: new Date().toISOString(),
  })

  revalidatePath('/dashboard')
  revalidatePath('/settings/agents')
}

export async function inviteAgent(email: string, role: AgentRole = 'agent') {
  const { supabase, agent } = await getAgentContext()

  if (!['owner', 'admin'].includes(agent.role)) {
    throw new Error('Permission denied')
  }

  // In production: send invite email via Resend
  // For now: create a placeholder (invite flow via Supabase Auth)
  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      organization_id: agent.organization_id,
      role,
    },
  })

  if (error) throw new Error(error.message)
  revalidatePath('/settings/agents')
}

export async function removeAgent(agentId: string) {
  const { supabase, agent } = await getAgentContext()

  if (!['owner', 'admin'].includes(agent.role)) {
    throw new Error('Permission denied')
  }

  const { error } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentId)
    .eq('organization_id', agent.organization_id)
    .neq('id', agent.id) // can't delete yourself

  if (error) throw new Error(error.message)
  revalidatePath('/settings/agents')
}

export async function updateAgentRole(agentId: string, role: AgentRole) {
  const { supabase, agent } = await getAgentContext()

  if (agent.role !== 'owner') {
    throw new Error('Only owners can change roles')
  }

  const { error } = await supabase
    .from('agents')
    .update({ role })
    .eq('id', agentId)
    .eq('organization_id', agent.organization_id)

  if (error) throw new Error(error.message)
  revalidatePath('/settings/agents')
}
