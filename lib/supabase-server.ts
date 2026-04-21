import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const serverUrl = () => process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    serverUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // ignore in server components
          }
        },
      },
    }
  )
}

export function createServiceRoleClient() {
  const cookieStore = cookies()
  return createServerClient(
    serverUrl(),
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}