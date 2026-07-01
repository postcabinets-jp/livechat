'use client'

import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { sendMessage, updateConversationStatus, assignConversation } from '@/app/actions/conversations'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { Conversation, Message } from '@/types/database'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  open: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  snoozed: 'bg-gray-100 text-gray-600',
}

const statusLabels: Record<string, string> = {
  pending: '未対応',
  open: '対応中',
  resolved: '解決済',
  snoozed: 'スヌーズ',
}

function MessageBubble({ message }: { message: Message & { sender_agent?: { display_name: string } } }) {
  const isOutgoing = message.message_type === 'outgoing'
  const isActivity = message.message_type === 'activity'
  const isPrivate = message.is_private_note

  if (isActivity) {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex gap-2.5 ${isOutgoing ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs text-gray-600">
          {isOutgoing
            ? (message.sender_agent?.display_name || 'A').charAt(0).toUpperCase()
            : 'C'}
        </span>
      </div>
      <div className={`max-w-[70%] ${isPrivate ? 'opacity-80' : ''}`}>
        {isPrivate && (
          <p className="text-xs text-yellow-600 mb-1 font-medium">内部メモ</p>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isPrivate
              ? 'bg-yellow-50 border border-yellow-200 text-gray-700'
              : isOutgoing
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {message.content}
        </div>
        <p className={`text-xs mt-1 text-gray-400 ${isOutgoing ? 'text-right' : ''}`}>
          {new Date(message.created_at).toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}

export function ConversationView({ conversation }: { conversation: Conversation }) {
  const [sending, setSending] = useState(false)
  const [content, setContent] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.messages])

  async function handleSend() {
    if (!content.trim()) return
    setSending(true)
    try {
      await sendMessage(conversation.id, content.trim(), isPrivate)
      setContent('')
    } catch (e) {
      toast.error('送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  async function handleStatusChange(status: string) {
    try {
      await updateConversationStatus(conversation.id, status as 'pending' | 'open' | 'resolved' | 'snoozed')
      toast.success('ステータスを更新しました')
    } catch {
      toast.error('更新に失敗しました')
    }
  }

  const contact = conversation.contact
  const messages = (conversation.messages ?? []) as Array<Message & { sender_agent?: { display_name: string } }>

  return (
    <div className="h-full flex">
      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-900 truncate">
                {contact?.name || contact?.email || '匿名'}
              </h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[conversation.status]}`}>
                {statusLabels[conversation.status]}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate">
              {conversation.subject || conversation.inbox?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {conversation.status !== 'resolved' && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => handleStatusChange('resolved')}
              >
                解決済みにする
              </Button>
            )}
            {conversation.status === 'resolved' && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => handleStatusChange('open')}
              >
                再開する
              </Button>
            )}
            {conversation.status === 'pending' && (
              <Button
                size="sm"
                className="text-xs h-7 bg-blue-600 hover:bg-blue-700"
                onClick={() => handleStatusChange('open')}
              >
                対応開始
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Compose */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setIsPrivate(false)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                !isPrivate ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              返信
            </button>
            <button
              onClick={() => setIsPrivate(true)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                isPrivate ? 'bg-yellow-100 text-yellow-700' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              内部メモ
            </button>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isPrivate ? '内部メモを入力（顧客には表示されません）' : 'メッセージを入力...'}
            className={`resize-none text-sm min-h-[80px] ${
              isPrivate ? 'border-yellow-200 bg-yellow-50' : ''
            }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSend()
              }
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">⌘+Enter で送信</p>
            <Button
              onClick={handleSend}
              disabled={sending || !content.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
              size="sm"
            >
              {sending ? '送信中...' : '送信'}
            </Button>
          </div>
        </div>
      </div>

      {/* Right sidebar: contact info */}
      <div className="w-72 border-l border-gray-200 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">コンタクト情報</h3>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {(contact?.name || contact?.email || '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{contact?.name || '名前なし'}</p>
              <p className="text-xs text-gray-400">{contact?.email || 'メール未登録'}</p>
            </div>
          </div>
          {contact?.phone && (
            <p className="text-xs text-gray-500 mt-2">{contact.phone}</p>
          )}
        </div>

        {contact?.attributes && Object.keys(contact.attributes).length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">属性</h3>
            <div className="space-y-1">
              {Object.entries(contact.attributes as Record<string, string>).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{key}</span>
                  <span className="text-xs text-gray-700 font-medium">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">会話情報</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">インボックス</span>
              <span className="text-xs text-gray-700">{conversation.inbox?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">作成日</span>
              <span className="text-xs text-gray-700">
                {new Date(conversation.created_at).toLocaleDateString('ja-JP')}
              </span>
            </div>
            {conversation.first_reply_at && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">初回応答</span>
                <span className="text-xs text-gray-700">
                  {Math.round(
                    (new Date(conversation.first_reply_at).getTime() -
                      new Date(conversation.created_at).getTime()) /
                      60000
                  )}分
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
