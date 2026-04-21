'use client'

import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { useDashboardLang } from '@/lib/dashboard-lang'

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

type Props = {
  categories: Category[]
  item: Item | null
  defaultCategoryId?: string
  nextPosition: number
  onSaved: (item: Item) => void
  onCancel: () => void
}

export default function ItemForm({ categories, item, defaultCategoryId, nextPosition, onSaved, onCancel }: Props) {
  const { t } = useDashboardLang()
  const [form, setForm] = useState({
    category_id: item?.category_id || defaultCategoryId || categories[0]?.id || '',
    name_ru: item?.name_ru || '',
    name_hy: item?.name_hy || '',
    name_en: item?.name_en || '',
    description_ru: item?.description_ru || '',
    description_hy: item?.description_hy || '',
    description_en: item?.description_en || '',
    price: item?.price?.toString() || '0',
    currency: item?.currency || 'AMD',
    is_available: item?.is_available ?? true,
    image_url: item?.image_url || '',
  })
  const [saving, setSaving] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function generateDescriptions() {
    if (!form.name_ru && !form.name_hy && !form.name_en) {
      toast.error(t.dEnterNameHint)
      return
    }
    setGeneratingAI(true)
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name_ru: form.name_ru, name_hy: form.name_hy, name_en: form.name_en }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm(prev => ({
        ...prev,
        description_ru: data.description_ru || prev.description_ru,
        description_hy: data.description_hy || prev.description_hy,
        description_en: data.description_en || prev.description_en,
      }))
      toast.success(t.dDescGenerated)
    } catch (err) {
      toast.error(t.dGenerationError + ': ' + (err as Error).message)
    }
    setGeneratingAI(false)
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploadingImage(false); return }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', user.id)
    formData.append('itemId', item?.id || `new-${Date.now()}`)

    const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok) { toast.error(t.dUploadError); setUploadingImage(false); return }
    setForm(prev => ({ ...prev, image_url: data.url }))
    toast.success(t.dImageUploaded)
    setUploadingImage(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name_ru.trim()) { toast.error(t.dEnterNameRu); return }
    setSaving(true)
    const supabase = createClient()

    const payload = {
      category_id: form.category_id,
      name_ru: form.name_ru,
      name_hy: form.name_hy || null,
      name_en: form.name_en || null,
      description_ru: form.description_ru || null,
      description_hy: form.description_hy || null,
      description_en: form.description_en || null,
      price: parseFloat(form.price) || 0,
      currency: form.currency,
      is_available: form.is_available,
      image_url: form.image_url || null,
    }

    if (item) {
      const { data, error } = await supabase.from('items').update(payload).eq('id', item.id).select().single()
      if (error) { toast.error(t.dSaveError); setSaving(false); return }
      toast.success(t.dItemUpdated)
      onSaved(data)
    } else {
      const { data, error } = await supabase.from('items').insert({ ...payload, position: nextPosition }).select().single()
      if (error) { toast.error(t.dSaveError); setSaving(false); return }
      toast.success(t.dItemAdded)
      onSaved(data)
    }
    setSaving(false)
  }

  const formStr = form as unknown as Record<string, string>
  const inputCls = "w-full px-3 py-2 rounded-lg text-sm bg-lp-surface2 border border-lp-border text-lp-text placeholder-lp-muted outline-none transition-all"
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#4f8ef7' }
  const onBlur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#1f2435' }

  return (
    <div className="bg-lp-surface border border-lp-accent/30 rounded-2xl p-6" style={{ boxShadow: '0 8px 40px rgba(0,0,0,.3)' }}>
      <h2 className="font-semibold text-lp-text mb-5">
        {item ? t.dEditItem : t.dNewItem}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Category */}
        <div>
          <label className="block text-xs text-lp-muted mb-1.5 font-semibold uppercase tracking-widest">{t.dCategory}</label>
          <select value={form.category_id} onChange={e => update('category_id', e.target.value)}
            onFocus={onFocus} onBlur={onBlur} className={inputCls}>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name_ru}</option>)}
          </select>
        </div>

        {/* Names */}
        <div>
          <label className="block text-xs text-lp-muted mb-2 font-semibold uppercase tracking-widest">{t.dName}</label>
          <div className="space-y-2">
            {[
              { key: 'name_ru', label: 'RU *', placeholder: 'Название товара' },
              { key: 'name_hy', label: 'HY', placeholder: 'Ապրանքի անվանումը' },
              { key: 'name_en', label: 'EN', placeholder: 'Product name' },
            ].map(f => (
              <div key={f.key} className="flex items-center gap-2">
                <span className="text-xs font-semibold text-lp-muted w-8 flex-shrink-0">{f.label}</span>
                <input value={formStr[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.key === 'name_ru'}
                  onFocus={onFocus} onBlur={onBlur}
                  className={inputCls} />
              </div>
            ))}
          </div>
        </div>

        {/* Descriptions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-lp-muted font-semibold uppercase tracking-widest">{t.dDescription}</label>
            <button type="button" onClick={generateDescriptions} disabled={generatingAI}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-lp-accent2/30 text-lp-accent2 hover:bg-lp-accent2/10 transition-colors disabled:opacity-50">
              <span>✨</span>
              {generatingAI ? t.dGenerating : t.dAiDesc}
            </button>
          </div>
          <div className="space-y-2">
            {[
              { key: 'description_ru', label: 'RU', placeholder: 'Описание товара...' },
              { key: 'description_hy', label: 'HY', placeholder: 'Նկarагрутюн...' },
              { key: 'description_en', label: 'EN', placeholder: 'Product description...' },
            ].map(f => (
              <div key={f.key} className="flex items-start gap-2">
                <span className="text-xs font-semibold text-lp-muted w-8 flex-shrink-0 pt-2.5">{f.label}</span>
                <textarea value={formStr[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  rows={2}
                  onFocus={onFocus} onBlur={onBlur}
                  className="flex-1 px-3 py-2 rounded-lg text-sm bg-lp-surface2 border border-lp-border text-lp-text placeholder-lp-muted outline-none resize-none transition-all" />
              </div>
            ))}
          </div>
        </div>

        {/* Price & Currency */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-lp-muted mb-1.5 font-semibold uppercase tracking-widest">{t.dPrice}</label>
            <input type="number" min="0" step="0.01" value={form.price}
              onChange={e => update('price', e.target.value)}
              onFocus={onFocus} onBlur={onBlur} className={inputCls} />
          </div>
          <div className="w-28">
            <label className="block text-xs text-lp-muted mb-1.5 font-semibold uppercase tracking-widest">{t.dCurrency}</label>
            <select value={form.currency} onChange={e => update('currency', e.target.value)}
              onFocus={onFocus} onBlur={onBlur} className={inputCls}>
              <option value="AMD">AMD ֏</option>
              <option value="RUB">RUB ₽</option>
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
            </select>
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="block text-xs text-lp-muted mb-1.5 font-semibold uppercase tracking-widest">{t.dPhoto}</label>
          <div className="flex items-center gap-3">
            {form.image_url ? (
              <img src={form.image_url} alt="Item" className="w-16 h-16 rounded-lg object-cover border border-lp-border" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-lp-surface2 border border-lp-border flex items-center justify-center text-2xl">📷</div>
            )}
            <div>
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploadingImage}
                className="text-sm bg-lp-surface2 border border-lp-border text-lp-text px-3 py-2 rounded-lg hover:border-lp-accent/50 hover:text-lp-accent transition-colors disabled:opacity-50">
                {uploadingImage ? t.dUploading : form.image_url ? t.dChangePhoto : t.dUploadPhoto}
              </button>
              {form.image_url && (
                <button type="button" onClick={() => update('image_url', '')}
                  className="block mt-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                  {t.dRemovePhoto}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadImage} />
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={form.is_available}
              onChange={e => update('is_available', e.target.checked)} className="sr-only peer" />
            <div className="w-10 h-6 bg-lp-surface2 border border-lp-border rounded-full relative
              peer-checked:bg-lp-accent/20 peer-checked:border-lp-accent/50 transition-all
              after:content-[''] after:absolute after:top-[3px] after:left-[3px]
              after:bg-lp-muted after:rounded-full after:h-4 after:w-4 after:transition-all
              peer-checked:after:translate-x-4 peer-checked:after:bg-lp-accent" />
          </label>
          <span className="text-sm text-lp-text">{t.dAvailable}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={saving} className="lp-btn-primary px-5 py-2.5 text-sm disabled:opacity-50">
            {saving ? t.dSaving : item ? t.dUpdate : t.dCreate}
          </button>
          <button type="button" onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm text-lp-muted border border-lp-border hover:bg-white/[.04] hover:text-lp-text transition-colors">
            {t.dCancel}
          </button>
        </div>
      </form>
    </div>
  )
}
