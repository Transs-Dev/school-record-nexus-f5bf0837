
import { supabase } from "@/integrations/supabase/client";

export interface Subject {
  id: string;
  key: string;
  label: string;
  max_marks: number;
  class_teacher?: string;
  created_at?: string;
  updated_at?: string;
}

export const fetchSubjects = async (): Promise<Subject[]> => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('label');

  if (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }

  return data || [];
};

export const addSubject = async (subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>): Promise<Subject> => {
  const { data, error } = await supabase
    .from('subjects')
    .insert([subject])
    .select()
    .single();

  if (error) {
    console.error('Error adding subject:', error);
    throw error;
  }

  return data;
};

export const updateSubject = async (id: string, subject: Partial<Omit<Subject, 'id' | 'created_at' | 'updated_at'>>): Promise<Subject> => {
  const { data, error } = await supabase
    .from('subjects')
    .update(subject)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating subject:', error);
    throw error;
  }

  return data;
};

export const deleteSubject = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};
