'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'

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
  const [menu, setMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [form, setForm] = useState({ restaurant_name: '', slug: '', primary_color: '#F97316' })
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
      toast.error('Պահպանելու սխալ: ' + error.message)
    } else {
      toast.success('Կատալոգը պահպանված է!')
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

    if (uploadError) { toast.error('Բեռնելու սխալ'); setUploadingLogo(false); return }

    const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(path)

    await supabase.from('menus').update({ logo_url: publicUrl }).eq('id', id)
    setMenu(prev => prev ? { ...prev, logo_url: publicUrl } : null)
    toast.success('Լոգոն բեռնված է!')
    setUploadingLogo(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 anim-fade-in">
      <div className="max-w-2xl mx-auto">

        {/* Breadcrumb */}
        <div className="mb-6 anim-fade-in-up delay-0">
          <Link href="/dashboard" className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            ← Կատալոգներ
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{menu?.restaurant_name}</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Կատալոգի կարգավորումներ</p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3 mb-8 anim-fade-in-up delay-1">
          {[
            { href: `/dashboard/menu/${id}/categories`, icon: '📂', label: 'Կատեգորիաներ' },
            { href: `/dashboard/menu/${id}/items`, icon: '📦', label: 'Ապրանքներ' },
            { href: `/dashboard/menu/${id}/qr`, icon: '📱', label: 'QR-կոդ' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 text-center hover:border-orange-200 dark:hover:border-orange-500/40 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-all duration-150 group card-lift"
            >
              <div className="text-2xl mb-1.5">{link.icon}</div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{link.label}</div>
            </Link>
          ))}
        </div>

        {/* Logo upload */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 mb-4 shadow-sm anim-fade-in-up delay-2">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Լոգո</h2>
          <div className="flex items-center gap-4">
            {menu?.logo_url ? (
              <img src={menu.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-100 dark:border-gray-700" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl">📋</div>
            )}
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingLogo}
                className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {uploadingLogo ? 'Բեռնում...' : 'Բեռնել լոգո'}
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG մինչև 5 ՄԲ</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
          </div>
        </div>

        {/* Settings form */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm anim-fade-in-up delay-3">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Հիմնական տվյալներ</h2>
          <form onSubmit={saveMenu} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">Բիզնեսի անվանումը</label>
              <input
                type="text"
                value={form.restaurant_name}
                onChange={e => setForm({ ...form, restaurant_name: e.target.value })}
                required
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">URL-հասցե (slug)</label>
              <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-400 dark:focus-within:ring-orange-500 bg-white dark:bg-gray-700">
                <span className="px-3 py-2.5 bg-gray-50 dark:bg-gray-600 text-gray-400 dark:text-gray-400 text-sm border-r border-gray-200 dark:border-gray-600 select-none whitespace-nowrap">qrmenu.app/menu/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  required
                  className="flex-1 px-3 py-2.5 text-sm focus:outline-none bg-transparent text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">Ընդգծման գույն</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={e => setForm({ ...form, primary_color: e.target.value })}
                  className="w-10 h-10 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{form.primary_color}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors shadow-sm"
              >
                {saving ? 'Պահպանում...' : 'Պահպանել'}
              </button>
              <Link
                href={`/menu/${menu?.slug}`}
                target="_blank"
                className="text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Բացել կատալոգը →
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}