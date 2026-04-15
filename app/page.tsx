'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { T, type Lang, LANG_KEY, DEFAULT_LANG } from '@/lib/i18n'

const FEATURE_ICONS = ['🤖', '📱', '🌍', '📸', '🎨', '📥']
const USE_CASE_ICONS = ['🍽️', '☕', '🏪', '🍕', '📋', '🛒']

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* ── Restore language ── */
  useEffect(() => {
    const saved = localStorage.getItem(LANG_KEY) as Lang | null
    if (saved && saved in T) setLang(saved)
  }, [])

  /* ── Particles canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0, H = 0
    type P = { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; color: string }
    const particles: P[] = []

    function resize() {
      W = canvas!.width  = window.innerWidth
      H = canvas!.height = window.innerHeight
    }
    function mkParticle(initial = false): P {
      return {
        x:       Math.random() * W,
        y:       initial ? Math.random() * H : H + 10,
        size:    Math.random() * 1.5 + 0.3,
        speedY:  -(Math.random() * 0.4 + 0.1),
        speedX:  (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.4 + 0.1,
        color:   Math.random() > 0.5 ? '79,142,247' : '139,92,246',
      }
    }

    resize()
    window.addEventListener('resize', resize)
    for (let i = 0; i < 80; i++) particles.push(mkParticle(true))

    let animId: number
    function loop() {
      ctx!.clearRect(0, 0, W, H)
      particles.forEach((p, i) => {
        p.y += p.speedY; p.x += p.speedX
        if (p.y < -10) particles[i] = mkParticle(false)
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${p.color},${p.opacity})`
        ctx!.fill()
      })
      animId = requestAnimationFrame(loop)
    }
    loop()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animId) }
  }, [])

  /* ── Cursor glow ── */
  useEffect(() => {
    const el = document.getElementById('lp-cursor-glow')
    if (!el) return
    const h = (e: MouseEvent) => { el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px' }
    document.addEventListener('mousemove', h)
    return () => document.removeEventListener('mousemove', h)
  }, [])

  /* ── Scroll reveal ── */
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } })
    }, { threshold: 0.08 })
    document.querySelectorAll('.reveal').forEach((el, idx) => {
      ;(el as HTMLElement).style.transitionDelay = `${(idx % 5) * 0.07}s`
      obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  function switchLang(l: Lang) { setLang(l); localStorage.setItem(LANG_KEY, l) }

  const t = T[lang]

  return (
    <div className="bg-lp-bg text-lp-text min-h-screen overflow-x-hidden" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", lineHeight: 1.65 }}>

      {/* ── Particles ── */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-[.45]" />

      {/* ── Cursor glow (desktop only) ── */}
      <div id="lp-cursor-glow" className="fixed pointer-events-none z-0 hidden md:block" style={{ width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,.06) 0%, transparent 70%)', transform: 'translate(-50%,-50%)', transition: 'left .12s ease, top .12s ease' }} />

      {/* ══════════════════════ NAV ══════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-[200] flex justify-between items-center px-4 sm:px-[6%] h-[62px] border-b border-lp-border" style={{ background: 'rgba(10,12,16,.9)', backdropFilter: 'blur(16px)' }}>
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base lp-gradient-bg">▦</div>
          <span className="font-extrabold text-[1rem] tracking-wide lp-gradient-text">QR Catalog</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-5">
          {/* Language picker */}
          <div className="flex gap-0.5 bg-lp-surface2 rounded-lg p-0.5 border border-lp-border">
            {(['hy', 'ru', 'en'] as Lang[]).map(l => (
              <button key={l} onClick={() => switchLang(l)}
                className="px-2 sm:px-2.5 py-1 rounded-md text-[.7rem] font-bold tracking-widest transition-all"
                style={{ background: lang === l ? 'linear-gradient(135deg,#4f8ef7,#8b5cf6)' : 'transparent', color: lang === l ? '#fff' : '#6b7a99' }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Login — hidden on very small screens */}
          <Link href="/auth/login" className="hidden sm:block text-lp-muted text-sm hover:text-lp-text transition-colors">
            {t.login}
          </Link>
          <Link href="/auth/register" className="lp-btn-primary text-sm !py-2 !px-4">
            {t.register}
          </Link>
        </div>
      </nav>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="relative z-[1] min-h-screen flex flex-col items-center justify-center px-4 sm:px-[6%] pt-[80px] pb-[60px] text-center">
        {/* Grid bg */}
        <div className="lp-grid-bg absolute inset-0 pointer-events-none" />

        <div className="relative z-[1] w-full max-w-[760px] flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[.78rem] font-semibold tracking-widest mb-6"
            style={{ background: 'rgba(6,214,160,.1)', border: '1px solid rgba(6,214,160,.25)', color: '#06d6a0' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-lp-accent3 inline-block" style={{ animation: 'blink 1.8s infinite' }} />
            {t.badge}
          </div>

          {/* Headline */}
          <h1 className="font-black tracking-tight leading-[1.05] mb-3" style={{ fontSize: 'clamp(2.4rem, 8vw, 4.5rem)', letterSpacing: '-.02em' }}>
            {t.h1a}<br />
            <span className="lp-gradient-text">{t.h1b}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lp-muted mb-6 max-w-xl mx-auto" style={{ fontSize: 'clamp(.95rem, 2.5vw, 1.15rem)', lineHeight: 1.75 }}>
            {t.subtitle}
          </p>

          {/* Use-case chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {t.useCases.map((label, i) => (
              <span key={i} className="lp-tag flex items-center gap-1.5">
                {USE_CASE_ICONS[i]} {label}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
            <Link href="/auth/register" className="lp-btn-primary w-full sm:w-auto">{t.cta1}</Link>
            <Link href="/menu/demo"     className="lp-btn-outline  w-full sm:w-auto">{t.cta2}</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════ STATS ══════════════════════ */}
      <div className="relative z-[1] py-10 sm:py-14 px-4 sm:px-[6%] bg-lp-surface border-y border-lp-border">
        <div className="grid grid-cols-3 gap-3 max-w-[700px] mx-auto">
          {t.stats.map(([num, label], i) => (
            <div key={i} className="reveal lp-card text-center py-5 px-3">
              <div className="lp-gradient-text font-black leading-none mb-1.5" style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)' }}>{num}</div>
              <div className="text-lp-muted text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════ FEATURES ══════════════════════ */}
      <section className="relative z-[1] py-16 sm:py-[90px] px-4 sm:px-[6%] bg-lp-surface">
        <div className="max-w-[1000px] mx-auto">
          <div className="lp-section-label">Expertise</div>
          <h2 className="text-[clamp(1.7rem,4vw,2.4rem)] font-extrabold tracking-tight mb-10">{t.featuresH2}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.featureItems.map((f, i) => (
              <div key={i} className="reveal lp-card bg-lp-bg p-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: i % 3 === 0 ? 'rgba(79,142,247,.12)' : i % 3 === 1 ? 'rgba(139,92,246,.12)' : 'rgba(6,214,160,.1)' }}>
                  {FEATURE_ICONS[i]}
                </div>
                <div className="font-bold text-[.93rem] mb-2">{f.title}</div>
                <p className="text-lp-muted text-sm leading-relaxed m-0">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section className="relative z-[1] py-16 sm:py-[90px] px-4 sm:px-[6%] bg-lp-bg">
        <div className="max-w-[1000px] mx-auto">
          <div className="lp-section-label">Process</div>
          <h2 className="text-[clamp(1.7rem,4vw,2.4rem)] font-extrabold tracking-tight mb-10">{t.howH2}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {t.steps.map((s, i) => (
              <div key={i} className="reveal lp-card p-5 text-center">
                <div className="w-12 h-12 rounded-xl lp-gradient-bg text-white font-black text-xl flex items-center justify-center mx-auto mb-4"
                  style={{ boxShadow: '0 0 20px rgba(79,142,247,.2)' }}>
                  {i + 1}
                </div>
                <h3 className="font-bold text-[.93rem] mb-1.5">{s.title}</h3>
                <p className="text-lp-muted text-xs leading-relaxed m-0">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA BANNER ══════════════════════ */}
      <section className="relative z-[1] py-16 sm:py-[70px] px-4 sm:px-[6%] bg-lp-surface">
        <div className="relative max-w-[700px] mx-auto text-center lp-card p-8 sm:p-16 overflow-hidden">
          {/* Glow blobs */}
          <div className="absolute -top-20 -right-20 w-[260px] h-[260px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(79,142,247,.08) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-20 -left-20 w-[220px] h-[220px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,.08) 0%, transparent 70%)' }} />

          <div className="relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[.78rem] font-semibold tracking-widest mb-5"
            style={{ background: 'rgba(6,214,160,.1)', border: '1px solid rgba(6,214,160,.25)', color: '#06d6a0' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-lp-accent3 inline-block" style={{ animation: 'blink 1.8s infinite' }} />
            Free
          </div>
          <h2 className="relative text-[clamp(1.7rem,4vw,2.4rem)] font-extrabold tracking-tight mb-4">{t.ctaBannerH2}</h2>
          <p className="relative text-lp-muted mb-8 leading-relaxed">{t.ctaBannerSub}</p>
          <div className="relative flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register" className="lp-btn-primary w-full sm:w-auto">{t.ctaBtn1}</Link>
            <Link href="/menu/demo"     className="lp-btn-outline  w-full sm:w-auto">{t.ctaBtn2}</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="relative z-[1] text-center py-10 px-4 border-t border-lp-border text-lp-muted text-sm">
        <p>{t.footerCopy}</p>
        <span className="text-lp-accent3 text-xs mt-1 block">Built with Next.js &amp; Supabase</span>
      </footer>

    </div>
  )
}
