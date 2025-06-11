import { supabase } from './supabaseClient'
import type { Database } from './supabaseTypes'

type Tables = Database['public']['Tables']
type Part = Tables['parts']['Row']
type PartInsert = Tables['parts']['Insert']
type PartUpdate = Tables['parts']['Update']
type Category = Tables['categories']['Row']
type Manufacturer = Tables['manufacturers']['Row']
type Location = Tables['locations']['Row']
type Tag = Tables['tags']['Row']

// Parts API
export const partsApi = {
  // Get all parts with optional filters
  async getAll(filters?: {
    category?: string
    status?: string
    condition?: string
    location?: string
  }) {
    let query = supabase
      .from('parts')
      .select(`
        *,
        part_tags (
          tags (*)
        ),
        part_images (*)
      `)
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.condition) {
      query = query.eq('condition', filters.condition)
    }
    if (filters?.location) {
      query = query.eq('location', filters.location)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Get part by ID with all related data
  async getById(id: string) {
    const { data, error } = await supabase
      .from('parts')
      .select(`
        *,
        part_tags (
          tags (*)
        ),
        part_images (*),
        part_documents (*),
        part_models (*),
        part_history (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create new part
  async create(part: PartInsert) {
    const { data, error } = await supabase
      .from('parts')
      .insert(part)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update part
  async update(id: string, updates: PartUpdate) {
    const { data, error } = await supabase
      .from('parts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete part
  async delete(id: string) {
    const { error } = await supabase
      .from('parts')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Search parts using full-text search
  async search(query: string) {
    const { data, error } = await supabase
      .rpc('search_parts', { search_query: query })

    if (error) throw error
    return data
  },

  // Get parts statistics
  async getStatistics() {
    const { data, error } = await supabase
      .rpc('get_parts_statistics')

    if (error) throw error
    return data
  }
}

// Categories API
export const categoriesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },

  async create(category: Omit<Category, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Manufacturers API
export const manufacturersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('manufacturers')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },

  async create(manufacturer: Omit<Manufacturer, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('manufacturers')
      .insert(manufacturer)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Locations API
export const locationsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },

  async create(location: Omit<Location, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('locations')
      .insert(location)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Tags API
export const tagsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },

  async create(tag: Omit<Tag, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('tags')
      .insert(tag)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Add tag to part
  async addTopart(partId: string, tagId: string) {
    const { error } = await supabase
      .from('part_tags')
      .insert({ part_id: partId, tag_id: tagId })

    if (error) throw error
  },

  // Remove tag from part
  async removeFromPart(partId: string, tagId: string) {
    const { error } = await supabase
      .from('part_tags')
      .delete()
      .eq('part_id', partId)
      .eq('tag_id', tagId)

    if (error) throw error
  }
}

// Images API
export const imagesApi = {
  async getByPartId(partId: string) {
    const { data, error } = await supabase
      .from('part_images')
      .select('*')
      .eq('part_id', partId)
      .order('is_primary', { ascending: false })

    if (error) throw error
    return data
  },

  async create(image: Omit<Tables['part_images']['Insert'], 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('part_images')
      .insert(image)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Documents API
export const documentsApi = {
  async getByPartId(partId: string) {
    const { data, error } = await supabase
      .from('part_documents')
      .select('*')
      .eq('part_id', partId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async create(document: Omit<Tables['part_documents']['Insert'], 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('part_documents')
      .insert(document)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Models API
export const modelsApi = {
  async getByPartId(partId: string) {
    const { data, error } = await supabase
      .from('part_models')
      .select('*')
      .eq('part_id', partId)
      .order('model_type')

    if (error) throw error
    return data
  },

  async create(model: Omit<Tables['part_models']['Insert'], 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('part_models')
      .insert(model)
      .select()
      .single()

    if (error) throw error
    return data
  }
}