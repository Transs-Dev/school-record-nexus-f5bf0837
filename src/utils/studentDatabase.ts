
import { supabase } from "@/integrations/supabase/client";

export interface Student {
  id?: string;
  registration_number?: string;
  student_name: string;
  grade: string;
  date_of_birth: string;
  parent_name: string;
  address?: string;
  primary_contact: string;
  alternative_contact?: string;
  gender: 'Male' | 'Female';
  admission_date?: string;
  created_at?: string;
  updated_at?: string;
}

export const insertStudent = async (studentData: Student) => {
  const { data, error } = await supabase
    .from('students')
    .insert(studentData)
    .select()
    .single();

  if (error) {
    console.error('Error inserting student:', error);
    throw error;
  }

  return data;
};

export const fetchAllStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching students:', error);
    throw error;
  }

  return data || [];
};

export const getStudentStats = async () => {
  const { data: students, error } = await supabase
    .from('students')
    .select('gender');

  if (error) {
    console.error('Error fetching student stats:', error);
    throw error;
  }

  const total = students?.length || 0;
  const maleCount = students?.filter(s => s.gender === 'Male').length || 0;
  const femaleCount = students?.filter(s => s.gender === 'Female').length || 0;

  return {
    total,
    maleCount,
    femaleCount
  };
};
