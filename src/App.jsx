import React, { useState } from 'react'
import Spline from '@splinetool/react-spline'
import AIChat from './components/AIChat'
import EbookGenerator from './components/EbookGenerator'
import Dashboard from './components/Dashboard'

export default function App() {
  const [view, setView] = useState('dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-blue-200 to-amber-100 relative">
      <div className="absolute inset-0 opacity-80">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Studio d\'Ebook IA</h1>
            <p className="text-gray-700">Créez, discutez et publiez vos ebooks avec une IA</p>
          </div>
          <nav className="flex gap-2 bg-white/60 backdrop-blur rounded-xl p-1 border border-white/40">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'chat', label: 'Chat IA' },
              { id: 'generator', label: 'Générateur' },
            ].map(t => (
              <button key={t.id} onClick={() => setView(t.id)} className={`px-3 py-1.5 rounded-lg text-sm ${view === t.id ? 'bg-emerald-500 text-white' : 'text-gray-700 hover:bg-white'}`}>{t.label}</button>
            ))}
          </nav>
        </header>

        <main className="bg-white/60 backdrop-blur rounded-3xl border border-white/40 p-4 shadow-xl">
          {view === 'dashboard' && <Dashboard onCreate={() => setView('generator')} />}
          {view === 'chat' && (
            <div className="h-[70vh]">
              <AIChat />
            </div>
          )}
          {view === 'generator' && <EbookGenerator />}
        </main>
      </div>
    </div>
  )
}
