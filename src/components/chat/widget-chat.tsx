'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Inbox {
  id: string
  name: string
  widget_color: string
  welcome_message: string | null
  organization_id: string
}

interface ChatMessage {
  id: string
  content: string
  sender_type: 'contact' | 'agent' | 'bot'
  created_at: string
}

export function WidgetChat({ inbox }: { inbox: Inbox }) {
  const [step, setStep] = useState<'email' | 'chat'>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [contactId, setContactId] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!conversationId) return
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const msg = payload.new as ChatMessage
        if (msg.sender_type !== 'contact') {
          setMessages((prev) => [...prev, msg])
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  async function handleStart(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      // Create contact
      const { data: contact } = await supabase
        .from('contacts')
        .insert({
          organization_id: inbox.organization_id,
          email: email || null,
          name: name || null,
          last_seen_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (!contact) throw new Error('Failed to create contact')
      setContactId(contact.id)

      // Create conversation
      const { data: conv } = await supabase
        .from('conversations')
        .insert({
          organization_id: inbox.organization_id,
          inbox_id: inbox.id,
          contact_id: contact.id,
          status: 'pending',
          meta: { page_url: typeof window !== 'undefined' ? window.location.href : '' },
        })
        .select()
        .single()

      if (!conv) throw new Error('Failed to create conversation')
      setConversationId(conv.id)

      // Add welcome message
      if (inbox.welcome_message) {
        setMessages([{
          id: 'welcome',
          content: inbox.welcome_message,
          sender_type: 'bot',
          created_at: new Date().toISOString(),
        }])
      }

      setStep('chat')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  async function handleSend() {
    if (!input.trim() || !conversationId) return
    setSending(true)
    const content = input.trim()
    setInput('')

    const optimistic: ChatMessage = {
      id: `opt-${Date.now()}`,
      content,
      sender_type: 'contact',
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        organization_id: inbox.organization_id,
        sender_type: 'contact',
        message_type: 'incoming',
        content_type: 'text',
        content,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  const widgetColor = inbox.widget_color || '#3B82F6'

  if (step === 'email') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff' }}>
        <div style={{ background: widgetColor, padding: '20px 16px', color: '#fff' }}>
          <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{inbox.name}</p>
          <p style={{ fontSize: 13, margin: '4px 0 0', opacity: 0.85 }}>
            {inbox.welcome_message || 'こんにちは！ご質問をどうぞ。'}
          </p>
        </div>
        <div style={{ flex: 1, padding: 16 }}>
          <form onSubmit={handleStart}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>名前（任意）</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田 太郎"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 4 }}>メールアドレス（任意）</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              style={{ width: '100%', padding: '10px', background: widgetColor, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              {sending ? '...' : 'チャットを開始'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff' }}>
      <div style={{ background: widgetColor, padding: '12px 16px', color: '#fff' }}>
        <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{inbox.name}</p>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender_type === 'contact' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '75%',
              padding: '8px 12px',
              borderRadius: msg.sender_type === 'contact' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.sender_type === 'contact' ? widgetColor : '#f3f4f6',
              color: msg.sender_type === 'contact' ? '#fff' : '#111',
              fontSize: 13,
              lineHeight: 1.5,
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ borderTop: '1px solid #e5e7eb', padding: 12, display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="メッセージを入力..."
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !input.trim()}
          style={{ padding: '8px 14px', background: widgetColor, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: !input.trim() ? 0.5 : 1 }}
        >
          送信
        </button>
      </div>
    </div>
  )
}
