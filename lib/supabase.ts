import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          restaurant_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          restaurant_name?: string | null
          created_at?: string
        }
        Update: {
          restaurant_name?: string | null
        }
      }
      menus: {
        Row: {
          id: string
          user_id: string
          slug: string
          restaurant_name: string
          logo_url: string | null
          primary_color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          slug: string
          restaurant_name: string
          logo_url?: string | null
          primary_color?: string
          created_at?: string
        }
        Update: {
          slug?: string
          restaurant_name?: string
          logo_url?: string | null
          primary_color?: string
        }
      }
      categories: {
        Row: {
          id: string
          menu_id: string
          name_ru: string
          name_hy: string | null
          name_en: string | null
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          menu_id: string
          name_ru: string
          name_hy?: string | null
          name_en?: string | null
          position?: number
          created_at?: string
        }
        Update: {
          name_ru?: string
          name_hy?: string | null
          name_en?: string | null
          position?: number
        }
      }
      items: {
        Row: {
          id: string
          category_id: string
          name_ru: string
          name_hy: string | null
          name_en: string | null
          description_ru: string | null
          description_hy: string | null
          description_en: string | null
          price: number
          currency: string
          image_url: string | null
          is_available: boolean
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name_ru: string
          name_hy?: string | null
          name_en?: string | null
          description_ru?: string | null
          description_hy?: string | null
          description_en?: string | null
          price?: number
          currency?: string
          image_url?: string | null
          is_available?: boolean
          position?: number
          created_at?: string
        }
        Update: {
          name_ru?: string
          name_hy?: string | null
          name_en?: string | null
          description_ru?: string | null
          description_hy?: string | null
          description_en?: string | null
          price?: number
          currency?: string
          image_url?: string | null
          is_available?: boolean
          position?: number
        }
      }
    }
  }
}