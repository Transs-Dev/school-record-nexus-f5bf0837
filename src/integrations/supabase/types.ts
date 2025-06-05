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
      examination_marks: {
        Row: {
          academic_year: string
          created_at: string
          english: number | null
          grade: string
          id: string
          ire_cre: number | null
          kiswahili: number | null
          mathematics: number | null
          remarks: string | null
          science: number | null
          social_studies: number | null
          student_id: string
          term: string
          total_marks: number | null
          updated_at: string
        }
        Insert: {
          academic_year?: string
          created_at?: string
          english?: number | null
          grade: string
          id?: string
          ire_cre?: number | null
          kiswahili?: number | null
          mathematics?: number | null
          remarks?: string | null
          science?: number | null
          social_studies?: number | null
          student_id: string
          term: string
          total_marks?: number | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          english?: number | null
          grade?: string
          id?: string
          ire_cre?: number | null
          kiswahili?: number | null
          mathematics?: number | null
          remarks?: string | null
          science?: number | null
          social_studies?: number | null
          student_id?: string
          term?: string
          total_marks?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "examination_marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_position: {
        Args: {
          p_student_id: string
          p_grade: string
          p_term: string
          p_academic_year: string
        }
        Returns: number
      }
      generate_registration_number: {
        Args: Record<PropertyKey, never>
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
