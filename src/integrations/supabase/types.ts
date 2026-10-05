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
      alerts: {
        Row: {
          action_taken: string | null
          created_at: string
          department: string | null
          description: string | null
          id: string
          resolved: boolean
          resolved_at: string | null
          severity: string
          title: string
          zone_id: string | null
          zone_name: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          title: string
          zone_id?: string | null
          zone_name?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          title?: string
          zone_id?: string | null
          zone_name?: string | null
        }
        Relationships: []
      }
      assets: {
        Row: {
          id: string
          last_inspection_date: string | null
          lat: number | null
          lng: number | null
          location: string | null
          maintenance_history: Json
          name: string
          operator: string | null
          qr_id: string | null
          status: string
          type: string
          updated_at: string
          zone_id: string | null
          zone_name: string | null
        }
        Insert: {
          id: string
          last_inspection_date?: string | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          maintenance_history?: Json
          name: string
          operator?: string | null
          qr_id?: string | null
          status?: string
          type: string
          updated_at?: string
          zone_id?: string | null
          zone_name?: string | null
        }
        Update: {
          id?: string
          last_inspection_date?: string | null
          lat?: number | null
          lng?: number | null
          location?: string | null
          maintenance_history?: Json
          name?: string
          operator?: string | null
          qr_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          zone_id?: string | null
          zone_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: string | null
          id: string
          role: string | null
          type: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          id?: string
          role?: string | null
          type?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          id?: string
          role?: string | null
          type?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      checklist_templates: {
        Row: {
          active: boolean
          department: string
          frequency: string | null
          id: string
          mandatory_photo: boolean
          title: string
        }
        Insert: {
          active?: boolean
          department: string
          frequency?: string | null
          id: string
          mandatory_photo?: boolean
          title: string
        }
        Update: {
          active?: boolean
          department?: string
          frequency?: string | null
          id?: string
          mandatory_photo?: boolean
          title?: string
        }
        Relationships: []
      }
      department_stats: {
        Row: {
          completion_rate: number
          department: string
          ready_items: number
          total_items: number
        }
        Insert: {
          completion_rate?: number
          department: string
          ready_items?: number
          total_items?: number
        }
        Update: {
          completion_rate?: number
          department?: string
          ready_items?: number
          total_items?: number
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          alt_phone: string | null
          availability: string
          created_at: string
          created_by: string | null
          department: string | null
          designation: string | null
          email: string | null
          id: string
          name: string
          phone: string
          updated_at: string
          zone_id: string | null
          zone_name: string | null
        }
        Insert: {
          alt_phone?: string | null
          availability?: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          designation?: string | null
          email?: string | null
          id?: string
          name: string
          phone: string
          updated_at?: string
          zone_id?: string | null
          zone_name?: string | null
        }
        Update: {
          alt_phone?: string | null
          availability?: string
          created_at?: string
          created_by?: string | null
          department?: string | null
          designation?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string
          updated_at?: string
          zone_id?: string | null
          zone_name?: string | null
        }
        Relationships: []
      }
      inspections: {
        Row: {
          created_at: string
          created_by: string | null
          department: string | null
          gps_coordinates: string | null
          id: string
          item_checked: string | null
          officer_name: string | null
          photo_url: string | null
          remarks: string | null
          status: string
          zone_id: string | null
          zone_name: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          gps_coordinates?: string | null
          id?: string
          item_checked?: string | null
          officer_name?: string | null
          photo_url?: string | null
          remarks?: string | null
          status?: string
          zone_id?: string | null
          zone_name?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          gps_coordinates?: string | null
          id?: string
          item_checked?: string | null
          officer_name?: string | null
          photo_url?: string | null
          remarks?: string | null
          status?: string
          zone_id?: string | null
          zone_name?: string | null
        }
        Relationships: []
      }
      notification_reads: {
        Row: {
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          created_by: string | null
          id: string
          link_tab: string | null
          severity: string
          target_role: Database["public"]["Enums"]["app_role"] | null
          target_user: string | null
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          link_tab?: string | null
          severity?: string
          target_role?: Database["public"]["Enums"]["app_role"] | null
          target_user?: string | null
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          link_tab?: string | null
          severity?: string
          target_role?: Database["public"]["Enums"]["app_role"] | null
          target_user?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          first_login_at: string | null
          full_name: string | null
          id: string
          last_login_at: string | null
          selected_role: Database["public"]["Enums"]["app_role"] | null
          status: string
          title: string | null
          zone_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_login_at?: string | null
          full_name?: string | null
          id: string
          last_login_at?: string | null
          selected_role?: Database["public"]["Enums"]["app_role"] | null
          status?: string
          title?: string | null
          zone_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          first_login_at?: string | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          selected_role?: Database["public"]["Enums"]["app_role"] | null
          status?: string
          title?: string | null
          zone_id?: string | null
        }
        Relationships: []
      }
      shelters: {
        Row: {
          address: string | null
          amenities: Json
          capacity: number | null
          contact_person: string | null
          contact_phone: string | null
          current_occupancy: number | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          status: string
          updated_at: string
          zone_id: string | null
          zone_name: string | null
        }
        Insert: {
          address?: string | null
          amenities?: Json
          capacity?: number | null
          contact_person?: string | null
          contact_phone?: string | null
          current_occupancy?: number | null
          id: string
          lat?: number | null
          lng?: number | null
          name: string
          status?: string
          updated_at?: string
          zone_id?: string | null
          zone_name?: string | null
        }
        Update: {
          address?: string | null
          amenities?: Json
          capacity?: number | null
          contact_person?: string | null
          contact_phone?: string | null
          current_occupancy?: number | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          status?: string
          updated_at?: string
          zone_id?: string | null
          zone_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shelters_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      zones: {
        Row: {
          asset_count: number | null
          dept_breakdown: Json
          extra: Json
          id: string
          lat: number | null
          lng: number | null
          name: string
          number: number
          officer_contact: string | null
          officer_name: string | null
          officer_role: string | null
          pending_task_count: number
          population_at_risk: number | null
          readiness_score: number
          shelter_count: number | null
          status: string
          updated_at: string
        }
        Insert: {
          asset_count?: number | null
          dept_breakdown?: Json
          extra?: Json
          id: string
          lat?: number | null
          lng?: number | null
          name: string
          number: number
          officer_contact?: string | null
          officer_name?: string | null
          officer_role?: string | null
          pending_task_count?: number
          population_at_risk?: number | null
          readiness_score?: number
          shelter_count?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          asset_count?: number | null
          dept_breakdown?: Json
          extra?: Json
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          number?: number
          officer_contact?: string | null
          officer_name?: string | null
          officer_role?: string | null
          pending_task_count?: number
          population_at_risk?: number | null
          readiness_score?: number
          shelter_count?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      can_edit: { Args: { _user_id: string }; Returns: boolean }
      claim_selected_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_senior: { Args: { _user_id: string }; Returns: boolean }
      my_dept: { Args: { _user_id: string }; Returns: string }
      my_zone: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role:
        | "commissioner"
        | "deputy_commissioner"
        | "disaster_officer"
        | "zone_officer"
        | "dept_officer"
        | "field_inspector"
        | "shelter_manager"
        | "asset_manager"
        | "volunteer"
        | "viewer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: [
        "commissioner",
        "deputy_commissioner",
        "disaster_officer",
        "zone_officer",
        "dept_officer",
        "field_inspector",
        "shelter_manager",
        "asset_manager",
        "volunteer",
        "viewer",
      ],
    },
  },
} as const
