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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          branch_ids: string[] | null
          content: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          notification_type:
            | Database["public"]["Enums"]["notification_type"]
            | null
          priority: number | null
          target_roles: string[] | null
          title: string
        }
        Insert: {
          branch_ids?: string[] | null
          content: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          notification_type?:
            | Database["public"]["Enums"]["notification_type"]
            | null
          priority?: number | null
          target_roles?: string[] | null
          title: string
        }
        Update: {
          branch_ids?: string[] | null
          content?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          notification_type?:
            | Database["public"]["Enums"]["notification_type"]
            | null
          priority?: number | null
          target_roles?: string[] | null
          title?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      member_credits: {
        Row: {
          balance: number | null
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      member_goals: {
        Row: {
          category: string | null
          created_at: string
          current_value: number | null
          description: string | null
          id: string
          is_active: boolean | null
          target_date: string | null
          target_unit: string | null
          target_value: number | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          target_date?: string | null
          target_unit?: string | null
          target_value?: number | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          target_date?: string | null
          target_unit?: string | null
          target_value?: number | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      member_memberships: {
        Row: {
          created_at: string
          end_date: string
          id: string
          payment_amount: number
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          plan_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["membership_status"] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          payment_amount: number
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          plan_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["membership_status"] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          payment_amount?: number
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          plan_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["membership_status"] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_memberships_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_freeze_requests: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          freeze_end_date: string | null
          freeze_fee: number | null
          freeze_start_date: string | null
          id: string
          membership_id: string | null
          reason: string
          requested_days: number
          status: Database["public"]["Enums"]["freeze_status"] | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          freeze_end_date?: string | null
          freeze_fee?: number | null
          freeze_start_date?: string | null
          id?: string
          membership_id?: string | null
          reason: string
          requested_days: number
          status?: Database["public"]["Enums"]["freeze_status"] | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          freeze_end_date?: string | null
          freeze_fee?: number | null
          freeze_start_date?: string | null
          id?: string
          membership_id?: string | null
          reason?: string
          requested_days?: number
          status?: Database["public"]["Enums"]["freeze_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_freeze_requests_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "member_memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          created_at: string
          description: string | null
          duration_months: number
          features: string[] | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_months: number
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_months?: number
          features?: string[] | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cash_amount: number | null
          created_at: string
          credit_used: number | null
          id: string
          order_number: string
          payment_method: string | null
          payment_reference: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cash_amount?: number | null
          created_at?: string
          credit_used?: number | null
          id?: string
          order_number: string
          payment_method?: string | null
          payment_reference?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cash_amount?: number | null
          created_at?: string
          credit_used?: number | null
          id?: string
          order_number?: string
          payment_method?: string | null
          payment_reference?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          member_price: number | null
          name: string
          price: number
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          member_price?: number | null
          name: string
          price: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          member_price?: number | null
          name?: string
          price?: number
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      progress_entries: {
        Row: {
          created_at: string
          goal_id: string | null
          id: string
          measurement_value: number
          notes: string | null
          photo_url: string | null
          recorded_date: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          goal_id?: string | null
          id?: string
          measurement_value: number
          notes?: string | null
          photo_url?: string | null
          recorded_date?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          goal_id?: string | null
          id?: string
          measurement_value?: number
          notes?: string | null
          photo_url?: string | null
          recorded_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_entries_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "member_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_bonuses: {
        Row: {
          amount: number
          bonus_type: Database["public"]["Enums"]["bonus_type"]
          created_at: string
          description: string | null
          id: string
          is_redeemed: boolean | null
          redeemed_at: string | null
          referral_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          bonus_type: Database["public"]["Enums"]["bonus_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_redeemed?: boolean | null
          redeemed_at?: string | null
          referral_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          bonus_type?: Database["public"]["Enums"]["bonus_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_redeemed?: boolean | null
          redeemed_at?: string | null
          referral_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_bonuses_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          membership_bonus_amount: number | null
          referral_code: string
          referred_email: string
          referred_id: string | null
          referrer_id: string | null
          signup_bonus_amount: number | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          membership_bonus_amount?: number | null
          referral_code: string
          referred_email: string
          referred_id?: string | null
          referrer_id?: string | null
          signup_bonus_amount?: number | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          membership_bonus_amount?: number | null
          referral_code?: string
          referred_email?: string
          referred_id?: string | null
          referrer_id?: string | null
          signup_bonus_amount?: number | null
          status?: string | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          announcement_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          read_at: string | null
          user_id: string | null
        }
        Insert: {
          announcement_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          user_id?: string | null
        }
        Update: {
          announcement_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      bonus_type: "referral_signup" | "referral_membership" | "loyalty_points"
      freeze_status: "pending" | "approved" | "rejected" | "active"
      membership_status: "active" | "expired" | "frozen" | "cancelled"
      notification_type: "announcement" | "system" | "membership" | "referral"
      order_status: "pending" | "completed" | "cancelled" | "refunded"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      redemption_type:
        | "pos_purchase"
        | "membership_extension"
        | "cash_equivalent"
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
      bonus_type: ["referral_signup", "referral_membership", "loyalty_points"],
      freeze_status: ["pending", "approved", "rejected", "active"],
      membership_status: ["active", "expired", "frozen", "cancelled"],
      notification_type: ["announcement", "system", "membership", "referral"],
      order_status: ["pending", "completed", "cancelled", "refunded"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      redemption_type: [
        "pos_purchase",
        "membership_extension",
        "cash_equivalent",
      ],
    },
  },
} as const
