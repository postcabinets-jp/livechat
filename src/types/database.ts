export type AgentStatus = 'online' | 'idle' | 'busy' | 'offline'
export type AgentRole = 'owner' | 'admin' | 'agent'
export type InboxChannel = 'web_widget' | 'email' | 'whatsapp' | 'instagram'
export type ConversationStatus = 'pending' | 'open' | 'resolved' | 'snoozed'
export type MessageType = 'incoming' | 'outgoing' | 'activity'
export type MessageContentType = 'text' | 'html' | 'input_email' | 'input_select'
export type SenderType = 'contact' | 'agent' | 'bot'

export interface Organization {
  id: string
  name: string
  slug: string
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  timezone: string
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  organization_id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  role: AgentRole
  status: AgentStatus
  status_updated_at: string
  created_at: string
}

export interface Inbox {
  id: string
  organization_id: string
  name: string
  channel: InboxChannel
  site_url: string | null
  widget_color: string
  welcome_message: string | null
  is_active: boolean
  created_at: string
}

export interface Contact {
  id: string
  organization_id: string
  email: string | null
  name: string | null
  phone: string | null
  avatar_url: string | null
  attributes: Record<string, unknown>
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  organization_id: string
  inbox_id: string
  contact_id: string | null
  assigned_agent_id: string | null
  status: ConversationStatus
  subject: string | null
  meta: Record<string, unknown>
  first_reply_at: string | null
  resolved_at: string | null
  snoozed_until: string | null
  created_at: string
  updated_at: string
  // Joins
  contact?: Contact
  assigned_agent?: Agent
  inbox?: Inbox
  messages?: Message[]
  labels?: Label[]
}

export interface Message {
  id: string
  conversation_id: string
  organization_id: string
  sender_type: SenderType
  sender_agent_id: string | null
  message_type: MessageType
  content_type: MessageContentType
  content: string
  attachments: Array<{ url: string; name: string; size: number; mime: string }>
  is_private_note: boolean
  created_at: string
  // Joins
  sender_agent?: Agent
}

export interface CannedResponse {
  id: string
  organization_id: string
  short_code: string
  content: string
  created_by: string | null
  created_at: string
}

export interface KbCategory {
  id: string
  organization_id: string
  name: string
  icon: string | null
  position: number
  created_at: string
}

export interface KbArticle {
  id: string
  organization_id: string
  category_id: string | null
  title: string
  content: string
  slug: string
  is_published: boolean
  views: number
  author_id: string | null
  created_at: string
  updated_at: string
  // Joins
  category?: KbCategory
  author?: Agent
}

export interface Label {
  id: string
  organization_id: string
  title: string
  color: string
}

export interface AgentStatusLog {
  id: string
  agent_id: string
  status: AgentStatus
  started_at: string
  ended_at: string | null
}
