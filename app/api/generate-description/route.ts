import { NextResponse } from 'next/server'
import { generateMenuDescriptions } from '@/lib/anthropic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name_ru, name_hy, name_en } = body

    if (!name_ru && !name_hy && !name_en) {
      return NextResponse.json({ error: 'Укажите хотя бы одно название блюда' }, { status: 400 })
    }

    const descriptions = await generateMenuDescriptions(name_ru || '', name_hy || '', name_en || '')
    return NextResponse.json(descriptions)
  } catch (error) {
    console.error('AI description error:', error)
    return NextResponse.json({ error: 'Ошибка генерации описания' }, { status: 500 })
  }
}
