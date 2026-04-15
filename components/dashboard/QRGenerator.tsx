'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import toast from 'react-hot-toast'

type Props = {
  url: string
  restaurantName: string
}

export default function QRGenerator({ url, restaurantName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [generated, setGenerated] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !url) return
    QRCode.toCanvas(canvasRef.current, url, {
      width: 256,
      margin: 2,
      color: { dark: '#1f2937', light: '#ffffff' },
    }, (err) => {
      if (!err) setGenerated(true)
    })
  }, [url])

  function downloadQR() {
    if (!canvasRef.current) return

    const canvas = document.createElement('canvas')
    const size = 320
    const padding = 24
    const labelHeight = 48
    canvas.width = size + padding * 2
    canvas.height = size + padding * 2 + labelHeight
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(canvasRef.current, padding, padding, size, size)

    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(restaurantName, canvas.width / 2, size + padding * 2 + 20)

    ctx.fillStyle = '#9ca3af'
    ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.fillText('Scan to view menu', canvas.width / 2, size + padding * 2 + 40)

    const link = document.createElement('a')
    link.download = `qrmenu-${restaurantName.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast.success('QR-կոդը ներբեռնված է!')
  }

  return (
    <div className="flex flex-col items-center">
      <div className="border-4 border-gray-900 rounded-2xl p-3 inline-block mb-4">
        <canvas ref={canvasRef} className="block" />
      </div>

      {generated && (
        <button
          onClick={downloadQR}
          className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <span>⬇</span>
          Ներբեռնել PNG
        </button>
      )}
    </div>
  )
}
