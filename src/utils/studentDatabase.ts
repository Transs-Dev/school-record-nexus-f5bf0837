
import { supabase } from "@/integrations/supabase/client";
import { type Database } from "@/integrations/supabase/types";

export type Student = Database["public"]["Tables"]["students"]["Row"];
export type ExaminationMark = Database["public"]["Tables"]["examination_marks"]["Row"];

export interface SubjectMark {
  subject_id: string;
  marks: number;
}

export interface ExamData {
  student_id: string;
  grade: string;
  term: string;
  academic_year: string;
  subject_marks: SubjectMark[];
  total_marks: number;
  remarks?: string;
}

export const addStudent = async (student: Omit<Student, "id" | "created_at" | "updated_at" | "registration_number">): Promise<Student> => {
  const { data, error } = await supabase
    .from("students")
    .insert([student])
    .select()
    .single();

  if (error) {
    console.error("Error adding student:", error);
    throw error;
  }

  return data;
};

export const fetchAllStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("student_name");

  if (error) {
    console.error("Error fetching students:", error);
    throw error;
  }

  return data || [];
};

export const fetchStudentsByGrade = async (grade: string): Promise<Student[]> => {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("grade", grade)
    .order("student_name");

  if (error) {
    console.error("Error fetching students by grade:", error);
    throw error;
  }

  return data || [];
};

export const updateStudent = async (id: string, updates: Partial<Omit<Student, "id" | "created_at" | "updated_at">>): Promise<Student> => {
  const { data, error } = await supabase
    .from("students")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating student:", error);
    throw error;
  }

  return data;
};

export const deleteStudent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
};

export const saveExaminationMarks = async (examData: ExamData): Promise<ExaminationMark> => {
  const { data, error } = await supabase
    .from("examination_marks")
    .upsert({
      student_id: examData.student_id,
      grade: examData.grade,
      term: examData.term,
      academic_year: examData.academic_year,
      subject_marks: examData.subject_marks,
      total_marks: examData.total_marks,
      remarks: examData.remarks
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving examination marks:", error);
    throw error;
  }

  return data;
};

export const fetchExaminationMarks = async (grade: string, term: string, academicYear: string): Promise<ExaminationMark[]> => {
  const { data, error } = await supabase
    .from("examination_marks")
    .select("*")
    .eq("grade", grade)
    .eq("term", term)
    .eq("academic_year", academicYear)
    .order("total_marks", { ascending: false });

  if (error) {
    console.error("Error fetching examination marks:", error);
    throw error;
  }

  return data || [];
};

export const getTotalStudentCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error counting students:", error);
    throw error;
  }

  return count || 0;
};

export const getStudentCountByGrade = async (): Promise<Record<string, number>> => {
  const { data, error } = await supabase
    .from("students")
    .select("grade");

  if (error) {
    console.error("Error fetching students by grade:", error);
    throw error;
  }

  const gradeCount: Record<string, number> = {};
  data?.forEach((student) => {
    gradeCount[student.grade] = (gradeCount[student.grade] || 0) + 1;
  });

  return gradeCount;
};
