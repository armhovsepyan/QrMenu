'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { useDashboardLang } from '@/lib/dashboard-lang'

type Menu = {
  id: string
  restaurant_name: string
  slug: string
  primary_color: string
  logo_url: string | null
}

export default function MenuEditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { t } = useDashboardLang()
  const [menu, setMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [form, setForm] = useState({ restaurant_name: '', slug: '', primary_color: '#4f8ef7' })
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('menus').select('*').eq('id', id).single()
      if (!data) { router.push('/dashboard'); return }
      setMenu(data)
      setForm({ restaurant_name: data.restaurant_name, slug: data.slug, primary_color: data.primary_color })
      setLoading(false)
    }
    load()
  }, [id, router])

  async function saveMenu(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('menus')
      .update({ restaurant_name: form.restaurant_name, slug: form.slug, primary_color: form.primary_color })
      .eq('id', id)

    if (error) {
      toast.error(t.dSaveError)
    } else {
      toast.success(t.dSaved)
      setMenu(prev => prev ? { ...prev, ...form } : null)
    }
    setSaving(false)
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const ext = file.name.split('.').pop()
    const path = `${user.id}/logos/${id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(path, file, { upsert: true })

    if (uploadError) { toast.error(t.dUploadError); setUploadingLogo(false); return }

    const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(path)

    await supabase.from('menus').update({ logo_url: publicUrl }).eq('id', id)
    setMenu(prev => prev ? { ...prev, logo_url: publicUrl } : null)
    toast.success(t.dLogoUploaded)
    setUploadingLogo(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-lp-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 anim-fade-in">
      <div className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-6 anim-fade-in-up delay-0">
          <Link href="/dashboard" className="text-sm text-lp-muted hover:text-lp-text transition-colors">
            ← {t.dCatalogs}
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-lp-text mt-2">{menu?.restaurant_name}</h1>
          <p className="text-sm text-lp-muted mt-0.5">{t.dCatalogSettings}</p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3 mb-8 anim-fade-in-up delay-1">
          {[
            { href: `/dashboard/menu/${id}/categories`, icon: '📂', label: t.dCategories },
            { href: `/dashboard/menu/${id}/items`, icon: '📦', label: t.dItems },
            { href: `/dashboard/menu/${id}/qr`, icon: '📱', label: t.dQrCode },
          ].map(link => (
            <Link key={link.href} href={link.href}
              className="bg-lp-surface border border-lp-border rounded-xl p-4 text-center hover:border-lp-accent/40 hover:bg-lp-accent/5 transition-all duration-150 group">
              <div className="text-2xl mb-1.5">{link.icon}</div>
              <div className="text-sm font-medium text-lp-muted group-hover:text-lp-accent transition-colors">{link.label}</div>
            </Link>
          ))}
        </div>

        {/* Logo upload */}
        <div className="bg-lp-surface border border-lp-border rounded-2xl p-6 mb-4 anim-fade-in-up delay-2">
          <h2 className="font-semibold text-lp-text mb-4">{t.dLogo}</h2>
          <div className="flex items-center gap-4">
            {menu?.logo_url ? (
              <img src={menu.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-lp-border" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-lp-surface2 border border-lp-border flex items-center justify-center text-2xl">📋</div>
            )}
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingLogo}
                className="text-sm bg-lp-surface2 border border-lp-border text-lp-text px-4 py-2 rounded-lg hover:border-lp-accent/50 hover:text-lp-accent transition-colors disabled:opacity-50"
              >
                {uploadingLogo ? t.dLoading : t.dUploadLogo}
              </button>
              <p className="text-xs text-lp-muted mt-1">{t.dLogoHint}</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
          </div>
        </div>

        {/* Settings form */}
        <div className="bg-lp-surface border border-lp-border rounded-2xl p-6 anim-fade-in-up delay-3" style={{ boxShadow: '0 8px 40px rgba(0,0,0,.3)' }}>
          <h2 className="font-semibold text-lp-text mb-5">{t.dBasicInfo}</h2>
          <form onSubmit={saveMenu} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-lp-muted uppercase tracking-widest mb-2">{t.dBizName}</label>
              <input
                type="text" value={form.restaurant_name}
                onChange={e => setForm({ ...form, restaurant_name: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-lp-surface2 border border-lp-border text-lp-text outline-none transition-all"
                onFocus={e => e.currentTarget.style.borderColor = '#4f8ef7'}
                onBlur={e => e.currentTarget.style.borderColor = '#1f2435'}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-lp-muted uppercase tracking-widest mb-2">{t.dUrlSlug}</label>
              <div className="flex items-center rounded-lg overflow-hidden border border-lp-border bg-lp-surface2 transition-all"
                onFocusCapture={e => e.currentTarget.style.borderColor = '#4f8ef7'}
                onBlurCapture={e => e.currentTarget.style.borderColor = '#1f2435'}>
                <span className="px-3 py-2.5 text-lp-muted text-sm border-r border-lp-border select-none whitespace-nowrap bg-lp-bg/50">
                  /menu/
                </span>
                <input
                  type="text" value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  required
                  className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent text-lp-text"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-lp-muted uppercase tracking-widest mb-2">{t.dAccentColor}</label>
              <div className="flex items-center gap-3">
                <input type="color" value={form.primary_color}
                  onChange={e => setForm({ ...form, primary_color: e.target.value })}
                  className="w-10 h-10 border border-lp-border rounded-lg cursor-pointer bg-lp-surface2" />
                <span className="text-sm text-lp-muted font-mono">{form.primary_color}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="lp-btn-primary px-5 py-2.5 text-sm disabled:opacity-50">
                {saving ? t.dSaving : t.dSave}
              </button>
              <Link href={`/menu/${menu?.slug}`} target="_blank"
                className="text-sm text-lp-muted border border-lp-border px-4 py-2.5 rounded-xl hover:border-lp-accent/50 hover:text-lp-accent transition-colors">
                {t.dOpenCatalog}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
