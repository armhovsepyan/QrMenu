'use client'

import type { Language } from './LanguageSwitcher'

type Item = {
  id: string
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
}

type Props = {
  item: Item
  lang: Language
  primaryColor: string
  index: number
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  AMD: '֏',
  RUB: '₽',
  USD: '$',
  EUR: '€',
}

const UNAVAILABLE: Record<Language, string> = {
  hy: 'Հասանելի չէ',
  ru: 'Недоступно',
  en: 'Unavailable',
}

export default function MenuItem({ item, lang, primaryColor, index }: Props) {
  const name = item[`name_${lang}` as keyof Item] as string || item.name_ru
  const description = item[`description_${lang}` as keyof Item] as string | null || item.description_ru
  const delayClass = `delay-${Math.min(index, 8)}`

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden transition-all duration-300 anim-fade-in-up ${delayClass}
        ${item.is_available
          ? 'hover:-translate-y-1 hover:shadow-2xl cursor-default'
          : 'opacity-40'
        }`}
      style={{ background: '#111318', border: '1px solid #1f2435', ...(item.is_available ? {} : {}) }}
      onMouseEnter={e => { if (item.is_available) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(79,142,247,.35)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1f2435' }}
    >
      {/* Image */}
      {item.image_url && (
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={item.image_url}
            alt={name || ''}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-lp-surface/80 via-transparent to-transparent" />
          {!item.is_available && (
            <div className="absolute inset-0 bg-lp-bg/70 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-lp-surface2/90 text-lp-muted text-xs font-semibold px-3 py-1.5 rounded-full border border-lp-border">
                {UNAVAILABLE[lang]}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lp-text text-sm leading-snug">{name}</h3>
            {description && (
              <p className="text-xs text-lp-muted mt-1.5 leading-relaxed line-clamp-2">{description}</p>
            )}
          </div>
          {!item.image_url && !item.is_available && (
            <span className="bg-lp-surface2 text-lp-muted text-xs px-2 py-0.5 rounded-full flex-shrink-0 border border-lp-border">
              {UNAVAILABLE[lang]}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-lp-border">
          <span
            className="font-bold text-base tracking-tight"
            style={{ color: primaryColor }}
          >
            {item.price > 0
              ? `${item.price.toLocaleString()} ${CURRENCY_SYMBOLS[item.currency] || item.currency}`
              : '—'}
          </span>
          {/* Decorative dot */}
          <span
            className="w-1.5 h-1.5 rounded-full opacity-60"
            style={{ backgroundColor: primaryColor }}
          />
        </div>
      </div>
    </div>
  )
}
