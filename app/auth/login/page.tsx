'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { T, type Lang, LANG_KEY, DEFAULT_LANG } from '@/lib/i18n'
import DarkPageShell from '@/components/DarkPageShell'
import { IconEye, IconEyeOff } from '@/components/icons'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPass] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [lang, setLang]             = useState<Lang>(DEFAULT_LANG)

  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null
    if (saved && saved in T) setLang(saved)
  }, [])

  function switchLang(l: Lang) { setLang(l); localStorage.setItem(LANG_KEY, l) }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await createClient().auth.signInWithPassword({ email, password })
    if (error) { toast.error(error.message) }
    else { toast.success('Բարի գալուստ!'); router.push('/dashboard'); router.refresh() }
    setLoading(false)
  }

  const t = T[lang]

  return (
    <DarkPageShell>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">

        {/* Grid overlay */}
        <div className="lp-grid-bg fixed inset-0 pointer-events-none" />

        <div className="w-full max-w-sm relative">

          {/* Logo + lang row */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base lp-gradient-bg">▦</div>
              <span className="font-extrabold text-[1rem] lp-gradient-text">QR Catalog</span>
            </Link>
            <div className="flex gap-0.5 bg-lp-surface2 rounded-lg p-0.5 border border-lp-border">
              {(['hy', 'ru', 'en'] as Lang[]).map(l => (
                <button key={l} onClick={() => switchLang(l)}
                  className="px-2.5 py-1 rounded-md text-[.7rem] font-bold tracking-widest transition-all"
                  style={{ background: lang === l ? 'linear-gradient(135deg,#4f8ef7,#8b5cf6)' : 'transparent', color: lang === l ? '#fff' : '#6b7a99' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">{t.loginTitle}</h1>
            <p className="text-lp-muted text-sm mt-1">{t.loginSub}</p>
          </div>

          {/* Card */}
          <div className="bg-lp-surface border border-lp-border rounded-2xl p-7"
            style={{ boxShadow: '0 8px 40px rgba(0,0,0,.4)' }}>
            <form onSubmit={handleLogin} className="space-y-5">

              <div>
                <label className="block text-xs font-semibold text-lp-muted uppercase tracking-widest mb-2">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-lg text-sm bg-lp-surface2 border border-lp-border text-lp-text placeholder-lp-muted outline-none transition-all"
                  onFocus={e => e.currentTarget.style.borderColor = '#4f8ef7'}
                  onBlur={e  => e.currentTarget.style.borderColor = '#1f2435'}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-lp-muted uppercase tracking-widest mb-2">{t.passwordLabel}</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 rounded-lg text-sm bg-lp-surface2 border border-lp-border text-lp-text placeholder-lp-muted outline-none transition-all"
                    onFocus={e => e.currentTarget.style.borderColor = '#4f8ef7'}
                    onBlur={e  => e.currentTarget.style.borderColor = '#1f2435'}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lp-muted hover:text-lp-text transition-colors">
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="lp-btn-primary w-full py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? t.loginBtnLoading : t.loginBtn}
              </button>
            </form>

            <p className="text-center text-sm text-lp-muted mt-6">
              {t.noAccount}{' '}
              <Link href="/auth/register" className="text-lp-accent hover:text-lp-accent2 font-semibold transition-colors">
                {t.toRegister}
              </Link>
            </p>
          </div>

        </div>
      </div>
    </DarkPageShell>
  )
}
