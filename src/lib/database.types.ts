export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organization_members: {
        Row: {
          organization_id: string;
          user_id: string;
          role: Database["public"]["Enums"]["organization_role"];
          created_at: string;
        };
        Insert: {
          organization_id: string;
          user_id: string;
          role?: Database["public"]["Enums"]["organization_role"];
          created_at?: string;
        };
        Update: {
          organization_id?: string;
          user_id?: string;
          role?: Database["public"]["Enums"]["organization_role"];
          created_at?: string;
        };
        Relationships: [];
      };
      stores: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          domain: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          domain?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          domain?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          organization_id: string | null;
          store_id: string | null;
          type: string;
          timestamp: string;
          session_id: string;
          product_id: string | null;
          value: number | null;
          meta: Json;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          store_id?: string | null;
          type: string;
          timestamp?: string;
          session_id: string;
          product_id?: string | null;
          value?: number | null;
          meta?: Json;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          store_id?: string | null;
          type?: string;
          timestamp?: string;
          session_id?: string;
          product_id?: string | null;
          value?: number | null;
          meta?: Json;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      organization_role: "owner" | "admin" | "member";
      billing_plan: "free" | "starter" | "pro" | "enterprise";
      billing_status: "inactive" | "trialing" | "active" | "past_due" | "canceled";
    };
    CompositeTypes: Record<string, never>;
  };
};
