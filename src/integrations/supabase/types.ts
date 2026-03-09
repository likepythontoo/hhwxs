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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_name: string | null
          target_type: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_name?: string | null
          target_type: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_name?: string | null
          target_type?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          checked_in_at: string
          event_id: string
          id: string
          student_id: string | null
          user_id: string | null
          user_name: string
        }
        Insert: {
          checked_in_at?: string
          event_id: string
          id?: string
          student_id?: string | null
          user_id?: string | null
          user_name: string
        }
        Update: {
          checked_in_at?: string
          event_id?: string
          id?: string
          student_id?: string | null
          user_id?: string | null
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      department_members: {
        Row: {
          department_id: string
          id: string
          is_head: boolean | null
          joined_at: string
          user_id: string
        }
        Insert: {
          department_id: string
          id?: string
          is_head?: boolean | null
          joined_at?: string
          user_id: string
        }
        Update: {
          department_id?: string
          id?: string
          is_head?: boolean | null
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_members_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          college: string | null
          created_at: string
          email: string | null
          event_id: string
          id: string
          name: string
          notes: string | null
          phone: string
          student_id: string | null
        }
        Insert: {
          college?: string | null
          created_at?: string
          email?: string | null
          event_id: string
          id?: string
          name: string
          notes?: string | null
          phone: string
          student_id?: string | null
        }
        Update: {
          college?: string | null
          created_at?: string
          email?: string | null
          event_id?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: string | null
          check_in_code: string | null
          created_at: string
          description: string | null
          event_date: string
          id: string
          is_active: boolean | null
          location: string | null
          max_participants: number | null
          registration_deadline: string | null
          scope: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          check_in_code?: string | null
          created_at?: string
          description?: string | null
          event_date: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_participants?: number | null
          registration_deadline?: string | null
          scope?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          check_in_code?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_participants?: number | null
          registration_deadline?: string | null
          scope?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      finances: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          id: string
          receipt_url: string | null
          recorded_by: string | null
          transaction_date: string
          type: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          id?: string
          receipt_url?: string | null
          recorded_by?: string | null
          transaction_date?: string
          type: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          receipt_url?: string | null
          recorded_by?: string | null
          transaction_date?: string
          type?: string
        }
        Relationships: []
      }
      forum_comments: {
        Row: {
          author_id: string
          author_name: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          author_name: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string
          author_name: string
          category: string | null
          content: string
          created_at: string
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          author_id: string
          author_name: string
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          author_id?: string
          author_name?: string
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      journal_articles: {
        Row: {
          created_at: string
          id: string
          journal_id: string
          section_title: string | null
          sort_order: number
          submission_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          journal_id: string
          section_title?: string | null
          sort_order?: number
          submission_id: string
        }
        Update: {
          created_at?: string
          id?: string
          journal_id?: string
          section_title?: string | null
          sort_order?: number
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_articles_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "journals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_articles_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      journals: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          issue_number: string | null
          month: number | null
          pdf_url: string | null
          table_of_contents: string | null
          title: string
          type: string
          updated_at: string
          year: number
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          issue_number?: string | null
          month?: number | null
          pdf_url?: string | null
          table_of_contents?: string | null
          title: string
          type?: string
          updated_at?: string
          year: number
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          issue_number?: string | null
          month?: number | null
          pdf_url?: string | null
          table_of_contents?: string | null
          title?: string
          type?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          email: string | null
          id: string
          is_read: boolean | null
          name: string
        }
        Insert: {
          content: string
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean | null
          name: string
        }
        Update: {
          content?: string
          created_at?: string
          email?: string | null
          id?: string
          is_read?: boolean | null
          name?: string
        }
        Relationships: []
      }
      news: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          cover_url: string | null
          created_at: string
          id: string
          is_published: boolean | null
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          display_name: string | null
          id: string
          student_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          student_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          display_name?: string | null
          id?: string
          student_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recruitment_applications: {
        Row: {
          college: string | null
          created_at: string
          department_id: string | null
          email: string | null
          id: string
          literary_works: string | null
          name: string
          phone: string
          preferred_department: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          self_intro: string | null
          status: string | null
          student_id: string | null
          updated_at: string
        }
        Insert: {
          college?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          id?: string
          literary_works?: string | null
          name: string
          phone: string
          preferred_department?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          self_intro?: string | null
          status?: string | null
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          college?: string | null
          created_at?: string
          department_id?: string | null
          email?: string | null
          id?: string
          literary_works?: string | null
          name?: string
          phone?: string
          preferred_department?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          self_intro?: string | null
          status?: string | null
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruitment_applications_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          attachment_url: string | null
          author_id: string | null
          author_name: string
          class_name: string | null
          college: string | null
          content: string
          created_at: string
          genre: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          major: string | null
          phone: string | null
          recommend_count: number | null
          reviewer_notes: string | null
          status: string | null
          student_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          author_id?: string | null
          author_name: string
          class_name?: string | null
          college?: string | null
          content: string
          created_at?: string
          genre?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          major?: string | null
          phone?: string | null
          recommend_count?: number | null
          reviewer_notes?: string | null
          status?: string | null
          student_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          author_id?: string | null
          author_name?: string
          class_name?: string | null
          college?: string | null
          content?: string
          created_at?: string
          genre?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          major?: string | null
          phone?: string | null
          recommend_count?: number | null
          reviewer_notes?: string | null
          status?: string | null
          student_id?: string | null
          title?: string
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_admin_access: { Args: { _user_id: string }; Returns: boolean }
      has_management_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_department_head: {
        Args: { _department_id: string; _user_id: string }
        Returns: boolean
      }
      validate_checkin_code: {
        Args: { p_code: string }
        Returns: {
          event_id: string
          event_title: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "minister" | "member" | "president"
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
      app_role: ["admin", "minister", "member", "president"],
    },
  },
} as const
