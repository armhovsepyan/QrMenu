import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import PublicMenu from '@/components/menu/PublicMenu'

type Props = { params: { slug: string } }

async function getMenuData(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: menu } = await supabase
    .from('menus')
    .select('id, restaurant_name, logo_url, primary_color')
    .eq('slug', slug)
    .single()

  if (!menu) return null

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_ru, name_hy, name_en, position')
    .eq('menu_id', menu.id)
    .order('position')

  if (!categories) return { menu, categories: [] }

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .in('category_id', categories.map(c => c.id))
    .order('position')

  const categoriesWithItems = categories.map(cat => ({
    ...cat,
    items: (items || []).filter(item => item.category_id === cat.id),
  }))

  return { menu, categories: categoriesWithItems }
}

export async function generateMetadata({ params }: Props) {
  const data = await getMenuData(params.slug)
  if (!data) return { title: 'Меню не найдено' }
  return {
    title: `Меню — ${data.menu.restaurant_name}`,
    description: `Цифровое меню ${data.menu.restaurant_name}`,
  }
}

export default async function PublicMenuPage({ params }: Props) {
  const data = await getMenuData(params.slug)
  if (!data) notFound()

  return <PublicMenu menu={data.menu} categories={data.categories} />
}
