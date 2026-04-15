'use client'

import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'

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
      toast.error('Նշեք ապրանքի անվանումը գոնե մեկ լեզվով')
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
      toast.success('Նկարագրությունները ստեղծված են!')
    } catch (err) {
      toast.error('Գեներացիայի սխալ: ' + (err as Error).message)
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
    if (!res.ok) { toast.error('Բեռնելու սխալ'); setUploadingImage(false); return }
    setForm(prev => ({ ...prev, image_url: data.url }))
    toast.success('Լուսանկարը բեռնված է!')
    setUploadingImage(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name_ru.trim()) { toast.error('Նշեք անվանումը (RU)'); return }
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
      if (error) { toast.error('Պահպանելու սխալ'); setSaving(false); return }
      toast.success('Ապրանքը թարմացված է')
      onSaved(data)
    } else {
      const { data, error } = await supabase.from('items').insert({ ...payload, position: nextPosition }).select().single()
      if (error) { toast.error('Ստեղծելու սխալ'); setSaving(false); return }
      toast.success('Ապրանքը ավելացված է')
      onSaved(data)
    }
    setSaving(false)
  }

  const inputClass = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500 transition-shadow"
  const textareaClass = "flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:focus:ring-orange-500 resize-none transition-shadow"

  return (
    <div className="bg-white dark:bg-gray-800 border border-orange-100 dark:border-orange-500/30 rounded-2xl p-6 shadow-sm">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-5">
        {item ? 'Խմբագրել Ապրանքը' : 'Նոր Ապրանք'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Category */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium uppercase tracking-wide">կատեգորիա</label>
          <select
            value={form.category_id}
            onChange={e => update('category_id', e.target.value)}
            className={inputClass}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name_ru}</option>
            ))}
          </select>
        </div>

        {/* Names */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">Անվանում</label>
          <div className="space-y-2">
            {[
              { key: 'name_ru', label: 'RU *', placeholder: 'Название товара' },
              { key: 'name_hy', label: 'HY', placeholder: 'Ապրանքի անվանում' },
              { key: 'name_en', label: 'EN', placeholder: 'Product name' },
            ].map(f => (
              <div key={f.key} className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-8 flex-shrink-0">{f.label}</span>
                <input
                  value={(form as unknown as Record<string, string>)[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.key === 'name_ru'}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Descriptions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Նկարագրություն</label>
            <button
              type="button"
              onClick={generateDescriptions}
              disabled={generatingAI}
              className="flex items-center gap-1.5 text-xs bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors disabled:opacity-50"
            >
              <span>✨</span>
              {generatingAI ? 'Խմբագրում...' : 'Խմբագրել AI-ով'}
            </button>
          </div>
          <div className="space-y-2">
            {[
              { key: 'description_ru', label: 'RU', placeholder: 'Описание товара...' },
              { key: 'description_hy', label: 'HY', placeholder: 'Ապրանքի նկարագրություն...' },
              { key: 'description_en', label: 'EN', placeholder: 'Product description...' },
            ].map(f => (
              <div key={f.key} className="flex items-start gap-2">
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-8 flex-shrink-0 pt-2.5">{f.label}</span>
                <textarea
                  value={(form as unknown as Record<string, string>)[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  rows={2}
                  className={textareaClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Price & Currency */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Գին</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={e => update('price', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="w-28">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Արժութ</label>
            <select
              value={form.currency}
              onChange={e => update('currency', e.target.value)}
              className={inputClass}
            >
              <option value="AMD">AMD ֏</option>
              <option value="RUB">RUB ₽</option>
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
            </select>
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Լուսանկար</label>
          <div className="flex items-center gap-3">
            {form.image_url ? (
              <img src={form.image_url} alt="Item" className="w-16 h-16 rounded-lg object-cover border border-gray-100 dark:border-gray-700" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl">📷</div>
            )}
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingImage}
                className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {uploadingImage ? 'Բեռնում...' : form.image_url ? 'Փոխել լուսանկարը' : 'Բեռնել լուսանկար'}
              </button>
              {form.image_url && (
                <button
                  type="button"
                  onClick={() => update('image_url', '')}
                  className="block mt-1 text-xs text-red-400 hover:text-red-500 transition-colors"
                >
                  Հեռացնել լուսանկարը
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadImage} />
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={e => update('is_available', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
          <span className="text-sm text-gray-700 dark:text-gray-300">Հասանելի է պատվիրելու համար</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? 'Պահպանում...' : item ? 'Թարմացնել' : 'Ավելացնել'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Չեղարկել
          </button>
        </div>
      </form>
    </div>
  )
}