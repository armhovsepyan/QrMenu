'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import CategoryForm from '@/components/dashboard/CategoryForm'
import { useDashboardLang } from '@/lib/dashboard-lang'

type Category = {
  id: string
  menu_id: string
  name_ru: string
  name_hy: string | null
  name_en: string | null
  position: number
}

export default function CategoriesPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useDashboardLang()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)

  useEffect(() => { fetchCategories() }, [id])

  async function fetchCategories() {
    const supabase = createClient()
    const { data } = await supabase.from('categories').select('*').eq('menu_id', id).order('position')
    setCategories(data || [])
    setLoading(false)
  }

  async function deleteCategory(catId: string) {
    if (!confirm(t.dDeleteCategoryConfirm)) return
    const supabase = createClient()
    const { error } = await supabase.from('categories').delete().eq('id', catId)
    if (error) { toast.error(t.dDeleteError); return }
    setCategories(prev => prev.filter(c => c.id !== catId))
    toast.success(t.dCategoryDeleted)
  }

  async function moveCategory(catId: string, direction: 'up' | 'down') {
    const idx = categories.findIndex(c => c.id === catId)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === categories.length - 1) return

    const newCats = [...categories]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newCats[idx], newCats[swapIdx]] = [newCats[swapIdx], newCats[idx]]

    const supabase = createClient()
    await Promise.all([
      supabase.from('categories').update({ position: swapIdx }).eq('id', newCats[swapIdx].id),
      supabase.from('categories').update({ position: idx }).eq('id', newCats[idx].id),
    ])
    setCategories(newCats.map((c, i) => ({ ...c, position: i })))
  }

  function onSaved(cat: Category) {
    if (editingCat) {
      setCategories(prev => prev.map(c => c.id === cat.id ? cat : c))
    } else {
      setCategories(prev => [...prev, cat])
    }
    setShowForm(false)
    setEditingCat(null)
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

        <div className="mb-6 anim-fade-in-up delay-0">
          <Link href={`/dashboard/menu/${id}`} className="text-sm text-lp-muted hover:text-lp-text transition-colors">
            ← {t.dCatalogSettings}
          </Link>
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-lp-text">{t.dCategories}</h1>
            <button
              onClick={() => { setEditingCat(null); setShowForm(true) }}
              className="lp-btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {t.dAddCategory}
            </button>
          </div>
        </div>

        {(showForm || editingCat) && (
          <div className="mb-5 anim-slide-down">
            <CategoryForm
              menuId={id}
              category={editingCat}
              onSaved={onSaved}
              onCancel={() => { setShowForm(false); setEditingCat(null) }}
              nextPosition={categories.length}
            />
          </div>
        )}

        {categories.length === 0 ? (
          <div className="bg-lp-surface border border-lp-border rounded-2xl p-12 text-center anim-pop-in delay-2">
            <div className="text-4xl mb-3">📂</div>
            <p className="text-lp-text font-medium mb-1">{t.dNoCategories}</p>
            <p className="text-lp-muted text-sm">{t.dNoCategoriesSub}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((cat, idx) => (
              <div key={cat.id}
                className={`bg-lp-surface border border-lp-border rounded-xl p-4 flex items-center justify-between anim-fade-in-up delay-${Math.min(idx + 2, 8)}`}>
                <div>
                  <p className="font-medium text-lp-text">{cat.name_ru}</p>
                  {(cat.name_hy || cat.name_en) && (
                    <p className="text-xs text-lp-muted mt-0.5">
                      {[cat.name_hy, cat.name_en].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveCategory(cat.id, 'up')} disabled={idx === 0}
                    className="p-1.5 text-lp-muted hover:text-lp-text disabled:opacity-25 transition-colors rounded-lg hover:bg-white/[.04]">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                  </button>
                  <button onClick={() => moveCategory(cat.id, 'down')} disabled={idx === categories.length - 1}
                    className="p-1.5 text-lp-muted hover:text-lp-text disabled:opacity-25 transition-colors rounded-lg hover:bg-white/[.04]">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                  <button onClick={() => { setEditingCat(cat); setShowForm(false) }}
                    className="text-xs border border-lp-border px-3 py-1.5 rounded-lg text-lp-muted hover:text-lp-text hover:bg-white/[.04] ml-1 transition-colors">
                    {t.dEdit}
                  </button>
                  <button onClick={() => deleteCategory(cat.id)}
                    className="text-xs border border-red-500/20 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/[.08] transition-colors">
                    {t.dDelete}
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
