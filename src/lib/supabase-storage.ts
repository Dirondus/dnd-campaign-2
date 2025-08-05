import { supabase } from '@/integrations/supabase/client'

type TableName = 'groups' | 'lore_entries' | 'npcs' | 'monsters' | 'sessions'

export const saveToSupabase = async (table: TableName, data: any) => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error('You must be logged in to create entries')
    }

    const dataWithUser = {
      ...data,
      created_by: user.id
    }

    const { data: result, error } = await supabase
      .from(table)
      .insert(dataWithUser)
      .select()
      .single()
    
    if (error) throw error
    return result
  } catch (error) {
    console.error('Failed to save to Supabase:', error)
    throw error
  }
}

export const updateInSupabase = async (table: TableName, id: string, data: any) => {
  try {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .maybeSingle()
    
    if (error) throw error
    if (!result) throw new Error('No record found to update')
    return result
  } catch (error) {
    console.error('Failed to update in Supabase:', error)
    throw error
  }
}

export const deleteFromSupabase = async (table: TableName, id: string) => {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    console.error('Failed to delete from Supabase:', error)
    throw error
  }
}

export const loadFromSupabase = async (table: TableName) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Failed to load from Supabase:', error)
    return []
  }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}