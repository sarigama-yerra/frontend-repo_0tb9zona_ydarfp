import React, { useEffect, useRef, useState } from 'react'

const MessageBubble = ({ role, content }) => {
  const isUser = role === 'user'
  return (
    <div className={`w-full flex mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow transition-colors whitespace-pre-wrap ${
        isUser ? 'bg-emerald-500 text-white rounded-br-sm' : 'bg-white/70 backdrop-blur border border-white/40 text-gray-800 rounded-bl-sm'
      }`}>
        {content}
      </div>
    </div>
  )
}

export default function AIChat({ onSend, placeholder = 'Écrire un message...', className = '' }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour! Je suis votre assistant IA. Comment puis-je vous aider aujourd\'hui ?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Prepare request
    const history = [...messages, userMsg]
    const base = import.meta.env.VITE_BACKEND_URL || ''

    try {
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history })
      })

      if (!res.ok || !res.body) {
        throw new Error('Erreur API')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')

      let assistantMsg = { role: 'assistant', content: '' }
      setMessages(prev => [...prev, assistantMsg])

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        assistantMsg = { ...assistantMsg, content: assistantMsg.content + chunk }
        setMessages(prev => prev.map((m, i) => (i === prev.length - 1 ? assistantMsg : m)))
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur est survenue." }])
    } finally {
      setLoading(false)
    }

    if (onSend) onSend()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div ref={containerRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {messages.map((m, idx) => (
          <MessageBubble key={idx} role={m.role} content={m.content} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:120ms]" />
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:240ms]" />
            <span>Assistant est en train d\'écrire...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-3 border-t border-white/30 bg-white/60 backdrop-blur">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={sendMessage}
            className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-xl transition"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  )
}
