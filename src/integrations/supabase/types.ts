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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      book_stock: {
        Row: {
          author: string | null
          available_quantity: number
          book_title: string
          created_at: string
          grade: string | null
          id: string
          isbn: string | null
          total_quantity: number
          updated_at: string
        }
        Insert: {
          author?: string | null
          available_quantity?: number
          book_title: string
          created_at?: string
          grade?: string | null
          id?: string
          isbn?: string | null
          total_quantity?: number
          updated_at?: string
        }
        Update: {
          author?: string | null
          available_quantity?: number
          book_title?: string
          created_at?: string
          grade?: string | null
          id?: string
          isbn?: string | null
          total_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      book_transactions: {
        Row: {
          book_id: string
          compensation_fee: number | null
          condition: string | null
          created_at: string
          id: string
          notes: string | null
          quantity: number | null
          student_id: string
          tracking_number: string
          transaction_date: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          book_id: string
          compensation_fee?: number | null
          condition?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          quantity?: number | null
          student_id: string
          tracking_number: string
          transaction_date?: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          book_id?: string
          compensation_fee?: number | null
          condition?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          quantity?: number | null
          student_id?: string
          tracking_number?: string
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_transactions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "book_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          class_name: string
          class_teacher: string | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          class_name: string
          class_teacher?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          class_name?: string
          class_teacher?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      examination_marks: {
        Row: {
          academic_year: string
          created_at: string
          grade: string
          id: string
          remarks: string | null
          student_id: string
          subject_marks: Json | null
          term: string
          total_marks: number | null
          updated_at: string
        }
        Insert: {
          academic_year?: string
          created_at?: string
          grade: string
          id?: string
          remarks?: string | null
          student_id: string
          subject_marks?: Json | null
          term: string
          total_marks?: number | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          grade?: string
          id?: string
          remarks?: string | null
          student_id?: string
          subject_marks?: Json | null
          term?: string
          total_marks?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      fee_configuration: {
        Row: {
          academic_year: string
          amount: number
          created_at: string
          id: string
          term: string
          updated_at: string
        }
        Insert: {
          academic_year?: string
          amount: number
          created_at?: string
          id?: string
          term: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          amount?: number
          created_at?: string
          id?: string
          term?: string
          updated_at?: string
        }
        Relationships: []
      }
      fee_payments: {
        Row: {
          academic_year: string
          amount: number
          created_at: string
          id: string
          payment_mode: string
          student_id: string
          term: string
          transaction_code: string | null
          updated_at: string
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          academic_year?: string
          amount: number
          created_at?: string
          id?: string
          payment_mode: string
          student_id: string
          term: string
          transaction_code?: string | null
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          academic_year?: string
          amount?: number
          created_at?: string
          id?: string
          payment_mode?: string
          student_id?: string
          term?: string
          transaction_code?: string | null
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      furniture_stock: {
        Row: {
          available_quantity: number
          created_at: string
          id: string
          item_type: string
          total_quantity: number
          updated_at: string
        }
        Insert: {
          available_quantity?: number
          created_at?: string
          id?: string
          item_type: string
          total_quantity?: number
          updated_at?: string
        }
        Update: {
          available_quantity?: number
          created_at?: string
          id?: string
          item_type?: string
          total_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      furniture_transactions: {
        Row: {
          chair_quantity: number | null
          compensation_fee: number | null
          condition: string | null
          created_at: string
          id: string
          locker_quantity: number | null
          notes: string | null
          student_id: string
          tracking_number: string
          transaction_date: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          chair_quantity?: number | null
          compensation_fee?: number | null
          condition?: string | null
          created_at?: string
          id?: string
          locker_quantity?: number | null
          notes?: string | null
          student_id: string
          tracking_number: string
          transaction_date?: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          chair_quantity?: number | null
          compensation_fee?: number | null
          condition?: string | null
          created_at?: string
          id?: string
          locker_quantity?: number | null
          notes?: string | null
          student_id?: string
          tracking_number?: string
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "furniture_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_configurations: {
        Row: {
          created_at: string
          grade_letter: string
          id: string
          is_active: boolean
          max_marks: number
          min_marks: number
          points: number
          remarks: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade_letter: string
          id?: string
          is_active?: boolean
          max_marks: number
          min_marks: number
          points: number
          remarks: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade_letter?: string
          id?: string
          is_active?: boolean
          max_marks?: number
          min_marks?: number
          points?: number
          remarks?: string
          updated_at?: string
        }
        Relationships: []
      }
      laboratory_clearance: {
        Row: {
          academic_year: string | null
          breakage_recorded_at: string | null
          compensation_fee: number
          created_at: string
          damage_type: string
          grade: string | null
          id: string
          notes: string | null
          payment_date: string | null
          payment_mode: string | null
          payment_status: string
          quantity: number | null
          receipt_number: string | null
          reported_date: string
          student_id: string
          term: string | null
          tool_id: string
          tracking_number: string
          transaction_code: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          breakage_recorded_at?: string | null
          compensation_fee?: number
          created_at?: string
          damage_type: string
          grade?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_mode?: string | null
          payment_status?: string
          quantity?: number | null
          receipt_number?: string | null
          reported_date?: string
          student_id: string
          term?: string | null
          tool_id: string
          tracking_number: string
          transaction_code?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          breakage_recorded_at?: string | null
          compensation_fee?: number
          created_at?: string
          damage_type?: string
          grade?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_mode?: string | null
          payment_status?: string
          quantity?: number | null
          receipt_number?: string | null
          reported_date?: string
          student_id?: string
          term?: string | null
          tool_id?: string
          tracking_number?: string
          transaction_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_laboratory_clearance_student"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_laboratory_clearance_tool"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "laboratory_stock"
            referencedColumns: ["id"]
          },
        ]
      }
      laboratory_stock: {
        Row: {
          available_quantity: number
          category: string | null
          created_at: string
          description: string | null
          id: string
          tool_name: string
          total_quantity: number
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          available_quantity?: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          tool_name: string
          total_quantity?: number
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          available_quantity?: number
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          tool_name?: string
          total_quantity?: number
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      pin_settings: {
        Row: {
          created_at: string
          id: string
          pin_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          pin_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          pin_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_fee_records: {
        Row: {
          academic_year: string
          balance: number | null
          created_at: string
          id: string
          paid_amount: number
          payment_percentage: number | null
          required_amount: number
          student_id: string
          term: string
          updated_at: string
        }
        Insert: {
          academic_year?: string
          balance?: number | null
          created_at?: string
          id?: string
          paid_amount?: number
          payment_percentage?: number | null
          required_amount: number
          student_id: string
          term: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          balance?: number | null
          created_at?: string
          id?: string
          paid_amount?: number
          payment_percentage?: number | null
          required_amount?: number
          student_id?: string
          term?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_fee_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_subject_marks: {
        Row: {
          academic_year: string
          created_at: string
          grade: string
          id: string
          marks: number
          max_marks: number
          student_id: string
          subject_id: string
          term: string
          updated_at: string
        }
        Insert: {
          academic_year?: string
          created_at?: string
          grade: string
          id?: string
          marks?: number
          max_marks?: number
          student_id: string
          subject_id: string
          term: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          grade?: string
          id?: string
          marks?: number
          max_marks?: number
          student_id?: string
          subject_id?: string
          term?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          admission_date: string
          alternative_contact: string | null
          created_at: string
          date_of_birth: string
          gender: string
          grade: string
          id: string
          parent_name: string
          primary_contact: string
          registration_number: string
          student_name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          admission_date?: string
          alternative_contact?: string | null
          created_at?: string
          date_of_birth: string
          gender: string
          grade: string
          id?: string
          parent_name: string
          primary_contact: string
          registration_number: string
          student_name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          admission_date?: string
          alternative_contact?: string | null
          created_at?: string
          date_of_birth?: string
          gender?: string
          grade?: string
          id?: string
          parent_name?: string
          primary_contact?: string
          registration_number?: string
          student_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      subject_marks: {
        Row: {
          created_at: string | null
          exam_id: string | null
          id: string
          marks: number | null
          subject_id: string | null
        }
        Insert: {
          created_at?: string | null
          exam_id?: string | null
          id?: string
          marks?: number | null
          subject_id?: string | null
        }
        Update: {
          created_at?: string | null
          exam_id?: string | null
          id?: string
          marks?: number | null
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subject_marks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          class_teacher: string | null
          created_at: string
          id: string
          key: string
          label: string
          max_marks: number
          updated_at: string
        }
        Insert: {
          class_teacher?: string | null
          created_at?: string
          id?: string
          key: string
          label: string
          max_marks?: number
          updated_at?: string
        }
        Update: {
          class_teacher?: string | null
          created_at?: string
          id?: string
          key?: string
          label?: string
          max_marks?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_position: {
        Args: {
          p_academic_year: string
          p_grade: string
          p_student_id: string
          p_term: string
        }
        Returns: number
      }
      generate_book_tracking_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_furniture_tracking_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_lab_tracking_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_registration_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      reset_registration_sequence: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_school_system: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
