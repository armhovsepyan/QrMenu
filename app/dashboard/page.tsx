'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'

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
    .replace(/[^a-z0-9\u0400-\u04FF\u0530-\u058F]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') +
    '-' + Math.random().toString(36).slice(2, 7)
}

function IconPlus() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  )
}
function IconExternalLink() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
    </svg>
  )
}
function IconQr() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
      <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM15 13a1 1 0 10-2 0v3a1 1 0 102 0v-3zM11 19a1 1 0 100-2h-1a1 1 0 100 2h1z" />
    </svg>
  )
}
function IconEdit() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  )
}
function IconTrash() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#F97316')

  useEffect(() => {
    fetchMenus()
  }, [])

  async function fetchMenus() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

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
    if (!confirm('Ջնջե՞լ կատալոգը: Այս գործողությունը հնարավոր չէ հետ կանչել:')) return
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
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-gray-400 dark:text-gray-500">Բեռնում...</div>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Իմ կատալոգները</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Ռեստորան, սրճարան, խանութ կամ ցանկացած բիզնես
            </p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 shadow-sm hover:shadow-md"
          >
            <IconPlus />
            <span>Ստեղծել կատալոգ</span>
          </button>
        </div>

        {/* Stats bar */}
        {menus.length > 0 && (
          <div className="flex items-center gap-6 mb-6 px-1 anim-fade-in-up delay-1">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">{menus.length}</span> կատալոգ
            </div>
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 mb-6 shadow-sm anim-slide-down">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 dark:text-white">Նոր կատալոգ</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <form onSubmit={createMenu} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">Բիզնեսի անվանումը</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="«Արաքս» սրճարան, SuperMart խանութ..."
                  required
                  autoFocus
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1.5">Ընդգծման գույն</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    className="w-10 h-10 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{newColor}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors shadow-sm"
                >
                  {creating ? 'Ստեղծում...' : 'Ստեղծել'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Չեղարկել
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empty state */}
        {menus.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-16 text-center anim-pop-in delay-2">
            <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5">
              📋
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Կատալոգ չկա</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              Ստեղծեք թվային կատալոգ ձեր ռեստորանի, սրճարանի, խանութի կամ ցանկացած բիզնեսի համար
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              Ստեղծել առաջին կատալոգը
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {menus.map((menu, i) => (
              <div
                key={menu.id}
                className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 flex items-center justify-between shadow-sm card-lift anim-fade-in-up delay-${Math.min(i + 2, 8)}`}
              >
                <div className="flex items-center gap-4">
                  {/* Color avatar */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm flex-shrink-0"
                    style={{ backgroundColor: menu.primary_color }}
                  >
                    {menu.restaurant_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{menu.restaurant_name}</h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">/{menu.slug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/menu/${menu.slug}`}
                    target="_blank"
                    className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <IconExternalLink />
                    <span>Դիտել</span>
                  </Link>
                  <Link
                    href={`/dashboard/menu/${menu.id}/qr`}
                    className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <IconQr />
                    <span>QR</span>
                  </Link>
                  <Link
                    href={`/dashboard/menu/${menu.id}`}
                    className="flex items-center gap-1.5 text-xs bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors font-medium"
                  >
                    <IconEdit />
                    <span>Խմբագրել</span>
                  </Link>
                  <button
                    onClick={() => deleteMenu(menu.id)}
                    className="flex items-center gap-1.5 text-xs text-red-400 dark:text-red-400 border border-red-100 dark:border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <IconTrash />
                    <span>Ջնջել</span>
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