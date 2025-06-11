import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for the parts table
export interface SupabasePart {
  id: string
  name: string
  description?: string
  category: string
  status: string
  condition: string
  location?: string
  metadata: Record<string, any>
  specifications: Record<string, any>
  models: Record<string, any>
  components: any[]
  documentation: Record<string, any>
  simulation: Record<string, any>
  created_at: string
  updated_at: string
}

// Helper functions for parts CRUD operations
export const partsApi = {
  // Get all parts
  async getAll() {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as SupabasePart[]
  },

  // Get part by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as SupabasePart
  },

  // Create new part
  async create(part: Omit<SupabasePart, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('parts')
      .insert(part)
      .select()
      .single()
    
    if (error) throw error
    return data as SupabasePart
  },

  // Update part
  async update(id: string, updates: Partial<SupabasePart>) {
    const { data, error } = await supabase
      .from('parts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as SupabasePart
  },

  // Delete part
  async delete(id: string) {
    const { error } = await supabase
      .from('parts')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Search parts
  async search(query: string) {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as SupabasePart[]
  }
}