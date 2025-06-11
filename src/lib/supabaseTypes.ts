// Generated TypeScript types for Supabase tables
export interface Database {
  public: {
    Tables: {
      parts: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          status: 'active' | 'inactive' | 'archived' | 'maintenance'
          condition: 'new' | 'used' | 'salvaged' | 'broken' | 'refurbished'
          location: string | null
          metadata: Record<string, any>
          specifications: Record<string, any>
          models: Record<string, any>
          components: any[]
          documentation: Record<string, any>
          simulation: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          status: 'active' | 'inactive' | 'archived' | 'maintenance'
          condition: 'new' | 'used' | 'salvaged' | 'broken' | 'refurbished'
          location?: string | null
          metadata?: Record<string, any>
          specifications?: Record<string, any>
          models?: Record<string, any>
          components?: any[]
          documentation?: Record<string, any>
          simulation?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          status?: 'active' | 'inactive' | 'archived' | 'maintenance'
          condition?: 'new' | 'used' | 'salvaged' | 'broken' | 'refurbished'
          location?: string | null
          metadata?: Record<string, any>
          specifications?: Record<string, any>
          models?: Record<string, any>
          components?: any[]
          documentation?: Record<string, any>
          simulation?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          parent_id?: string | null
          created_at?: string
        }
      }
      manufacturers: {
        Row: {
          id: string
          name: string
          website: string | null
          contact_info: Record<string, any>
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          website?: string | null
          contact_info?: Record<string, any>
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          website?: string | null
          contact_info?: Record<string, any>
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          description: string | null
          address: Record<string, any>
          coordinates: unknown | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: Record<string, any>
          coordinates?: unknown | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: Record<string, any>
          coordinates?: unknown | null
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      part_tags: {
        Row: {
          part_id: string
          tag_id: string
        }
        Insert: {
          part_id: string
          tag_id: string
        }
        Update: {
          part_id?: string
          tag_id?: string
        }
      }
      part_history: {
        Row: {
          id: string
          part_id: string
          action: 'created' | 'updated' | 'deleted' | 'moved' | 'status_changed'
          changes: Record<string, any>
          user_id: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          part_id: string
          action: 'created' | 'updated' | 'deleted' | 'moved' | 'status_changed'
          changes?: Record<string, any>
          user_id?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          part_id?: string
          action?: 'created' | 'updated' | 'deleted' | 'moved' | 'status_changed'
          changes?: Record<string, any>
          user_id?: string | null
          timestamp?: string
        }
      }
      part_images: {
        Row: {
          id: string
          part_id: string
          filename: string
          url: string
          thumbnail_url: string | null
          alt_text: string | null
          file_size: number | null
          mime_type: string | null
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          part_id: string
          filename: string
          url: string
          thumbnail_url?: string | null
          alt_text?: string | null
          file_size?: number | null
          mime_type?: string | null
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          part_id?: string
          filename?: string
          url?: string
          thumbnail_url?: string | null
          alt_text?: string | null
          file_size?: number | null
          mime_type?: string | null
          is_primary?: boolean
          created_at?: string
        }
      }
      part_documents: {
        Row: {
          id: string
          part_id: string
          title: string
          filename: string
          url: string
          document_type: 'datasheet' | 'manual' | 'schematic' | 'specification' | 'other' | null
          file_size: number | null
          mime_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          part_id: string
          title: string
          filename: string
          url: string
          document_type?: 'datasheet' | 'manual' | 'schematic' | 'specification' | 'other' | null
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          part_id?: string
          title?: string
          filename?: string
          url?: string
          document_type?: 'datasheet' | 'manual' | 'schematic' | 'specification' | 'other' | null
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
      }
      part_models: {
        Row: {
          id: string
          part_id: string
          filename: string
          url: string
          model_type: 'primary' | 'lod_high' | 'lod_medium' | 'lod_low' | 'collision' | null
          format: 'gltf' | 'obj' | 'stl' | 'step' | 'iges' | null
          file_size: number | null
          vertices: number | null
          faces: number | null
          materials: any[]
          animations: any[]
          created_at: string
        }
        Insert: {
          id?: string
          part_id: string
          filename: string
          url: string
          model_type?: 'primary' | 'lod_high' | 'lod_medium' | 'lod_low' | 'collision' | null
          format?: 'gltf' | 'obj' | 'stl' | 'step' | 'iges' | null
          file_size?: number | null
          vertices?: number | null
          faces?: number | null
          materials?: any[]
          animations?: any[]
          created_at?: string
        }
        Update: {
          id?: string
          part_id?: string
          filename?: string
          url?: string
          model_type?: 'primary' | 'lod_high' | 'lod_medium' | 'lod_low' | 'collision' | null
          format?: 'gltf' | 'obj' | 'stl' | 'step' | 'iges' | null
          file_size?: number | null
          vertices?: number | null
          faces?: number | null
          materials?: any[]
          animations?: any[]
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_parts: {
        Args: {
          search_query: string
        }
        Returns: {
          id: string
          name: string
          description: string
          category: string
          status: string
          condition: string
          location: string
          rank: number
        }[]
      }
      get_parts_statistics: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, any>
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}