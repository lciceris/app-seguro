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
          business_code: string | null
          city: string | null
          complement: string | null
          created_at: string
          email: string | null
          financial_email: string | null
          financial_name: string | null
          id: string
          logo_url: string | null
          name: string
          neighborhood: string | null
          phone: string | null
          plan_expires_at: string | null
          plan_id: string | null
          primary_color: string | null
          representative_email: string | null
          representative_name: string | null
          state: string | null
          state_registration: string | null
          status: Database["public"]["Enums"]["brokerage_status"]
          street: string | null
          street_number: string | null
          tax_id: string | null
          trade_name: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          business_code?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          email?: string | null
          financial_email?: string | null
          financial_name?: string | null
          id?: string
          logo_url?: string | null
          name: string
          neighborhood?: string | null
          phone?: string | null
          plan_expires_at?: string | null
          plan_id?: string | null
          primary_color?: string | null
          representative_email?: string | null
          representative_name?: string | null
          state?: string | null
          state_registration?: string | null
          status?: Database["public"]["Enums"]["brokerage_status"]
          street?: string | null
          street_number?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          business_code?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          email?: string | null
          financial_email?: string | null
          financial_name?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          neighborhood?: string | null
          phone?: string | null
          plan_expires_at?: string | null
          plan_id?: string | null
          primary_color?: string | null
          representative_email?: string | null
          representative_name?: string | null
          state?: string | null
          state_registration?: string | null
          status?: Database["public"]["Enums"]["brokerage_status"]
          street?: string | null
          street_number?: string | null
          tax_id?: string | null
          trade_name?: string | null
          updated_at?: string
          zip_code?: string | null
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
          cnpj: string
          contact_name: string | null
          created_at: string
          display_order: number | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          notes: string | null
          phone: string | null
          response_time_days: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          cnpj: string
          contact_name?: string | null
          created_at?: string
          display_order?: number | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          response_time_days?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          cnpj?: string
          contact_name?: string | null
          created_at?: string
          display_order?: number | null
          email?: string | null
          id?: string
          logo_url?: string | null
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
      policies: {
        Row: {
          brokerage_id: string
          client_id: string
          coverage_end: string | null
          coverage_start: string | null
          created_at: string
          id: string
          insurer_id: string
          policy_number: string | null
          premium_amount: number | null
          previous_version_id: string | null
          quotation_id: string
          renewed_from_policy_id: string | null
          root_policy_id: string | null
          status: Database["public"]["Enums"]["policy_status"]
          total_fleet_value: number | null
          updated_at: string
        }
        Insert: {
          brokerage_id: string
          client_id: string
          coverage_end?: string | null
          coverage_start?: string | null
          created_at?: string
          id?: string
          insurer_id: string
          policy_number?: string | null
          premium_amount?: number | null
          previous_version_id?: string | null
          quotation_id: string
          renewed_from_policy_id?: string | null
          root_policy_id?: string | null
          status?: Database["public"]["Enums"]["policy_status"]
          total_fleet_value?: number | null
          updated_at?: string
        }
        Update: {
          brokerage_id?: string
          client_id?: string
          coverage_end?: string | null
          coverage_start?: string | null
          created_at?: string
          id?: string
          insurer_id?: string
          policy_number?: string | null
          premium_amount?: number | null
          previous_version_id?: string | null
          quotation_id?: string
          renewed_from_policy_id?: string | null
          root_policy_id?: string | null
          status?: Database["public"]["Enums"]["policy_status"]
          total_fleet_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policies_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_insurer_id_fkey"
            columns: ["insurer_id"]
            isOneToOne: false
            referencedRelation: "insurers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_renewed_from_policy_id_fkey"
            columns: ["renewed_from_policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_root_policy_id_fkey"
            columns: ["root_policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          policy_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          policy_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          policy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_attachments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_endorsements: {
        Row: {
          app_death: number | null
          app_disability: number | null
          armoring_value: number | null
          assistance: string | null
          bodywork_type: string | null
          bodywork_value: number | null
          bonus: number | null
          brokerage_id: string
          casco_percentage: number | null
          casco_value: number | null
          claims_count: number | null
          client_responded_at: string | null
          client_responded_by: string | null
          client_response_notes: string | null
          coverage_type: Database["public"]["Enums"]["coverage_type"] | null
          created_at: string
          description: string | null
          effected_at: string | null
          effected_by: string | null
          endorsement_type: Database["public"]["Enums"]["policy_endorsement_type"]
          equipment_type: string | null
          equipment_value: number | null
          franchise_type: Database["public"]["Enums"]["franchise_type"] | null
          glass_coverage:
            | Database["public"]["Enums"]["glass_coverage_level"]
            | null
          id: string
          insurer_response_notes: string | null
          new_coverage_end: string | null
          new_coverage_start: string | null
          new_policy_id: string | null
          new_policy_number: string | null
          new_premium_amount: number | null
          new_total_fleet_value: number | null
          not_closed_reason: string | null
          policy_id: string
          premium_adjustment: number | null
          rcf_dc: number | null
          rcf_dm: number | null
          rcf_dmo: number | null
          reserve_car: string | null
          responded_at: string | null
          responded_by: string | null
          seller_id: string | null
          status: Database["public"]["Enums"]["policy_endorsement_status"]
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          app_death?: number | null
          app_disability?: number | null
          armoring_value?: number | null
          assistance?: string | null
          bodywork_type?: string | null
          bodywork_value?: number | null
          bonus?: number | null
          brokerage_id: string
          casco_percentage?: number | null
          casco_value?: number | null
          claims_count?: number | null
          client_responded_at?: string | null
          client_responded_by?: string | null
          client_response_notes?: string | null
          coverage_type?: Database["public"]["Enums"]["coverage_type"] | null
          created_at?: string
          description?: string | null
          effected_at?: string | null
          effected_by?: string | null
          endorsement_type: Database["public"]["Enums"]["policy_endorsement_type"]
          equipment_type?: string | null
          equipment_value?: number | null
          franchise_type?: Database["public"]["Enums"]["franchise_type"] | null
          glass_coverage?:
            | Database["public"]["Enums"]["glass_coverage_level"]
            | null
          id?: string
          insurer_response_notes?: string | null
          new_coverage_end?: string | null
          new_coverage_start?: string | null
          new_policy_id?: string | null
          new_policy_number?: string | null
          new_premium_amount?: number | null
          new_total_fleet_value?: number | null
          not_closed_reason?: string | null
          policy_id: string
          premium_adjustment?: number | null
          rcf_dc?: number | null
          rcf_dm?: number | null
          rcf_dmo?: number | null
          reserve_car?: string | null
          responded_at?: string | null
          responded_by?: string | null
          seller_id?: string | null
          status?: Database["public"]["Enums"]["policy_endorsement_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          app_death?: number | null
          app_disability?: number | null
          armoring_value?: number | null
          assistance?: string | null
          bodywork_type?: string | null
          bodywork_value?: number | null
          bonus?: number | null
          brokerage_id?: string
          casco_percentage?: number | null
          casco_value?: number | null
          claims_count?: number | null
          client_responded_at?: string | null
          client_responded_by?: string | null
          client_response_notes?: string | null
          coverage_type?: Database["public"]["Enums"]["coverage_type"] | null
          created_at?: string
          description?: string | null
          effected_at?: string | null
          effected_by?: string | null
          endorsement_type?: Database["public"]["Enums"]["policy_endorsement_type"]
          equipment_type?: string | null
          equipment_value?: number | null
          franchise_type?: Database["public"]["Enums"]["franchise_type"] | null
          glass_coverage?:
            | Database["public"]["Enums"]["glass_coverage_level"]
            | null
          id?: string
          insurer_response_notes?: string | null
          new_coverage_end?: string | null
          new_coverage_start?: string | null
          new_policy_id?: string | null
          new_policy_number?: string | null
          new_premium_amount?: number | null
          new_total_fleet_value?: number | null
          not_closed_reason?: string | null
          policy_id?: string
          premium_adjustment?: number | null
          rcf_dc?: number | null
          rcf_dm?: number | null
          rcf_dmo?: number | null
          reserve_car?: string | null
          responded_at?: string | null
          responded_by?: string | null
          seller_id?: string | null
          status?: Database["public"]["Enums"]["policy_endorsement_status"]
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_endorsements_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_endorsements_client_responded_by_fkey"
            columns: ["client_responded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_endorsements_effected_by_fkey"
            columns: ["effected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_endorsements_new_policy_id_fkey"
            columns: ["new_policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_endorsements_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_endorsements_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_endorsements_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_endorsements_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_vehicles: {
        Row: {
          app_death: number | null
          app_disability: number | null
          armoring_value: number | null
          assistance: string | null
          bodywork_type: string | null
          bodywork_value: number | null
          bonus: number | null
          casco_percentage: number | null
          casco_value: number | null
          claims_count: number | null
          coverage_type: Database["public"]["Enums"]["coverage_type"] | null
          equipment_type: string | null
          equipment_value: number | null
          franchise_type: Database["public"]["Enums"]["franchise_type"] | null
          glass_coverage:
            | Database["public"]["Enums"]["glass_coverage_level"]
            | null
          policy_id: string
          rcf_dc: number | null
          rcf_dm: number | null
          rcf_dmo: number | null
          reserve_car: string | null
          vehicle_id: string
        }
        Insert: {
          app_death?: number | null
          app_disability?: number | null
          armoring_value?: number | null
          assistance?: string | null
          bodywork_type?: string | null
          bodywork_value?: number | null
          bonus?: number | null
          casco_percentage?: number | null
          casco_value?: number | null
          claims_count?: number | null
          coverage_type?: Database["public"]["Enums"]["coverage_type"] | null
          equipment_type?: string | null
          equipment_value?: number | null
          franchise_type?: Database["public"]["Enums"]["franchise_type"] | null
          glass_coverage?:
            | Database["public"]["Enums"]["glass_coverage_level"]
            | null
          policy_id: string
          rcf_dc?: number | null
          rcf_dm?: number | null
          rcf_dmo?: number | null
          reserve_car?: string | null
          vehicle_id: string
        }
        Update: {
          app_death?: number | null
          app_disability?: number | null
          armoring_value?: number | null
          assistance?: string | null
          bodywork_type?: string | null
          bodywork_value?: number | null
          bonus?: number | null
          casco_percentage?: number | null
          casco_value?: number | null
          claims_count?: number | null
          coverage_type?: Database["public"]["Enums"]["coverage_type"] | null
          equipment_type?: string | null
          equipment_value?: number | null
          franchise_type?: Database["public"]["Enums"]["franchise_type"] | null
          glass_coverage?:
            | Database["public"]["Enums"]["glass_coverage_level"]
            | null
          policy_id?: string
          rcf_dc?: number | null
          rcf_dm?: number | null
          rcf_dmo?: number | null
          reserve_car?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "policy_vehicles_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_insurer_events: {
        Row: {
          author_id: string | null
          brokerage_id: string
          content: string
          created_at: string
          event_type: Database["public"]["Enums"]["quotation_event_type"]
          field_changed: string | null
          id: string
          new_value: string | null
          old_value: string | null
          quotation_insurer_id: string
        }
        Insert: {
          author_id?: string | null
          brokerage_id: string
          content: string
          created_at?: string
          event_type: Database["public"]["Enums"]["quotation_event_type"]
          field_changed?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          quotation_insurer_id: string
        }
        Update: {
          author_id?: string | null
          brokerage_id?: string
          content?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["quotation_event_type"]
          field_changed?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          quotation_insurer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_insurer_events_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_insurer_events_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_insurer_events_quotation_insurer_id_fkey"
            columns: ["quotation_insurer_id"]
            isOneToOne: false
            referencedRelation: "quotation_insurers"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_insurers: {
        Row: {
          analyst_notes: string | null
          approved_coverages: string | null
          brokerage_id: string
          commission_rate: number | null
          created_at: string
          deductible_amount: number | null
          id: string
          installments_count: number | null
          insurer_id: string
          insurer_quotation_number: string | null
          is_winner: boolean
          premium_amount: number | null
          quotation_id: string
          responded_at: string | null
          response_status: Database["public"]["Enums"]["insurer_response_status"]
        }
        Insert: {
          analyst_notes?: string | null
          approved_coverages?: string | null
          brokerage_id: string
          commission_rate?: number | null
          created_at?: string
          deductible_amount?: number | null
          id?: string
          installments_count?: number | null
          insurer_id: string
          insurer_quotation_number?: string | null
          is_winner?: boolean
          premium_amount?: number | null
          quotation_id: string
          responded_at?: string | null
          response_status?: Database["public"]["Enums"]["insurer_response_status"]
        }
        Update: {
          analyst_notes?: string | null
          approved_coverages?: string | null
          brokerage_id?: string
          commission_rate?: number | null
          created_at?: string
          deductible_amount?: number | null
          id?: string
          installments_count?: number | null
          insurer_id?: string
          insurer_quotation_number?: string | null
          is_winner?: boolean
          premium_amount?: number | null
          quotation_id?: string
          responded_at?: string | null
          response_status?: Database["public"]["Enums"]["insurer_response_status"]
        }
        Relationships: [
          {
            foreignKeyName: "quotation_insurers_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_insurers_insurer_id_fkey"
            columns: ["insurer_id"]
            isOneToOne: false
            referencedRelation: "insurers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_insurers_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_number_counters: {
        Row: {
          brokerage_id: string
          last_number: number
          year: number
        }
        Insert: {
          brokerage_id: string
          last_number?: number
          year: number
        }
        Update: {
          brokerage_id?: string
          last_number?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_number_counters_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_qar: {
        Row: {
          brokerage_id: string
          cargo_category: string | null
          cargo_type: string | null
          circulation_regions: string[] | null
          current_policy_expiry: string | null
          desired_premium: number | null
          has_cargo: boolean | null
          has_defensive_driving: boolean | null
          has_logo_or_special_paint: boolean | null
          has_preventive_maintenance: boolean | null
          has_risk_management: boolean | null
          has_tracker: boolean | null
          id: string
          insurance_type: Database["public"]["Enums"]["quotation_type"] | null
          previous_premium: number | null
          quotation_id: string
          renewal_insurer_id: string | null
          renewal_insurer_name: string | null
          renewed_policy_id: string | null
          sinistralidade: string | null
        }
        Insert: {
          brokerage_id: string
          cargo_category?: string | null
          cargo_type?: string | null
          circulation_regions?: string[] | null
          current_policy_expiry?: string | null
          desired_premium?: number | null
          has_cargo?: boolean | null
          has_defensive_driving?: boolean | null
          has_logo_or_special_paint?: boolean | null
          has_preventive_maintenance?: boolean | null
          has_risk_management?: boolean | null
          has_tracker?: boolean | null
          id?: string
          insurance_type?: Database["public"]["Enums"]["quotation_type"] | null
          previous_premium?: number | null
          quotation_id: string
          renewal_insurer_id?: string | null
          renewal_insurer_name?: string | null
          renewed_policy_id?: string | null
          sinistralidade?: string | null
        }
        Update: {
          brokerage_id?: string
          cargo_category?: string | null
          cargo_type?: string | null
          circulation_regions?: string[] | null
          current_policy_expiry?: string | null
          desired_premium?: number | null
          has_cargo?: boolean | null
          has_defensive_driving?: boolean | null
          has_logo_or_special_paint?: boolean | null
          has_preventive_maintenance?: boolean | null
          has_risk_management?: boolean | null
          has_tracker?: boolean | null
          id?: string
          insurance_type?: Database["public"]["Enums"]["quotation_type"] | null
          previous_premium?: number | null
          quotation_id?: string
          renewal_insurer_id?: string | null
          renewal_insurer_name?: string | null
          renewed_policy_id?: string | null
          sinistralidade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_qar_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_qar_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: true
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_qar_renewal_insurer_id_fkey"
            columns: ["renewal_insurer_id"]
            isOneToOne: false
            referencedRelation: "insurers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_qar_renewed_policy_id_fkey"
            columns: ["renewed_policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_qar_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          quotation_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          quotation_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          quotation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_qar_attachments_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_vehicles: {
        Row: {
          app_death: number | null
          app_disability: number | null
          armoring_value: number | null
          assistance: string | null
          bodywork_type: string | null
          bodywork_value: number | null
          bonus: number | null
          casco_percentage: number | null
          casco_value: number | null
          claims_count: number | null
          coverage_type: Database["public"]["Enums"]["coverage_type"] | null
          equipment_type: string | null
          equipment_value: number | null
          franchise_type: Database["public"]["Enums"]["franchise_type"] | null
          glass_coverage:
            | Database["public"]["Enums"]["glass_coverage_level"]
            | null
          quotation_id: string
          rcf_dc: number | null
          rcf_dm: number | null
          rcf_dmo: number | null
          reserve_car: string | null
          vehicle_id: string
        }
        Insert: {
          app_death?: number | null
          app_disability?: number | null
          armoring_value?: number | null
          assistance?: string | null
          bodywork_type?: string | null
          bodywork_value?: number | null
          bonus?: number | null
          casco_percentage?: number | null
          casco_value?: number | null
          claims_count?: number | null
          coverage_type?: Database["public"]["Enums"]["coverage_type"] | null
          equipment_type?: string | null
          equipment_value?: number | null
          franchise_type?: Database["public"]["Enums"]["franchise_type"] | null
          glass_coverage?:
            | Database["public"]["Enums"]["glass_coverage_level"]
            | null
          quotation_id: string
          rcf_dc?: number | null
          rcf_dm?: number | null
          rcf_dmo?: number | null
          reserve_car?: string | null
          vehicle_id: string
        }
        Update: {
          app_death?: number | null
          app_disability?: number | null
          armoring_value?: number | null
          assistance?: string | null
          bodywork_type?: string | null
          bodywork_value?: number | null
          bonus?: number | null
          casco_percentage?: number | null
          casco_value?: number | null
          claims_count?: number | null
          coverage_type?: Database["public"]["Enums"]["coverage_type"] | null
          equipment_type?: string | null
          equipment_value?: number | null
          franchise_type?: Database["public"]["Enums"]["franchise_type"] | null
          glass_coverage?:
            | Database["public"]["Enums"]["glass_coverage_level"]
            | null
          quotation_id?: string
          rcf_dc?: number | null
          rcf_dm?: number | null
          rcf_dmo?: number | null
          reserve_car?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotation_vehicles_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_vehicles_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          analyst_id: string | null
          brokerage_id: string
          client_id: string
          coverage_end: string | null
          coverage_start: string | null
          coverages: string[] | null
          created_at: string
          deductible_pref: string | null
          due_date: string | null
          id: string
          lost_reason: string | null
          number: string
          quotation_type: Database["public"]["Enums"]["quotation_type"] | null
          seller_id: string | null
          seller_notes: string | null
          status: Database["public"]["Enums"]["quotation_status"]
          updated_at: string
        }
        Insert: {
          analyst_id?: string | null
          brokerage_id: string
          client_id: string
          coverage_end?: string | null
          coverage_start?: string | null
          coverages?: string[] | null
          created_at?: string
          deductible_pref?: string | null
          due_date?: string | null
          id?: string
          lost_reason?: string | null
          number: string
          quotation_type?: Database["public"]["Enums"]["quotation_type"] | null
          seller_id?: string | null
          seller_notes?: string | null
          status?: Database["public"]["Enums"]["quotation_status"]
          updated_at?: string
        }
        Update: {
          analyst_id?: string | null
          brokerage_id?: string
          client_id?: string
          coverage_end?: string | null
          coverage_start?: string | null
          coverages?: string[] | null
          created_at?: string
          deductible_pref?: string | null
          due_date?: string | null
          id?: string
          lost_reason?: string | null
          number?: string
          quotation_type?: Database["public"]["Enums"]["quotation_type"] | null
          seller_id?: string | null
          seller_notes?: string | null
          status?: Database["public"]["Enums"]["quotation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_analyst_id_fkey"
            columns: ["analyst_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_brokerage_id_fkey"
            columns: ["brokerage_id"]
            isOneToOne: false
            referencedRelation: "brokerages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      count_active_users: { Args: { p_brokerage_id: string }; Returns: number }
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
      get_policy_brokerage_id: {
        Args: { p_policy_id: string }
        Returns: string
      }
      get_quotation_brokerage_id: {
        Args: { p_quotation_id: string }
        Returns: string
      }
      is_my_client: { Args: { p_client_id: string }; Returns: boolean }
      is_my_policy_client: { Args: { p_policy_id: string }; Returns: boolean }
      is_my_quotation: { Args: { p_quotation_id: string }; Returns: boolean }
      is_my_quotation_insurer: {
        Args: { p_quotation_insurer_id: string }
        Returns: boolean
      }
    }
    Enums: {
      brokerage_status: "active" | "inactive"
      client_segment: "lead" | "active" | "vip" | "inactive"
      client_type: "individual" | "company"
      coverage_type: "rcf" | "total" | "vd"
      franchise_type: "normal" | "reduced"
      glass_coverage_level: "basic" | "complete" | "armored"
      insurer_response_status:
        | "pending"
        | "accepted"
        | "declined"
        | "waiting_info"
      policy_endorsement_status:
        | "waiting"
        | "presented"
        | "client_accepted"
        | "effected"
        | "not_closed"
      policy_endorsement_type:
        | "vehicle_inclusion"
        | "vehicle_exclusion"
        | "coverage_change"
        | "extension"
        | "administrative_correction"
        | "cancellation"
      policy_status: "active" | "cancelled" | "renewed" | "superseded"
      quotation_event_type: "comment" | "system"
      quotation_status:
        | "waiting"
        | "in_progress"
        | "in_negotiation"
        | "presented"
        | "waiting_effect"
        | "client_accepted"
        | "effected"
        | "not_closed"
      quotation_type: "new" | "renewal"
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
      coverage_type: ["rcf", "total", "vd"],
      franchise_type: ["normal", "reduced"],
      glass_coverage_level: ["basic", "complete", "armored"],
      insurer_response_status: [
        "pending",
        "accepted",
        "declined",
        "waiting_info",
      ],
      policy_endorsement_status: [
        "waiting",
        "presented",
        "client_accepted",
        "effected",
        "not_closed",
      ],
      policy_endorsement_type: [
        "vehicle_inclusion",
        "vehicle_exclusion",
        "coverage_change",
        "extension",
        "administrative_correction",
        "cancellation",
      ],
      policy_status: ["active", "cancelled", "renewed", "superseded"],
      quotation_event_type: ["comment", "system"],
      quotation_status: [
        "waiting",
        "in_progress",
        "in_negotiation",
        "presented",
        "waiting_effect",
        "client_accepted",
        "effected",
        "not_closed",
      ],
      quotation_type: ["new", "renewal"],
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
