'use client'

import { useEffect, useRef } from 'react'

/**
 * Shared dark-page wrapper — particles canvas + cursor glow.
 * Used by auth pages (login, register).
 */
export default function DarkPageShell({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* ── Particles ── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0, H = 0
    type P = { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; color: string }
    const particles: P[] = []

    function resize() { W = canvas!.width = window.innerWidth; H = canvas!.height = window.innerHeight }
    function mk(init = false): P {
      return { x: Math.random() * W, y: init ? Math.random() * H : H + 10, size: Math.random() * 1.5 + 0.3, speedY: -(Math.random() * 0.4 + 0.1), speedX: (Math.random() - 0.5) * 0.15, opacity: Math.random() * 0.4 + 0.1, color: Math.random() > 0.5 ? '79,142,247' : '139,92,246' }
    }

    resize()
    window.addEventListener('resize', resize)
    for (let i = 0; i < 80; i++) particles.push(mk(true))

    let id: number
    function loop() {
      ctx!.clearRect(0, 0, W, H)
      particles.forEach((p, i) => {
        p.y += p.speedY; p.x += p.speedX
        if (p.y < -10) particles[i] = mk()
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${p.color},${p.opacity})`; ctx!.fill()
      })
      id = requestAnimationFrame(loop)
    }
    loop()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(id) }
  }, [])

  /* ── Cursor glow ── */
  useEffect(() => {
    const el = document.getElementById('dps-cursor-glow')
    if (!el) return
    const h = (e: MouseEvent) => { el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px' }
    document.addEventListener('mousemove', h)
    return () => document.removeEventListener('mousemove', h)
  }, [])

  return (
    <div className="bg-lp-bg text-lp-text min-h-screen overflow-x-hidden relative"
      style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>

      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-[.45]" />

      <div id="dps-cursor-glow" className="fixed pointer-events-none z-0 hidden md:block"
        style={{ width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,.06) 0%, transparent 70%)', transform: 'translate(-50%,-50%)', transition: 'left .12s ease, top .12s ease' }} />

      <div className="relative z-[1]">
        {children}
      </div>
    </div>
  )
}
