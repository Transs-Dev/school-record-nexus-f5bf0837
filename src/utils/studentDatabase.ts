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

export const addStudent = async (student: Omit<Student, "id" | "created_at" | "updated_at">): Promise<Student> => {
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

// Export insertStudent as an alias for addStudent for backward compatibility
export const insertStudent = addStudent;

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

// Add the missing getStudents export (alias for fetchAllStudents)
export const getStudents = fetchAllStudents;

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
  console.log("Attempting to save examination marks:", examData);
  
  try {
    // First check if a record already exists
    const { data: existingRecord, error: fetchError } = await supabase
      .from("examination_marks")
      .select("id")
      .eq("student_id", examData.student_id)
      .eq("grade", examData.grade)
      .eq("term", examData.term)
      .eq("academic_year", examData.academic_year)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking existing record:", fetchError);
      throw fetchError;
    }

    let result;
    
    if (existingRecord) {
      // Update existing record
      console.log("Updating existing examination marks record:", existingRecord.id);
      const { data, error } = await supabase
        .from("examination_marks")
        .update({
          subject_marks: examData.subject_marks as any,
          total_marks: examData.total_marks,
          remarks: examData.remarks,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingRecord.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new record
      console.log("Inserting new examination marks record");
      const { data, error } = await supabase
        .from("examination_marks")
        .insert({
          student_id: examData.student_id,
          grade: examData.grade,
          term: examData.term,
          academic_year: examData.academic_year,
          subject_marks: examData.subject_marks as any,
          total_marks: examData.total_marks,
          remarks: examData.remarks
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    console.log("Successfully saved examination marks:", result);
    return result;
  } catch (error) {
    console.error("Exception in saveExaminationMarks:", error);
    throw error;
  }
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

export const calculateStudentPosition = async (studentId: string, grade: string, term: string, academicYear: string): Promise<number> => {
  try {
    // First get the student's total marks
    const { data: studentMark, error: studentError } = await supabase
      .from("examination_marks")
      .select("total_marks")
      .eq("student_id", studentId)
      .eq("grade", grade)
      .eq("term", term)
      .eq("academic_year", academicYear)
      .single();

    if (studentError || !studentMark) {
      console.error("Error fetching student marks:", studentError);
      return 0;
    }

    // Get all students' marks for the same grade, term, and academic year
    const { data: allMarks, error: allMarksError } = await supabase
      .from("examination_marks")
      .select("total_marks")
      .eq("grade", grade)
      .eq("term", term)
      .eq("academic_year", academicYear)
      .order("total_marks", { ascending: false });

    if (allMarksError) {
      console.error("Error fetching all marks:", allMarksError);
      return 0;
    }

    // Calculate position
    const position = (allMarks || []).findIndex(mark => mark.total_marks <= studentMark.total_marks) + 1;
    return position || 1;
  } catch (error) {
    console.error("Error calculating student position:", error);
    return 0;
  }
};

export const printStudentList = async (students: Student[]): Promise<void> => {
  // Create a simple printable version
  const printContent = students.map(student => 
    `${student.registration_number} - ${student.student_name} (${student.grade})`
  ).join('\n');
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head><title>Student List</title></head>
        <body>
          <h1>Student List</h1>
          <pre>${printContent}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
};

export const downloadStudentList = async (students: Student[]): Promise<void> => {
  const csvContent = [
    'Registration Number,Student Name,Grade,Date of Birth,Parent Name,Primary Contact',
    ...students.map(student => 
      `${student.registration_number},${student.student_name},${student.grade},${student.date_of_birth},${student.parent_name},${student.primary_contact}`
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'student_list.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
