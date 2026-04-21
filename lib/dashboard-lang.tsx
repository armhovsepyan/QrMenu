'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { T, type Lang } from './i18n'

const LANG_KEY = 'dashboard_lang'

type DashboardLangCtx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: typeof T[Lang]
}

const Ctx = createContext<DashboardLangCtx>({
  lang: 'ru',
  setLang: () => {},
  t: T['ru'],
})

export function DashboardLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru')

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null
    if (saved && (saved === 'en' || saved === 'ru' || saved === 'hy')) {
      setLangState(saved)
    }
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem(LANG_KEY, l)
  }

  return <Ctx.Provider value={{ lang, setLang, t: T[lang] }}>{children}</Ctx.Provider>
}

export function useDashboardLang() {
  return useContext(Ctx)
}
