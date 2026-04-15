'use client'

export type Language = 'ru' | 'hy' | 'en'

type Props = {
  current: Language
  onChange: (lang: Language) => void
}

const LANGS: { code: Language; label: string }[] = [
  { code: 'hy', label: 'ՀԱՅ' },
  { code: 'ru', label: 'РУС' },
  { code: 'en', label: 'ENG' },
]

export default function LanguageSwitcher({ current, onChange }: Props) {
  return (
    <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 gap-0.5 border border-white/10">
      {LANGS.map(lang => (
        <button
          key={lang.code}
          onClick={() => onChange(lang.code)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all duration-200 ${
            current === lang.code
              ? 'bg-white text-zinc-900 shadow-lg scale-105'
              : 'text-white/60 hover:text-white/90'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
