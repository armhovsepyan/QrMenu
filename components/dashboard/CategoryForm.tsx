'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'

type Category = {
  id: string
  menu_id: string
  name_ru: string
  name_hy: string | null
  name_en: string | null
  position: number
}

type Props = {
  menuId: string
  category: Category | null
  nextPosition: number
  onSaved: (cat: Category) => void
  onCancel: () => void
}

export default function CategoryForm({ menuId, category, nextPosition, onSaved, onCancel }: Props) {
  const [form, setForm] = useState({
    name_ru: category?.name_ru || '',
    name_hy: category?.name_hy || '',
    name_en: category?.name_en || '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name_ru.trim()) { toast.error('Նշեք անվանումը'); return }
    setSaving(true)
    const supabase = createClient()

    if (category) {
      const { data, error } = await supabase
        .from('categories')
        .update({ name_ru: form.name_ru, name_hy: form.name_hy || null, name_en: form.name_en || null })
        .eq('id', category.id)
        .select()
        .single()
      if (error) { toast.error('Պահպանելու սխալ'); setSaving(false); return }
      toast.success('Կատեգորիան թարմացված է')
      onSaved(data)
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert({ menu_id: menuId, name_ru: form.name_ru, name_hy: form.name_hy || null, name_en: form.name_en || null, position: nextPosition })
        .select()
        .single()
      if (error) { toast.error('Ստեղծելու սխալ'); setSaving(false); return }
      toast.success('Կատեգորիան ավելացված է')
      onSaved(data)
    }
    setSaving(false)
  }

  const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500 transition-shadow"

  return (
    <div className="bg-white dark:bg-gray-800 border border-orange-100 dark:border-orange-500/30 rounded-2xl p-6 shadow-sm">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
        {category ? 'Խմբագրել կատեգորիան' : 'Նոր կատեգորիա'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Անվանում (RU) *</label>
            <input
              value={form.name_ru}
              onChange={e => setForm({ ...form, name_ru: e.target.value })}
              placeholder="Горячие блюда"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Անվանում (HY)</label>
            <input
              value={form.name_hy}
              onChange={e => setForm({ ...form, name_hy: e.target.value })}
              placeholder="Տաք ուտեստներ"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Անվանում (EN)</label>
            <input
              value={form.name_en}
              onChange={e => setForm({ ...form, name_en: e.target.value })}
              placeholder="Hot dishes"
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {saving ? 'Պահպանում...' : category ? 'Թարմացնել' : 'Ավելացնել'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Չեղարկել
          </button>
        </div>
      </form>
    </div>
  )
}