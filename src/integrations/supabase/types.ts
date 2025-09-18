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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      authorized_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password_hash: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password_hash: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password_hash?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          id: string
          name: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      lead_statuses: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          course_id: string | null
          course_type: string | null
          created_at: string
          email: string
          event_id: string | null
          id: string
          name: string
          postgraduate_course_id: string | null
          scan_session_id: string | null
          shift: string | null
          source: string | null
          status_id: string | null
          updated_at: string
          whatsapp: string
        }
        Insert: {
          course_id?: string | null
          course_type?: string | null
          created_at?: string
          email: string
          event_id?: string | null
          id?: string
          name: string
          postgraduate_course_id?: string | null
          scan_session_id?: string | null
          shift?: string | null
          source?: string | null
          status_id?: string | null
          updated_at?: string
          whatsapp: string
        }
        Update: {
          course_id?: string | null
          course_type?: string | null
          created_at?: string
          email?: string
          event_id?: string | null
          id?: string
          name?: string
          postgraduate_course_id?: string | null
          scan_session_id?: string | null
          shift?: string | null
          source?: string | null
          status_id?: string | null
          updated_at?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_postgraduate_course_id_fkey"
            columns: ["postgraduate_course_id"]
            isOneToOne: false
            referencedRelation: "postgraduate_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_scan_session_id_fkey"
            columns: ["scan_session_id"]
            isOneToOne: false
            referencedRelation: "scan_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "lead_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      message_history: {
        Row: {
          content: string
          filter_type: string | null
          filter_value: string | null
          id: string
          recipients_count: number
          sent_at: string
          status: string
          type: string
          webhook_response: string | null
        }
        Insert: {
          content: string
          filter_type?: string | null
          filter_value?: string | null
          id?: string
          recipients_count?: number
          sent_at?: string
          status?: string
          type: string
          webhook_response?: string | null
        }
        Update: {
          content?: string
          filter_type?: string | null
          filter_value?: string | null
          id?: string
          recipients_count?: number
          sent_at?: string
          status?: string
          type?: string
          webhook_response?: string | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      postgraduate_courses: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      qr_codes: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          original_url: string
          scans: number
          short_url: string
          tracking_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          original_url: string
          scans?: number
          short_url: string
          tracking_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          original_url?: string
          scans?: number
          short_url?: string
          tracking_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_sessions: {
        Row: {
          converted: boolean
          converted_at: string | null
          created_at: string
          event_id: string | null
          id: string
          ip_address: string | null
          lead_id: string | null
          qr_code_id: string | null
          scanned_at: string
          user_agent: string | null
        }
        Insert: {
          converted?: boolean
          converted_at?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          ip_address?: string | null
          lead_id?: string | null
          qr_code_id?: string | null
          scanned_at?: string
          user_agent?: string | null
        }
        Update: {
          converted?: boolean
          converted_at?: string | null
          created_at?: string
          event_id?: string | null
          id?: string
          ip_address?: string | null
          lead_id?: string | null
          qr_code_id?: string | null
          scanned_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scan_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_sessions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_sessions_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      whatsapp_validations: {
        Row: {
          created_at: string
          id: string
          response_message: string | null
          status: string
          validated_at: string | null
          whatsapp: string
        }
        Insert: {
          created_at?: string
          id?: string
          response_message?: string | null
          status?: string
          validated_at?: string | null
          whatsapp: string
        }
        Update: {
          created_at?: string
          id?: string
          response_message?: string | null
          status?: string
          validated_at?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cron_schedule: {
        Args: { command: string; cron: string; name: string }
        Returns: undefined
      }
      cron_unschedule: {
        Args: { name: string }
        Returns: undefined
      }
      get_scan_sessions: {
        Args: Record<PropertyKey, never>
        Returns: {
          event: Json
          event_id: string
          id: string
          ip_address: string
          lead: Json
          lead_id: string
          qr_code: Json
          qr_code_id: string
          scanned_at: string
          user_agent: string
        }[]
      }
      verify_login: {
        Args: { p_password: string; p_username: string }
        Returns: {
          success: boolean
          user_data: Json
        }[]
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
    Enums: {},
  },
} as const
