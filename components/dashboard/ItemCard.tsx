'use client'

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
  return (
    <div className={`bg-white dark:bg-gray-800 border rounded-xl p-4 flex items-center gap-4 shadow-sm card-lift transition-opacity ${!item.is_available ? 'opacity-60' : ''} border-gray-100 dark:border-gray-700`}>
      {item.image_url ? (
        <img src={item.image_url} alt={item.name_ru} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-gray-100 dark:border-gray-700" />
      ) : (
        <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl flex-shrink-0">📦</div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900 dark:text-white truncate">{item.name_ru}</p>
          {!item.is_available && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">Հասանելի չէ</span>
          )}
        </div>
        {(item.name_hy || item.name_en) && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
            {[item.name_hy, item.name_en].filter(Boolean).join(' · ')}
          </p>
        )}
        <p className="text-sm font-semibold text-orange-500 dark:text-orange-400 mt-1">{item.price} {item.currency}</p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onMove('up')}
          disabled={isFirst}
          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-25 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
        </button>
        <button
          onClick={() => onMove('down')}
          disabled={isLast}
          className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-25 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
        <button
          onClick={onToggleAvailable}
          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ml-1 ${
            item.is_available
              ? 'border-green-200 dark:border-green-500/40 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10'
              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {item.is_available ? '✓' : '○'}
        </button>
        <button
          onClick={onEdit}
          className="text-xs border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        >
          Խմբագրել
        </button>
        <button
          onClick={onDelete}
          className="text-xs border border-red-100 dark:border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-400 transition-colors"
        >
          Ջնջել
        </button>
      </div>
    </div>
  )
}