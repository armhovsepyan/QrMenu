'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import QRGenerator from '@/components/dashboard/QRGenerator'

type Menu = { id: string; restaurant_name: string; slug: string }

export default function QRPage() {
  const { id } = useParams<{ id: string }>()
  const [menu, setMenu] = useState<Menu | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('menus').select('id, restaurant_name, slug').eq('id', id).single()
      setMenu(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Բեռնում...</div>
  if (!menu) return null

  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/menu/${menu.slug}`

  return (
    <div className="p-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <Link href={`/dashboard/menu/${id}`} className="text-sm text-gray-400 hover:text-gray-600">← Մենյուի խմբագիր</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Մենյուի QR-կոդ</h1>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center">
          <QRGenerator url={publicUrl} restaurantName={menu.restaurant_name} />

          <div className="mt-6 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Մենյուի հանրային հղումը</p>
            <a href={publicUrl} target="_blank" rel="noreferrer" className="text-sm text-orange-500 hover:text-orange-600 font-medium break-all">
              {publicUrl}
            </a>
          </div>

          <div className="mt-6 text-left bg-orange-50 border border-orange-100 rounded-xl p-4">
            <p className="text-sm font-medium text-orange-800 mb-2">📋 Տեղադրման հրահանգ</p>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>1. Ներբեռնեք QR-կոդը PNG ձևաչափով</li>
              <li>2. Տպեք և տեղադրեք սեղաններին</li>
              <li>3. Հյուրերը սկանավորում են հեռախոսի տեսախցիկով</li>
              <li>4. Մենյուն բացվում է անմիջապես — առանց հավելվածի</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
