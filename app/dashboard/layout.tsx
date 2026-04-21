'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { DashboardLangProvider, useDashboardLang } from '@/lib/dashboard-lang'

function IconGrid() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}
function IconLogout() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 000-2H4V5h7a1 1 0 000-2H3zm10.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H7a1 1 0 110-2h7.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { lang, setLang, t } = useDashboardLang()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success(t.dLoggedOut)
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex bg-lp-bg text-lp-text">

      {/* Sidebar */}
      <aside className="w-60 flex flex-col min-h-screen fixed top-0 left-0 z-30 bg-lp-surface border-r border-lp-border">

        {/* Brand */}
        <div className="px-5 py-4 border-b border-lp-border">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-base lp-gradient-bg shadow-sm">▦</div>
            <div>
              <div className="font-extrabold text-sm leading-tight lp-gradient-text">QR Catalog</div>
              <div className="text-xs text-lp-muted leading-tight">Կատալոգ կառավարիչ</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <Link
            href="/dashboard"
            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
              pathname === '/dashboard'
                ? 'bg-lp-accent/10 text-lp-accent font-semibold'
                : 'text-lp-muted hover:bg-white/[.04] hover:text-lp-text'
            }`}
          >
            {pathname === '/dashboard' && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full lp-gradient-bg" />
            )}
            <IconGrid />
            <span>{t.dCatalogs}</span>
          </Link>
        </nav>

        {/* Language switcher */}
        <div className="px-3 pb-3">
          <div className="flex gap-1 bg-lp-surface2 border border-lp-border rounded-xl p-1">
            {(['hy', 'ru', 'en'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  lang === l
                    ? 'lp-gradient-bg text-white shadow-sm'
                    : 'text-lp-muted hover:text-lp-text'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-lp-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-lp-muted hover:bg-red-500/[.08] hover:text-red-400 transition-all duration-150"
          >
            <IconLogout />
            <span>{t.dLogout}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 min-h-screen">
        {children}
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLangProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardLangProvider>
  )
}
