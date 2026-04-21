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

  return (
    <div className="bg-lp-surface border border-lp-accent/30 rounded-2xl p-6" style={{ boxShadow: '0 8px 40px rgba(0,0,0,.3)' }}>
      <h2 className="font-semibold text-lp-text mb-4">
        {category ? 'Խմբագրել կատեգորիան' : 'Նոր կատեգորիա'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          {[
            { key: 'name_ru', label: 'Անվանում (RU) *', placeholder: 'Горячие блюда' },
            { key: 'name_hy', label: 'Անվանում (HY)', placeholder: 'Տաք ուտեստներ' },
            { key: 'name_en', label: 'Անվանում (EN)', placeholder: 'Hot dishes' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-lp-muted mb-1">{label}</label>
              <input
                value={form[key as keyof typeof form]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                required={key === 'name_ru'}
                className="w-full px-3 py-2 rounded-lg text-sm bg-lp-surface2 border border-lp-border text-lp-text placeholder-lp-muted outline-none transition-all"
                onFocus={e => e.currentTarget.style.borderColor = '#4f8ef7'}
                onBlur={e => e.currentTarget.style.borderColor = '#1f2435'}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={saving} className="lp-btn-primary px-4 py-2 text-sm disabled:opacity-50">
            {saving ? 'Պահպանում...' : category ? 'Թարմացնել' : 'Ավելացնել'}
          </button>
          <button type="button" onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-lp-muted border border-lp-border hover:bg-white/[.04] hover:text-lp-text transition-colors">
            Չեղարկել
          </button>
        </div>
      </form>
    </div>
  )
}
