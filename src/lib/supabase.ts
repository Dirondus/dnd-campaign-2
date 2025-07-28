import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'admin' | 'viewer'

export const ADMIN_EMAILS = ['keyeen@outlook.com']
export const VIEWER_EMAILS = ['jak.carabott@gmail.com']

export const getUserRole = (email: string): UserRole | null => {
  if (ADMIN_EMAILS.includes(email)) return 'admin'
  if (VIEWER_EMAILS.includes(email)) return 'viewer'
  return null
}

export const isAuthorizedEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email) || VIEWER_EMAILS.includes(email)
}