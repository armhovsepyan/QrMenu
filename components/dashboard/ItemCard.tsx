'use client'

import { useDashboardLang } from '@/lib/dashboard-lang'
import { IconChevronUp, IconChevronDown } from '@/components/icons'

type Item = {
  id: string
  name_ru: string
  name_hy: string | null
  name_en: string | null
  price: number
  currency: string
  image_url: string | null
  is_available: boolean
  position: number
}

type Props = {
  item: Item
  isFirst: boolean
  isLast: boolean
  onEdit: () => void
  onDelete: () => void
  onToggleAvailable: () => void
  onMove: (dir: 'up' | 'down') => void
}

export default function ItemCard({ item, isFirst, isLast, onEdit, onDelete, onToggleAvailable, onMove }: Props) {
  const { t } = useDashboardLang()
  return (
    <div className={`bg-lp-surface border border-lp-border rounded-xl p-4 flex items-center gap-4 transition-opacity ${!item.is_available ? 'opacity-50' : ''}`}>
      {item.image_url ? (
        <img src={item.image_url} alt={item.name_ru} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-lp-border" />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-lp-surface2 border border-lp-border flex items-center justify-center text-2xl flex-shrink-0">📦</div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-lp-text truncate">{item.name_ru}</p>
          {!item.is_available && (
            <span className="text-xs bg-lp-surface2 text-lp-muted px-2 py-0.5 rounded-full flex-shrink-0">{t.dUnavailable}</span>
          )}
        </div>
        {(item.name_hy || item.name_en) && (
          <p className="text-xs text-lp-muted mt-0.5 truncate">
            {[item.name_hy, item.name_en].filter(Boolean).join(' · ')}
          </p>
        )}
        <p className="text-sm font-semibold text-lp-accent mt-1">{item.price} {item.currency}</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button onClick={() => onMove('up')} disabled={isFirst}
          className="p-1.5 text-lp-muted hover:text-lp-text disabled:opacity-25 transition-colors rounded-lg hover:bg-white/[.04]">
          <IconChevronUp />
        </button>
        <button onClick={() => onMove('down')} disabled={isLast}
          className="p-1.5 text-lp-muted hover:text-lp-text disabled:opacity-25 transition-colors rounded-lg hover:bg-white/[.04]">
          <IconChevronDown />
        </button>
        <button onClick={onToggleAvailable}
          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ml-1 ${
            item.is_available
              ? 'border-green-500/30 text-green-400 hover:bg-green-500/[.08]'
              : 'border-lp-border text-lp-muted hover:bg-white/[.04]'
          }`}>
          {item.is_available ? '✓' : '○'}
        </button>
        <button onClick={onEdit}
          className="text-xs border border-lp-border px-3 py-1.5 rounded-lg text-lp-muted hover:text-lp-text hover:bg-white/[.04] transition-colors">
          {t.dEdit}
        </button>
        <button onClick={onDelete}
          className="text-xs border border-red-500/20 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/[.08] transition-colors">
          {t.dDelete}
        </button>
      </div>
    </div>
  )
}
