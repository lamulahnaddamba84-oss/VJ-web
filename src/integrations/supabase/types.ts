export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          movie_id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          movie_id: string
          rating?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          movie_id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      downloads: {
        Row: {
          created_at: string
          id: string
          movie_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          movie_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          movie_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "downloads_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          movie_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          movie_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          movie_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_live: boolean
          scheduled_at: string | null
          stream_url: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          viewers: number
          vj: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_live?: boolean
          scheduled_at?: string | null
          stream_url: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          viewers?: number
          vj: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_live?: boolean
          scheduled_at?: string | null
          stream_url?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          viewers?: number
          vj?: string
        }
        Relationships: []
      }
      movies: {
        Row: {
          category_id: string | null
          company: string | null
          country: string | null
          created_at: string
          description: string | null
          director: string | null
          download_url: string | null
          downloads_count: number
          genre: string | null
          id: string
          is_featured: boolean
          is_premium: boolean
          language: string | null
          movie_cast: string | null
          poster_url: string | null
          price_ugx: number | null
          rating: number | null
          release_year: number | null
          resolution: string | null
          runtime: number | null
          slug: string
          telegram_url: string | null
          title: string
          trailer_url: string | null
          video_url: string | null
          views: number
          vj: string | null
        }
        Insert: {
          category_id?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          director?: string | null
          download_url?: string | null
          downloads_count?: number
          genre?: string | null
          id?: string
          is_featured?: boolean
          is_premium?: boolean
          language?: string | null
          movie_cast?: string | null
          poster_url?: string | null
          price_ugx?: number | null
          rating?: number | null
          release_year?: number | null
          resolution?: string | null
          runtime?: number | null
          slug: string
          telegram_url?: string | null
          title: string
          trailer_url?: string | null
          video_url?: string | null
          views?: number
          vj?: string | null
        }
        Update: {
          category_id?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          director?: string | null
          download_url?: string | null
          downloads_count?: number
          genre?: string | null
          id?: string
          is_featured?: boolean
          is_premium?: boolean
          language?: string | null
          movie_cast?: string | null
          poster_url?: string | null
          price_ugx?: number | null
          rating?: number | null
          release_year?: number | null
          resolution?: string | null
          runtime?: number | null
          slug?: string
          telegram_url?: string | null
          title?: string
          trailer_url?: string | null
          video_url?: string | null
          views?: number
          vj?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movies_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      series: {
        Row: {
          country: string | null
          created_at: string
          description: string | null
          episodes: number | null
          genre: string | null
          id: string
          is_featured: boolean
          is_premium: boolean
          language: string | null
          poster_url: string | null
          rating: number | null
          release_year: number | null
          seasons: number | null
          slug: string
          title: string
          trailer_url: string | null
          updated_at: string
          views: number
          vj: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          description?: string | null
          episodes?: number | null
          genre?: string | null
          id?: string
          is_featured?: boolean
          is_premium?: boolean
          language?: string | null
          poster_url?: string | null
          rating?: number | null
          release_year?: number | null
          seasons?: number | null
          slug: string
          title: string
          trailer_url?: string | null
          updated_at?: string
          views?: number
          vj?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          description?: string | null
          episodes?: number | null
          genre?: string | null
          id?: string
          is_featured?: boolean
          is_premium?: boolean
          language?: string | null
          poster_url?: string | null
          rating?: number | null
          release_year?: number | null
          seasons?: number | null
          slug?: string
          title?: string
          trailer_url?: string | null
          updated_at?: string
          views?: number
          vj?: string | null
        }
        Relationships: []
      }
      shorts: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration: number | null
          id: string
          likes: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
          views: number
          vj: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          likes?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
          views?: number
          vj?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          likes?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
          views?: number
          vj?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_ugx: number
          created_at: string
          ends_at: string
          id: string
          payment_method: string | null
          plan: string
          starts_at: string
          status: string
          user_id: string
        }
        Insert: {
          amount_ugx: number
          created_at?: string
          ends_at: string
          id?: string
          payment_method?: string | null
          plan: string
          starts_at?: string
          status?: string
          user_id: string
        }
        Update: {
          amount_ugx?: number
          created_at?: string
          ends_at?: string
          id?: string
          payment_method?: string | null
          plan?: string
          starts_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      watch_history: {
        Row: {
          id: string
          last_watched: string
          movie_id: string
          progress_seconds: number
          user_id: string
        }
        Insert: {
          id?: string
          last_watched?: string
          movie_id: string
          progress_seconds?: number
          user_id: string
        }
        Update: {
          id?: string
          last_watched?: string
          movie_id?: string
          progress_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
