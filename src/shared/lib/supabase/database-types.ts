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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      brokerage_disabled_insurers: {
        Row: {
          brokerage_id: string
          created_at: string
          insurer_id: string
        }
        Insert: {
          brokerage_id: string
          created_at?: string
          insurer_id: string
        }
        Update: {
          brokerage_id?: string
          created_at?: string
          insurer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brokerage_disabled_insurers_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brokerage_disabled_insurers_insurer_id_fkey"
            columns: ["insurer_id"]
            isOneToOne: false
            referencedRelation: "insurers"
            referencedColumns: ["id"]
          },
        ]
      }
      brokerages: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          plan_id: string | null
          primary_color: string | null
          status: Database["public"]["Enums"]["brokerage_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          plan_id?: string | null
          primary_color?: string | null
          status?: Database["public"]["Enums"]["brokerage_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          plan_id?: string | null
          primary_color?: string | null
          status?: Database["public"]["Enums"]["brokerage_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brokerages_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      client_sellers: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_primary: boolean
          seller_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_primary?: boolean
          seller_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_sellers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_sellers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          birth_date: string | null
          brokerage_id: string
          business_code: string | null
          city: string | null
          client_type: Database["public"]["Enums"]["client_type"]
          complement: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_role: string | null
          created_at: string
          financial_email: string | null
          financial_name: string | null
          id: string
          industry: string | null
          lead_source: string | null
          legal_name: string
          neighborhood: string | null
          notes: string | null
          segment: Database["public"]["Enums"]["client_segment"]
          state: string | null
          state_registration: string | null
          street: string | null
          street_number: string | null
          tax_id: string | null
          trade_name: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          birth_date?: string | null
          brokerage_id: string
          business_code?: string | null
          city?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          complement?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_role?: string | null
          created_at?: string
          financial_email?: string | null
          financial_name?: string | null
          id?: string
          industry?: string | null
          lead_source?: string | null
          legal_name: string
          neighborhood?: string | null
          notes?: string | null
          segment?: Database["public"]["Enums"]["client_segment"]
          state?: string | null
          state_registration?: string | null
          street?: string | null
          street_number?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          birth_date?: string | null
          brokerage_id?: string
          business_code?: string | null
          city?: string | null
          client_type?: Database["public"]["Enums"]["client_type"]
          complement?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_role?: string | null
          created_at?: string
          financial_email?: string | null
          financial_name?: string | null
          id?: string
          industry?: string | null
          lead_source?: string | null
          legal_name?: string
          neighborhood?: string | null
          notes?: string | null
          segment?: Database["public"]["Enums"]["client_segment"]
          state?: string | null
          state_registration?: string | null
          street?: string | null
          street_number?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
        ]
      }
      insurers: {
        Row: {
          cnpj: string | null
          contact_name: string | null
          created_at: string
          display_order: number | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          response_time_days: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string
          display_order?: number | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          response_time_days?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          cnpj?: string | null
          contact_name?: string | null
          created_at?: string
          display_order?: number | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          response_time_days?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          id: string
          max_users: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_users: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_users?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          brokerage_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          brokerage_id: string
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          brokerage_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          accessories: string | null
          brand: string | null
          brokerage_id: string
          chassis: string | null
          client_id: string
          created_at: string
          declared_value: number | null
          fipe_code: string | null
          fipe_value: number | null
          fuel_type: string | null
          has_claim_history: boolean
          has_tracker: boolean
          id: string
          identification_code: string | null
          is_active: boolean
          main_driver: string | null
          main_state: string | null
          manufacture_year: number | null
          model: string | null
          model_year: number | null
          notes: string | null
          overnight_zip_code: string | null
          plate: string
          renavam: string | null
          tracker_model: string | null
          updated_at: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"] | null
          vehicle_usage: Database["public"]["Enums"]["vehicle_usage"] | null
        }
        Insert: {
          accessories?: string | null
          brand?: string | null
          brokerage_id: string
          chassis?: string | null
          client_id: string
          created_at?: string
          declared_value?: number | null
          fipe_code?: string | null
          fipe_value?: number | null
          fuel_type?: string | null
          has_claim_history?: boolean
          has_tracker?: boolean
          id?: string
          identification_code?: string | null
          is_active?: boolean
          main_driver?: string | null
          main_state?: string | null
          manufacture_year?: number | null
          model?: string | null
          model_year?: number | null
          notes?: string | null
          overnight_zip_code?: string | null
          plate: string
          renavam?: string | null
          tracker_model?: string | null
          updated_at?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
          vehicle_usage?: Database["public"]["Enums"]["vehicle_usage"] | null
        }
        Update: {
          accessories?: string | null
          brand?: string | null
          brokerage_id?: string
          chassis?: string | null
          client_id?: string
          created_at?: string
          declared_value?: number | null
          fipe_code?: string | null
          fipe_value?: number | null
          fuel_type?: string | null
          has_claim_history?: boolean
          has_tracker?: boolean
          id?: string
          identification_code?: string | null
          is_active?: boolean
          main_driver?: string | null
          main_state?: string | null
          manufacture_year?: number | null
          model?: string | null
          model_year?: number | null
          notes?: string | null
          overnight_zip_code?: string | null
          plate?: string
          renavam?: string | null
          tracker_model?: string | null
          updated_at?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"] | null
          vehicle_usage?: Database["public"]["Enums"]["vehicle_usage"] | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_add_user: { Args: { p_brokerage_id: string }; Returns: boolean }
      get_client_brokerage_id: {
        Args: { p_client_id: string }
        Returns: string
      }
      get_my_brokerage_id: { Args: never; Returns: string }
      get_my_brokerage_id_unconditional: { Args: never; Returns: string }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_my_client: { Args: { p_client_id: string }; Returns: boolean }
    }
    Enums: {
      brokerage_status: "active" | "inactive"
      client_segment: "lead" | "active" | "vip" | "inactive"
      client_type: "individual" | "company"
      user_role:
        | "platform_admin"
        | "brokerage_admin"
        | "supervisor"
        | "seller"
        | "analyst"
        | "viewer"
      user_status: "active" | "inactive"
      vehicle_type:
        | "tow_truck"
        | "semi_trailer"
        | "heavy_truck"
        | "light_truck"
        | "bus"
        | "heavy_pickup"
        | "light_pickup"
        | "passenger_car"
        | "motorcycle"
      vehicle_usage:
        | "cargo_transport"
        | "commercial"
        | "private"
        | "tow_service"
        | "test_drive"
        | "driving_school"
        | "garbage_collector"
        | "funeral_service"
        | "walk_in_rental"
        | "contract_rental"
        | "taxi"
        | "passenger_transport"
        | "school_transport"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      brokerage_status: ["active", "inactive"],
      client_segment: ["lead", "active", "vip", "inactive"],
      client_type: ["individual", "company"],
      user_role: [
        "platform_admin",
        "brokerage_admin",
        "supervisor",
        "seller",
        "analyst",
        "viewer",
      ],
      user_status: ["active", "inactive"],
      vehicle_type: [
        "tow_truck",
        "semi_trailer",
        "heavy_truck",
        "light_truck",
        "bus",
        "heavy_pickup",
        "light_pickup",
        "passenger_car",
        "motorcycle",
      ],
      vehicle_usage: [
        "cargo_transport",
        "commercial",
        "private",
        "tow_service",
        "test_drive",
        "driving_school",
        "garbage_collector",
        "funeral_service",
        "walk_in_rental",
        "contract_rental",
        "taxi",
        "passenger_transport",
        "school_transport",
      ],
    },
  },
} as const
