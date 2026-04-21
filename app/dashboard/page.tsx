'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { useDashboardLang } from '@/lib/dashboard-lang'

type Menu = {
  id: string
  restaurant_name: string
  slug: string
  primary_color: string
  logo_url: string | null
  created_at: string
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9Ѐ-ӿ԰-֏]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') +
    '-' + Math.random().toString(36).slice(2, 7)
}

export default function DashboardPage() {
  const router = useRouter()
  const { t } = useDashboardLang()
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#4f8ef7')

  useEffect(() => { fetchMenus() }, [])

  async function fetchMenus() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { await supabase.auth.signOut(); router.push('/auth/login'); return }

    const { data } = await supabase
      .from('menus')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setMenus(data || [])
    setLoading(false)
  }

  async function createMenu(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const slug = generateSlug(newName)
    const { data, error } = await supabase
      .from('menus')
      .insert({ user_id: user.id, restaurant_name: newName, slug, primary_color: newColor })
      .select()
      .single()

    if (error) {
      toast.error('Կատալոգ ստեղծելու սխալ')
    } else {
      toast.success('Կատալոգը ստեղծված է!')
      setMenus([data, ...menus])
      setShowForm(false)
      setNewName('')
      router.push(`/dashboard/menu/${data.id}`)
    }
    setCreating(false)
  }

  async function deleteMenu(id: string) {
    if (!confirm(t.dDeleteCatalogConfirm)) return
    const supabase = createClient()
    const { error } = await supabase.from('menus').delete().eq('id', id)
    if (error) { toast.error('Ջնջելու սխալ'); return }
    setMenus(menus.filter(m => m.id !== id))
    toast.success('Կատալոգը ջնջված է')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#4f8ef7', borderTopColor: 'transparent' }} />
          <div className="text-sm" style={{ color: 'var(--lp-muted, #6b7a99)' }}>{t.dLoading}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 anim-fade-in">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 anim-fade-in-up delay-0">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--lp-text, #e8ecf4)' }}>{t.dMyCatalogs}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--lp-muted, #6b7a99)' }}>{t.dMyCatalogsSub}</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="lp-btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>{t.dCreateCatalog}</span>
          </button>
        </div>

        {/* Stats */}
        {menus.length > 0 && (
          <div className="flex items-center gap-6 mb-6 px-1 anim-fade-in-up delay-1">
            <div className="text-sm" style={{ color: 'var(--lp-muted, #6b7a99)' }}>
              <span className="font-semibold" style={{ color: 'var(--lp-text, #e8ecf4)' }}>{menus.length}</span> {t.dCatalogs.toLowerCase()}
            </div>
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="rounded-2xl p-6 mb-6 border anim-slide-down"
            style={{ background: 'var(--lp-surface, #111420)', borderColor: 'var(--lp-border, #1f2435)', boxShadow: '0 8px 40px rgba(0,0,0,.4)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold" style={{ color: 'var(--lp-text, #e8ecf4)' }}>{t.dNewCatalog}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--lp-muted, #6b7a99)' }}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <form onSubmit={createMenu} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--lp-muted, #6b7a99)' }}>{t.dBizName}</label>
                <input
                  type="text" value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder={t.dBizPlaceholder}
                  required autoFocus
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{ background: 'var(--lp-surface2, #161926)', border: '1px solid var(--lp-border, #1f2435)', color: 'var(--lp-text, #e8ecf4)' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#4f8ef7'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--lp-border, #1f2435)'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--lp-muted, #6b7a99)' }}>{t.dAccentColor}</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border"
                    style={{ borderColor: 'var(--lp-border, #1f2435)', background: 'var(--lp-surface2, #161926)' }} />
                  <span className="text-sm font-mono" style={{ color: 'var(--lp-muted, #6b7a99)' }}>{newColor}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={creating} className="lp-btn-primary px-5 py-2.5 text-sm disabled:opacity-50">
                  {creating ? t.dCreating : t.dCreate}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl text-sm transition-colors"
                  style={{ color: 'var(--lp-muted, #6b7a99)', border: '1px solid var(--lp-border, #1f2435)' }}>
                  {t.dCancel}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empty state */}
        {menus.length === 0 ? (
          <div className="rounded-2xl p-16 text-center border anim-pop-in delay-2"
            style={{ background: 'var(--lp-surface, #111420)', borderColor: 'var(--lp-border, #1f2435)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5 lp-gradient-bg">📋</div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--lp-text, #e8ecf4)' }}>{t.dNoCatalogs}</h2>
            <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--lp-muted, #6b7a99)' }}>{t.dNoCatalogsSub}</p>
            <button onClick={() => setShowForm(true)} className="lp-btn-primary px-6 py-2.5 text-sm">
              {t.dCreateFirst}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {menus.map((menu, i) => (
              <div key={menu.id}
                className={`rounded-2xl p-5 flex items-center justify-between border anim-fade-in-up delay-${Math.min(i + 2, 8)}`}
                style={{ background: 'var(--lp-surface, #111420)', borderColor: 'var(--lp-border, #1f2435)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm flex-shrink-0"
                    style={{ backgroundColor: menu.primary_color }}>
                    {menu.restaurant_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--lp-text, #e8ecf4)' }}>{menu.restaurant_name}</h3>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--lp-muted, #6b7a99)' }}>/{menu.slug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link href={`/menu/${menu.slug}`} target="_blank"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors"
                    style={{ color: 'var(--lp-muted, #6b7a99)', borderColor: 'var(--lp-border, #1f2435)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = 'var(--lp-text, #e8ecf4)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--lp-muted, #6b7a99)' }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    <span>{t.dView}</span>
                  </Link>
                  <Link href={`/dashboard/menu/${menu.id}/qr`}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors"
                    style={{ color: 'var(--lp-muted, #6b7a99)', borderColor: 'var(--lp-border, #1f2435)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = 'var(--lp-text, #e8ecf4)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--lp-muted, #6b7a99)' }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
                      <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM15 13a1 1 0 10-2 0v3a1 1 0 102 0v-3zM11 19a1 1 0 100-2h-1a1 1 0 100 2h1z" />
                    </svg>
                    <span>QR</span>
                  </Link>
                  <Link href={`/dashboard/menu/${menu.id}`}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium lp-gradient-text"
                    style={{ background: 'rgba(79,142,247,.1)', border: '1px solid rgba(79,142,247,.2)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,142,247,.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,142,247,.1)' }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>{t.dEdit}</span>
                  </Link>
                  <button onClick={() => deleteMenu(menu.id)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors"
                    style={{ color: '#f87171', borderColor: 'rgba(239,68,68,.2)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '' }}>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{t.dDelete}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
