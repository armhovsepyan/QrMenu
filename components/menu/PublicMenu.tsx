'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import LanguageSwitcher, { type Language } from './LanguageSwitcher'
import MenuItem from './MenuItem'

type Category = {
  id: string
  name_ru: string
  name_hy: string | null
  name_en: string | null
  position: number
  items: Item[]
}

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

type Menu = {
  id: string
  restaurant_name: string
  logo_url: string | null
  primary_color: string
}

type Props = {
  menu: Menu
  categories: Category[]
  isDemo?: boolean
}

const EMPTY_LABEL: Record<Language, string> = {
  hy: 'Ուտեստ չկա',
  ru: 'Нет блюд',
  en: 'No items yet',
}

export default function PublicMenu({ menu, categories, isDemo }: Props) {
  const [lang, setLang] = useState<Language>('hy')
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '')
  const [itemsKey, setItemsKey] = useState(0) // forces re-animation on tab/lang change
  const tabsRef = useRef<HTMLDivElement>(null)
  const activeBtnRef = useRef<HTMLButtonElement>(null)

  const activeItems = categories.find(c => c.id === activeCategory)?.items || []

  // Re-trigger item animations on category or lang change
  function switchCategory(id: string) {
    setActiveCategory(id)
    setItemsKey(k => k + 1)
    // Scroll active tab into view
    setTimeout(() => activeBtnRef.current?.scrollIntoView({ inline: 'center', behavior: 'smooth' }), 50)
  }

  function switchLang(l: Language) {
    setLang(l)
    setItemsKey(k => k + 1)
  }

  return (
    <div className="min-h-screen bg-lp-bg text-lp-text" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-20">
        <div className="absolute inset-0 border-b border-lp-border" style={{ background: 'rgba(10,12,16,.9)', backdropFilter: 'blur(16px)' }} />

        <div className="relative px-4 pt-5 pb-3">
          {/* Top row */}
          <div className="flex items-center justify-between mb-4 anim-slide-down">
            <div className="flex items-center gap-3">
              {menu.logo_url ? (
                <img src={menu.logo_url} alt="Logo" className="w-9 h-9 rounded-xl object-cover ring-2 ring-lp-border" />
              ) : (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold text-white lp-gradient-bg">
                  {menu.restaurant_name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-sm font-bold text-lp-text leading-tight">{menu.restaurant_name}</h1>
                <p className="text-[10px] text-lp-muted mt-0.5">Թվային մենյու</p>
              </div>
            </div>
            <LanguageSwitcher current={lang} onChange={switchLang} />
          </div>

          {/* Category tabs */}
          {categories.length > 0 && (
            <div ref={tabsRef} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
              {categories.map((cat) => {
                const catName = (cat[`name_${lang}` as keyof Category] as string) || cat.name_ru
                const isActive = activeCategory === cat.id
                return (
                  <button key={cat.id} ref={isActive ? activeBtnRef : undefined}
                    onClick={() => switchCategory(cat.id)}
                    style={isActive ? { background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)', boxShadow: '0 4px 16px rgba(79,142,247,.35)' } : {}}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-300
                      ${isActive ? 'text-white scale-105' : 'bg-lp-surface2 text-lp-muted hover:text-lp-text border border-lp-border'}`}>
                    {catName}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </header>

      {/* ── ITEMS GRID ── */}
      <main key={itemsKey} className="px-4 pt-5 pb-24">
        {activeItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 anim-fade-in">
            <div className="text-5xl mb-4 opacity-30">🍽️</div>
            <p className="text-lp-muted text-sm">{EMPTY_LABEL[lang]}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[...activeItems].sort((a, b) => a.position - b.position).map((item, idx) => (
              <MenuItem key={item.id} item={item} lang={lang} primaryColor={menu.primary_color} index={idx} />
            ))}
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <div className="absolute inset-0 border-t border-lp-border" style={{ background: 'rgba(10,12,16,.92)', backdropFilter: 'blur(12px)' }} />
        <div className="relative flex items-center justify-between px-4 py-2.5">
          {isDemo ? (
            <Link href="/" className="flex items-center gap-1.5 text-[11px] font-semibold lp-gradient-text hover:opacity-80 transition-opacity">
              ← Back to main page
            </Link>
          ) : <span />}
          <p className="text-[11px] text-lp-muted">
            Powered by <span className="font-semibold lp-gradient-text">QR Catalog</span>
          </p>
        </div>
      </div>
    </div>
  )
}
