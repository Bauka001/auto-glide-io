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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      car_views: {
        Row: {
          car_id: string
          created_at: string
          id: string
          viewer_id: string | null
        }
        Insert: {
          car_id: string
          created_at?: string
          id?: string
          viewer_id?: string | null
        }
        Update: {
          car_id?: string
          created_at?: string
          id?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_views_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          body_type: string
          brand: string
          category: string
          city: string
          color: string
          condition: string
          created_at: string
          customs_cleared: boolean
          dealer_id: string | null
          drive: string
          engine: string
          engine_volume: number
          fuel: string
          generation: string
          id: string
          image_key: string | null
          image_url: string | null
          is_published: boolean
          mileage: number
          model: string
          owner_id: string | null
          price: number
          slug: string | null
          steering: string
          transmission: string
          trim: string
          updated_at: string
          vin: string | null
          year: number
        }
        Insert: {
          body_type?: string
          brand: string
          category?: string
          city?: string
          color?: string
          condition?: string
          created_at?: string
          customs_cleared?: boolean
          dealer_id?: string | null
          drive?: string
          engine?: string
          engine_volume?: number
          fuel?: string
          generation?: string
          id?: string
          image_key?: string | null
          image_url?: string | null
          is_published?: boolean
          mileage?: number
          model: string
          owner_id?: string | null
          price: number
          slug?: string | null
          steering?: string
          transmission?: string
          trim?: string
          updated_at?: string
          vin?: string | null
          year: number
        }
        Update: {
          body_type?: string
          brand?: string
          category?: string
          city?: string
          color?: string
          condition?: string
          created_at?: string
          customs_cleared?: boolean
          dealer_id?: string | null
          drive?: string
          engine?: string
          engine_volume?: number
          fuel?: string
          generation?: string
          id?: string
          image_key?: string | null
          image_url?: string | null
          is_published?: boolean
          mileage?: number
          model?: string
          owner_id?: string | null
          price?: number
          slug?: string | null
          steering?: string
          transmission?: string
          trim?: string
          updated_at?: string
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cars_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          buyer_id: string
          car_id: string | null
          created_at: string
          dealer_id: string | null
          id: string
          last_message: string
          seller_id: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          car_id?: string | null
          created_at?: string
          dealer_id?: string | null
          id?: string
          last_message?: string
          seller_id: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          car_id?: string | null
          created_at?: string
          dealer_id?: string | null
          id?: string
          last_message?: string
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_reviews: {
        Row: {
          comment: string
          created_at: string
          dealer_id: string
          id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string
          created_at?: string
          dealer_id: string
          id?: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          dealer_id?: string
          id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dealer_reviews_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealers: {
        Row: {
          about: string
          address: string
          city: string
          cover_url: string | null
          created_at: string
          hours: string
          id: string
          is_blocked: boolean
          is_verified: boolean
          logo_url: string | null
          name: string
          owner_id: string
          phone: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          about?: string
          address?: string
          city?: string
          cover_url?: string | null
          created_at?: string
          hours?: string
          id?: string
          is_blocked?: boolean
          is_verified?: boolean
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          about?: string
          address?: string
          city?: string
          cover_url?: string | null
          created_at?: string
          hours?: string
          id?: string
          is_blocked?: boolean
          is_verified?: boolean
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          car_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          car_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          car_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          car_id: string | null
          created_at: string
          currency: string
          details: Json
          id: string
          provider: string
          provider_ref: string | null
          purpose: string
          request_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          car_id?: string | null
          created_at?: string
          currency?: string
          details?: Json
          id?: string
          provider?: string
          provider_ref?: string | null
          purpose?: string
          request_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          car_id?: string | null
          created_at?: string
          currency?: string
          details?: Json
          id?: string
          provider?: string
          provider_ref?: string | null
          purpose?: string
          request_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          car_id: string | null
          created_at: string
          details: Json
          id: string
          status: Database["public"]["Enums"]["request_status"]
          type: Database["public"]["Enums"]["request_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          car_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          status?: Database["public"]["Enums"]["request_status"]
          type: Database["public"]["Enums"]["request_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          car_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          status?: Database["public"]["Enums"]["request_status"]
          type?: Database["public"]["Enums"]["request_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          car_id: string | null
          courier_name: string
          courier_phone: string
          created_at: string
          distance_km: number
          eta_date: string | null
          from_city: string
          id: string
          payment_id: string | null
          price: number
          request_id: string | null
          status: Database["public"]["Enums"]["shipment_status"]
          tariff: string
          to_city: string
          updated_at: string
          user_id: string
        }
        Insert: {
          car_id?: string | null
          courier_name?: string
          courier_phone?: string
          created_at?: string
          distance_km?: number
          eta_date?: string | null
          from_city?: string
          id?: string
          payment_id?: string | null
          price?: number
          request_id?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          tariff?: string
          to_city?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          car_id?: string | null
          courier_name?: string
          courier_phone?: string
          created_at?: string
          distance_km?: number
          eta_date?: string | null
          from_city?: string
          id?: string
          payment_id?: string | null
          price?: number
          request_id?: string | null
          status?: Database["public"]["Enums"]["shipment_status"]
          tariff?: string
          to_city?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
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
      register_car_view: { Args: { _car_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "dealer" | "user"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      request_status:
        | "submitted"
        | "in_review"
        | "approved"
        | "rejected"
        | "completed"
      request_type: "credit" | "delivery" | "insurance"
      shipment_status:
        | "created"
        | "paid"
        | "preparing"
        | "in_transit"
        | "arrived"
        | "delivered"
        | "cancelled"
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
      app_role: ["admin", "dealer", "user"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      request_status: [
        "submitted",
        "in_review",
        "approved",
        "rejected",
        "completed",
      ],
      request_type: ["credit", "delivery", "insurance"],
      shipment_status: [
        "created",
        "paid",
        "preparing",
        "in_transit",
        "arrived",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
