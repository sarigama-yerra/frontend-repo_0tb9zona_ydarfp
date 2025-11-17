import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const Tabs = ({ value, onChange }) => {
  const tabs = [
    { id: 'book', label: '📖 Livre 3D' },
    { id: 'scroll', label: '📱 Défilement' },
    { id: 'pdf', label: '📄 PDF Pro' },
  ]
  return (
    <div className="flex gap-2 p-1 bg-white/60 backdrop-blur rounded-xl border border-white/40">
      {tabs.map(t => (
        <button key={t.id}
          onClick={() => onChange(t.id)}
          className={`px-3 py-1.5 rounded-lg text-sm transition ${value === t.id ? 'bg-emerald-500 text-white' : 'text-gray-700 hover:bg-white'}`}
        >{t.label}</button>
      ))}
    </div>
  )
}

const ProgressBar = ({ value }) => (
  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div className="h-full bg-emerald-500" style={{ width: `${value}%` }} />
  </div>
)

const Book3D = ({ pages }) => {
  const [page, setPage] = useState(0)
  const next = () => setPage(p => Math.min(p + 1, pages.length - 1))
  const prev = () => setPage(p => Math.max(p - 1, 0))
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 perspective">
        <div className="relative w-full h-full">
          <AnimatePresence mode="popLayout">
            <motion.div key={page}
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-white rounded-xl shadow-xl p-6 overflow-auto"
            >
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">{pages[page]}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 pt-3">
        <button onClick={prev} className="px-3 py-1.5 rounded-lg bg-gray-100">Précédent</button>
        <div className="text-sm text-gray-600">Page {page + 1} / {pages.length}</div>
        <button onClick={next} className="px-3 py-1.5 rounded-lg bg-gray-100">Suivant</button>
      </div>
    </div>
  )
}

const ScrollModern = ({ content }) => (
  <div className="w-full h-full overflow-y-auto space-y-6 pr-2">
    {content.split('\n\n').map((b, i) => (
      <div key={i} className="bg-white rounded-xl shadow p-5 text-gray-800 whitespace-pre-wrap">{b}</div>
    ))}
  </div>
)

const PdfFixed = ({ pages }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2">
    {pages.map((p, i) => (
      <div key={i} className="bg-white rounded-xl shadow p-6 aspect-[3/4] overflow-auto whitespace-pre-wrap text-gray-800">
        {p}
      </div>
    ))}
  </div>
)

export default function EbookGenerator() {
  const [tab, setTab] = useState('book')
  const [chat, setChat] = useState([])
  const [stream, setStream] = useState('')
  const [progress, setProgress] = useState(0)
  const [title, setTitle] = useState('Mon Ebook IA')

  const pages = useMemo(() => {
    const txt = stream || 'Commencez le chat pour générer le contenu...'
    const chunks = txt.split('\n\n')
    const perPage = 3
    const pages = []
    for (let i = 0; i < chunks.length; i += perPage) {
      pages.push(chunks.slice(i, i + perPage).join('\n\n'))
    }
    return pages.length ? pages : ['Page vide']
  }, [stream])

  const base = import.meta.env.VITE_BACKEND_URL || ''

  const send = async (text) => {
    const history = [...chat, { role: 'user', content: text }]
    setChat(history)

    try {
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, mode: 'ebook' })
      })
      if (!res.ok || !res.body) throw new Error('API error')
      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      setStream('')

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setStream(prev => prev + chunk)
        const match = chunk.match(/\[progress:(\d+)\]/)
        if (match) setProgress(Number(match[1]))
      }

      // autosave
      await fetch(`${base}/api/ebook/save`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content: stream, style: tab, progress })
      })
    } catch (e) {
      // noop
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[80vh]">
      <div className="flex flex-col bg-white/50 backdrop-blur rounded-2xl border border-white/40 overflow-hidden">
        <div className="p-3 flex items-center justify-between">
          <div className="font-medium text-gray-700">Chat IA</div>
          <Tabs value={tab} onChange={setTab} />
        </div>
        <div className="flex-1 overflow-auto px-3 pb-3">
          <div className="text-sm text-gray-500 mb-2">Décrivez votre ebook, ex: domaine, audience, style.</div>
          <ChatBox onSend={send} />
        </div>
        <div className="p-3 border-t border-white/40">
          <ProgressBar value={progress} />
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur rounded-2xl border border-white/40 p-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3 gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border" />
          <div className="text-sm text-gray-600">Aperçu</div>
        </div>
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {tab === 'book' && (
              <motion.div key="book" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="h-full">
                <Book3D pages={pages} />
              </motion.div>
            )}
            {tab === 'scroll' && (
              <motion.div key="scroll" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="h-full">
                <ScrollModern content={stream} />
              </motion.div>
            )}
            {tab === 'pdf' && (
              <motion.div key="pdf" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="h-full">
                <PdfFixed pages={pages} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function ChatBox({ onSend }) {
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)

  const send = async () => {
    if (!input.trim() || pending) return
    setPending(true)
    const txt = input
    setInput('')
    await onSend(txt)
    setPending(false)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="bg-white rounded-xl border shadow p-2 flex items-end gap-2">
      <textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Décrivez l'ebook à générer..."
        className="flex-1 resize-none px-3 py-2 rounded-md outline-none" />
      <button onClick={send} className={`px-3 py-2 rounded-lg text-white ${pending ? 'bg-gray-400' : 'bg-emerald-500 hover:bg-emerald-600'}`}>Envoyer</button>
    </div>
  )
}
