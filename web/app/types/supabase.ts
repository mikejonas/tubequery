export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      channel: {
        Row: {
          channel_name: string
          channel_url: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          subscriber_count: number | null
          thumbnail_url: string
          updated_at: string | null
          user_url: string | null
        }
        Insert: {
          channel_name: string
          channel_url?: string | null
          created_at?: string | null
          id: string
          is_verified?: boolean | null
          subscriber_count?: number | null
          thumbnail_url: string
          updated_at?: string | null
          user_url?: string | null
        }
        Update: {
          channel_name?: string
          channel_url?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          subscriber_count?: number | null
          thumbnail_url?: string
          updated_at?: string | null
          user_url?: string | null
        }
        Relationships: []
      }
      chat: {
        Row: {
          content: string
          created_at: string
          id: number
          role: string
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: never
          role?: string
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: never
          role?: string
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video"
            referencedColumns: ["id"]
          },
        ]
      }
      summary: {
        Row: {
          created_at: string | null
          id: number
          summary_text: string
          updated_at: string | null
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          summary_text: string
          updated_at?: string | null
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          summary_text?: string
          updated_at?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "summary_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: true
            referencedRelation: "video"
            referencedColumns: ["id"]
          },
        ]
      }
      transcript: {
        Row: {
          created_at: string | null
          id: number
          transcript: Json
          updated_at: string | null
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          transcript: Json
          updated_at?: string | null
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: never
          transcript?: Json
          updated_at?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcript_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: true
            referencedRelation: "video"
            referencedColumns: ["id"]
          },
        ]
      }
      video: {
        Row: {
          available_countries: Json | null
          category: string | null
          channel_id: string
          chapters: Json | null
          created_at: string | null
          description: string
          embed_height: number | null
          embed_width: number | null
          id: string
          is_age_restricted: boolean | null
          is_crawlable: boolean | null
          is_family_safe: boolean | null
          is_private: boolean | null
          is_unlisted: boolean | null
          length_seconds: number | null
          publish_date: string | null
          thumbnail_url: string
          title: string
          updated_at: string | null
          upload_date: string | null
        }
        Insert: {
          available_countries?: Json | null
          category?: string | null
          channel_id: string
          chapters?: Json | null
          created_at?: string | null
          description: string
          embed_height?: number | null
          embed_width?: number | null
          id: string
          is_age_restricted?: boolean | null
          is_crawlable?: boolean | null
          is_family_safe?: boolean | null
          is_private?: boolean | null
          is_unlisted?: boolean | null
          length_seconds?: number | null
          publish_date?: string | null
          thumbnail_url: string
          title: string
          updated_at?: string | null
          upload_date?: string | null
        }
        Update: {
          available_countries?: Json | null
          category?: string | null
          channel_id?: string
          chapters?: Json | null
          created_at?: string | null
          description?: string
          embed_height?: number | null
          embed_width?: number | null
          id?: string
          is_age_restricted?: boolean | null
          is_crawlable?: boolean | null
          is_family_safe?: boolean | null
          is_private?: boolean | null
          is_unlisted?: boolean | null
          length_seconds?: number | null
          publish_date?: string | null
          thumbnail_url?: string
          title?: string
          updated_at?: string | null
          upload_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channel"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
