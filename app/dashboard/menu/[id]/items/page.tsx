'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import ItemForm from '@/components/dashboard/ItemForm'
import ItemCard from '@/components/dashboard/ItemCard'
import { useDashboardLang } from '@/lib/dashboard-lang'
import { IconPlus } from '@/components/icons'

type Category = { id: string; name_ru: string }
type Item = {
  id: string
  category_id: string
  name_ru: string
  name_hy: string | null
  name_en: string | null
  description_ru: string | null
  description_hy: string | null
  description_en: string | null
  price: number
  currency: string
  image_url: string | null
  is_available: boolean
  position: number
}

export default function ItemsPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useDashboardLang()
  const [categories, setCategories] = useState<Category[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => { fetchData() }, [id])

  async function fetchData() {
    const supabase = createClient()
    const [catRes, itemsRes] = await Promise.all([
      supabase.from('categories').select('id, name_ru').eq('menu_id', id).order('position'),
      supabase.from('items').select('*').in(
        'category_id',
        (await supabase.from('categories').select('id').eq('menu_id', id)).data?.map(c => c.id) || []
      ).order('position'),
    ])
    setCategories(catRes.data || [])
    setItems(itemsRes.data || [])
    setLoading(false)
  }

  async function deleteItem(itemId: string) {
    if (!confirm(t.dDeleteItemConfirm)) return
    const supabase = createClient()
    await supabase.from('items').delete().eq('id', itemId)
    setItems(prev => prev.filter(i => i.id !== itemId))
    toast.success(t.dItemDeleted)
  }

  async function toggleAvailable(item: Item) {
    const supabase = createClient()
    await supabase.from('items').update({ is_available: !item.is_available }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i))
  }

  async function moveItem(itemId: string, direction: 'up' | 'down', catId: string) {
    const catItems = items.filter(i => i.category_id === catId)
    const idx = catItems.findIndex(i => i.id === itemId)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === catItems.length - 1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const supabase = createClient()
    await Promise.all([
      supabase.from('items').update({ position: swapIdx }).eq('id', catItems[swapIdx].id),
      supabase.from('items').update({ position: idx }).eq('id', catItems[idx].id),
    ])
    const newItems = [...items]
    const a = newItems.findIndex(i => i.id === catItems[idx].id)
    const b = newItems.findIndex(i => i.id === catItems[swapIdx].id)
    ;[newItems[a].position, newItems[b].position] = [newItems[b].position, newItems[a].position]
    ;[newItems[a], newItems[b]] = [newItems[b], newItems[a]]
    setItems(newItems)
  }

  function onSaved(item: Item) {
    if (editingItem) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i))
    } else {
      setItems(prev => [...prev, item])
    }
    setShowForm(false)
    setEditingItem(null)
  }

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(i => i.category_id === selectedCategory)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-lp-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="p-8 max-w-2xl mx-auto anim-fade-in">
        <Link href={`/dashboard/menu/${id}`} className="text-sm text-lp-muted hover:text-lp-text transition-colors">
          ← {t.dCatalogSettings}
        </Link>
        <div className="bg-lp-surface border border-lp-border rounded-2xl p-12 text-center mt-4 anim-pop-in delay-1">
          <div className="text-4xl mb-3">📂</div>
          <p className="text-lp-text font-medium mb-1">{t.dNeedCategories}</p>
          <p className="text-lp-muted text-sm mb-4">{t.dNeedCategoriesSub}</p>
          <Link href={`/dashboard/menu/${id}/categories`} className="lp-btn-primary text-sm px-4 py-2.5">
            {t.dGoToCategories}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 anim-fade-in">
      <div className="max-w-3xl mx-auto">

        <div className="mb-6 anim-fade-in-up delay-0">
          <Link href={`/dashboard/menu/${id}`} className="text-sm text-lp-muted hover:text-lp-text transition-colors">
            ← {t.dCatalogSettings}
          </Link>
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-lp-text">{t.dItems}</h1>
            <button
              onClick={() => { setEditingItem(null); setShowForm(true) }}
              className="lp-btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
            >
              <IconPlus />
              {t.dAddItem}
            </button>
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide anim-fade-in-up delay-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'text-white'
                : 'bg-lp-surface border border-lp-border text-lp-muted hover:text-lp-text hover:bg-white/[.04]'
            }`}
            style={selectedCategory === 'all' ? { background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)' } : {}}
          >
            {t.dAll} ({items.length})
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'text-white'
                  : 'bg-lp-surface border border-lp-border text-lp-muted hover:text-lp-text hover:bg-white/[.04]'
              }`}
              style={selectedCategory === cat.id ? { background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)' } : {}}>
              {cat.name_ru} ({items.filter(i => i.category_id === cat.id).length})
            </button>
          ))}
        </div>

        {/* Form */}
        {(showForm || editingItem) && (
          <div className="mb-6 anim-slide-down">
            <ItemForm
              categories={categories}
              item={editingItem}
              defaultCategoryId={selectedCategory !== 'all' ? selectedCategory : undefined}
              onSaved={onSaved}
              onCancel={() => { setShowForm(false); setEditingItem(null) }}
              nextPosition={editingItem ? editingItem.position : items.filter(i => i.category_id === (selectedCategory !== 'all' ? selectedCategory : categories[0].id)).length}
            />
          </div>
        )}

        {/* Items */}
        {filteredItems.length === 0 ? (
          <div className="bg-lp-surface border border-lp-border rounded-2xl p-12 text-center anim-pop-in delay-2">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-lp-muted text-sm">{t.dNoItems}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item, idx) => (
              <div key={item.id} className={`anim-fade-in-up delay-${Math.min(idx + 2, 8)}`}>
                <ItemCard
                  item={item}
                  isFirst={idx === 0}
                  isLast={idx === filteredItems.length - 1}
                  onEdit={() => { setEditingItem(item); setShowForm(false) }}
                  onDelete={() => deleteItem(item.id)}
                  onToggleAvailable={() => toggleAvailable(item)}
                  onMove={(dir) => moveItem(item.id, dir, item.category_id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
