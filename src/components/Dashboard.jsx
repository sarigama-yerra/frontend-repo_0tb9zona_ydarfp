import React, { useEffect, useMemo, useState } from 'react'
import { TrendingUp, Book, Users, DollarSign, Plus, ArrowRight } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="p-5 rounded-2xl bg-white/70 backdrop-blur border border-white/40 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm text-gray-500">{title}</div>
      <Icon className="w-5 h-5 text-emerald-600" />
    </div>
    <div className="text-2xl font-semibold text-gray-800">{value}</div>
    {trend && <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {trend}</div>}
  </div>
)

const RevenueChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="p-4 rounded-2xl bg-white/70 backdrop-blur border border-white/40 shadow-sm">
      <div className="text-sm text-gray-500 mb-3">Revenus - 30 jours</div>
      <div className="h-36 flex items-end gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 bg-gradient-to-t from-emerald-200 to-emerald-500 rounded-md" style={{ height: `${(d.value / max) * 100}%` }} />
        ))}
      </div>
    </div>
  )
}

const EbookTable = ({ items }) => (
  <div className="p-4 rounded-2xl bg-white/70 backdrop-blur border border-white/40 shadow-sm overflow-auto">
    <div className="text-sm text-gray-500 mb-3">Ebooks créés</div>
    <div className="min-w-[560px] grid grid-cols-6 text-sm text-gray-600">
      <div className="font-medium">Titre</div>
      <div>Style</div>
      <div>Progression</div>
      <div>Mises à jour</div>
      <div>Ventes</div>
      <div>Statut</div>
    </div>
    <div className="min-w-[560px] divide-y">
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-6 py-2 items-center text-sm">
          <div className="font-medium text-gray-800">{it.title}</div>
          <div>{it.style}</div>
          <div>
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${it.progress || 0}%` }} /></div>
          </div>
          <div className="text-gray-600">{new Date(it.updated_at || Date.now()).toLocaleDateString()}</div>
          <div className="text-gray-800">{Math.floor((it.progress || 0) / 10)}</div>
          <div className="text-emerald-700">{(it.progress || 0) >= 100 ? 'Publié' : 'Brouillon'}</div>
        </div>
      ))}
    </div>
  </div>
)

export default function Dashboard({ onCreate }) {
  const [items, setItems] = useState([])
  const base = import.meta.env.VITE_BACKEND_URL || ''

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${base}/api/ebook/list`)
        const json = await res.json()
        setItems(json.items || [])
      } catch {}
    }
    load()
  }, [])

  const rev = useMemo(() => Array.from({ length: 30 }, (_, i) => ({ day: i + 1, value: Math.round(Math.random() * 100) + 20 })), [])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Revenus" value="3 420€" trend="+12%" icon={DollarSign} />
        <StatCard title="Ventes" value="182" trend="+8%" icon={TrendingUp} />
        <StatCard title="Lecteurs" value="1 245" icon={Users} />
        <StatCard title="Ebooks" value={items.length} icon={Book} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><RevenueChart data={rev} /></div>
        <div className="p-4 rounded-2xl bg-white/70 backdrop-blur border border-white/40 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-800">Créer un nouvel ebook</div>
            <div className="text-sm text-gray-600">Lancez une nouvelle génération instantanément</div>
          </div>
          <button onClick={onCreate} className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl">
            <Plus className="w-4 h-4" /> Nouveau
          </button>
        </div>
      </div>

      <EbookTable items={items} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['Importer', 'Exporter', 'Dupliquer', 'Analyser'].map((t, i) => (
          <button key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/70 backdrop-blur border border-white/40 shadow-sm text-gray-700 hover:bg-white">
            <span>{t}</span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
          </button>
        ))}
      </div>
    </div>
  )
}
