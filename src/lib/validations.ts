import { z } from 'zod'

// ─── Shared primitives ───

export const uuidSchema = z.string().uuid()

export const emailSchema = z.string().email().max(254)

export const nameSchema = z.string().min(1).max(200).trim()

export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'Invalid hex color')

// ─── Enums (mirrors types/database.ts) ───

export const conversationStatusSchema = z.enum(['pending', 'open', 'resolved', 'snoozed'])

export const agentStatusSchema = z.enum(['online', 'idle', 'busy', 'offline'])

export const agentRoleSchema = z.enum(['owner', 'admin', 'agent'])

export const inboxChannelSchema = z.enum(['web_widget', 'email', 'whatsapp', 'instagram'])

// ─── Auth ───

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  org_name: z.string().min(1, 'Organization name is required').max(100).trim(),
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// ─── Conversations ───

export const getConversationsSchema = z.object({
  status: conversationStatusSchema.optional(),
})

export const getConversationSchema = z.object({
  id: uuidSchema,
})

export const updateConversationStatusSchema = z.object({
  id: uuidSchema,
  status: conversationStatusSchema,
})

export const assignConversationSchema = z.object({
  conversationId: uuidSchema,
  agentId: uuidSchema.nullable(),
})

export const sendMessageSchema = z.object({
  conversationId: uuidSchema,
  content: z.string().min(1, 'Message content is required').max(10000),
  isPrivateNote: z.boolean().optional().default(false),
})

// ─── Contacts ───

export const getContactsSchema = z.object({
  search: z.string().max(200).optional(),
})

export const getContactSchema = z.object({
  id: uuidSchema,
})

export const updateContactSchema = z.object({
  id: uuidSchema,
  updates: z.object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
    phone: z.string().max(30).optional(),
    attributes: z.record(z.string(), z.unknown()).optional(),
  }),
})

// ─── Agents ───

export const updateAgentStatusInputSchema = z.object({
  status: agentStatusSchema,
})

export const inviteAgentSchema = z.object({
  email: emailSchema,
  role: agentRoleSchema.optional().default('agent'),
})

export const removeAgentSchema = z.object({
  agentId: uuidSchema,
})

export const updateAgentRoleSchema = z.object({
  agentId: uuidSchema,
  role: agentRoleSchema,
})

// ─── Settings / Organization ───

export const updateOrganizationSchema = z.object({
  updates: z.object({
    name: z.string().min(1).max(100).trim().optional(),
    timezone: z.string().max(50).optional(),
  }).refine(
    (data) => data.name !== undefined || data.timezone !== undefined,
    { message: 'At least one field must be provided' },
  ),
})

// ─── Inboxes ───

export const createInboxSchema = z.object({
  name: z.string().min(1, 'Inbox name is required').max(100).trim(),
  channel: inboxChannelSchema.optional(),
  site_url: z.string().url().max(500).optional(),
  widget_color: hexColorSchema.optional(),
  welcome_message: z.string().max(500).optional(),
})

export const updateInboxSchema = z.object({
  id: uuidSchema,
  updates: z.object({
    name: z.string().min(1).max(100).trim().optional(),
    widget_color: hexColorSchema.optional(),
    welcome_message: z.string().max(500).optional(),
    is_active: z.boolean().optional(),
  }),
})

// ─── Canned Responses ───

export const createCannedResponseSchema = z.object({
  shortCode: z.string().min(1, 'Short code is required').max(50).trim(),
  content: z.string().min(1, 'Content is required').max(5000),
})

export const deleteCannedResponseSchema = z.object({
  id: uuidSchema,
})

// ─── Labels ───

export const createLabelSchema = z.object({
  title: z.string().min(1, 'Title is required').max(50).trim(),
  color: hexColorSchema,
})

// ─── Knowledge Base ───

export const createKbArticleSchema = z.object({
  title: z.string().min(1, 'Article title is required').max(300).trim(),
  content: z.string().min(1, 'Article content is required').max(100000),
  slug: z.string().min(1).max(300).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'),
  category_id: uuidSchema.optional(),
  is_published: z.boolean().optional(),
})

export const updateKbArticleSchema = z.object({
  id: uuidSchema,
  updates: z.object({
    title: z.string().min(1).max(300).trim().optional(),
    content: z.string().min(1).max(100000).optional(),
    is_published: z.boolean().optional(),
    category_id: uuidSchema.optional(),
  }),
})

export const deleteKbArticleSchema = z.object({
  id: uuidSchema,
})

// ─── Reports ───

export const getReportStatsSchema = z.object({
  days: z.number().int().min(1).max(365).optional().default(30),
})

