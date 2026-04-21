'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import QRGenerator from '@/components/dashboard/QRGenerator'

type Menu = { id: string; restaurant_name: string; slug: string }

export default function QRPage() {
  const { id } = useParams<{ id: string }>()
  const [menu, setMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(true)
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('menus').select('id, restaurant_name, slug').eq('id', id).single()
      setMenu(data)
      setLoading(false)
    }
    load()
    setBaseUrl(window.location.origin)
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-7 h-7 border-2 border-lp-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!menu) return null

  const publicUrl = `${baseUrl}/menu/${menu.slug}`

  return (
    <div className="p-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <Link href={`/dashboard/menu/${id}`} className="text-sm text-lp-muted hover:text-lp-text transition-colors">
            ← Կատալոգի կարգավորումներ
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-lp-text mt-2">QR-կոդ</h1>
        </div>

        <div className="bg-lp-surface border border-lp-border rounded-2xl p-8 text-center" style={{ boxShadow: '0 8px 40px rgba(0,0,0,.4)' }}>
          <QRGenerator url={publicUrl} restaurantName={menu.restaurant_name} />

          {/* Base URL override */}
          <div className="mt-6 p-4 rounded-xl text-left border" style={{ background: 'rgba(79,142,247,.06)', borderColor: 'rgba(79,142,247,.2)' }}>
            <p className="text-xs font-semibold text-lp-accent uppercase tracking-widest mb-2">
              🌐 Հանրային հասցե
            </p>
            <p className="text-xs text-lp-muted mb-3">
              Փոխեք host-ը, եթե QR-կոդը պետք է բացվի այլ սարքերի վրա (օր.՝ ձեր IP Wi-Fi ցանցում):
            </p>
            <input
              type="text"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value.replace(/\/$/, ''))}
              className="w-full px-3 py-2 text-sm rounded-lg bg-lp-surface2 border border-lp-border text-lp-text outline-none transition-all"
              placeholder="http://192.168.1.100:3000"
              onFocus={e => e.currentTarget.style.borderColor = '#4f8ef7'}
              onBlur={e => e.currentTarget.style.borderColor = '#1f2435'}
            />
          </div>

          <div className="mt-4 p-3 bg-lp-surface2 rounded-xl">
            <p className="text-xs text-lp-muted mb-1">Մենյուի հղումը</p>
            <a href={publicUrl} target="_blank" rel="noreferrer"
              className="text-sm text-lp-accent hover:text-lp-accent2 font-medium break-all transition-colors">
              {publicUrl}
            </a>
          </div>

          <div className="mt-6 text-left rounded-xl p-4 border" style={{ background: 'rgba(79,142,247,.04)', borderColor: 'rgba(79,142,247,.15)' }}>
            <p className="text-sm font-medium text-lp-text mb-2">📋 Տեղադրման հրահանգ</p>
            <ul className="text-sm text-lp-muted space-y-1">
              <li>1. Ներբեռնեք QR-կոդը PNG ձևաչափով</li>
              <li>2. Տպեք և տեղադրեք սեղաններին</li>
              <li>3. Հյուրերը սկանավորում են հեռախոսի տեսախցիկով</li>
              <li>4. Մենյուն բացվում է անմիջապես — առանց հավելվածի</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
