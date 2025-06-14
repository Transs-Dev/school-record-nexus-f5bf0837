
-- Drop the old examination_marks table and recreate with proper structure
DROP TABLE IF EXISTS public.examination_marks CASCADE;

-- Create a new examination_marks table that references subjects dynamically
CREATE TABLE public.examination_marks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  grade TEXT NOT NULL,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT (EXTRACT(year FROM CURRENT_DATE))::text,
  subject_marks JSONB DEFAULT '[]'::jsonb,
  total_marks INTEGER DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, grade, term, academic_year)
);

-- Add trigger for updating updated_at
CREATE TRIGGER update_examination_marks_updated_at
  BEFORE UPDATE ON public.examination_marks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a function to reset the registration number sequence
CREATE OR REPLACE FUNCTION public.reset_registration_sequence()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Reset the sequence to start from 1
  ALTER SEQUENCE public.student_registration_seq RESTART WITH 1;
END;
$function$;

-- Update the system reset function to include sequence reset
CREATE OR REPLACE FUNCTION public.reset_school_system()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Delete all examination marks
  DELETE FROM public.examination_marks;
  
  -- Delete all fee payments
  DELETE FROM public.fee_payments;
  
  -- Delete all student fee records
  DELETE FROM public.student_fee_records;
  
  -- Delete all fee configurations
  DELETE FROM public.fee_configuration;
  
  -- Delete all students
  DELETE FROM public.students;
  
  -- Reset registration number sequence
  PERFORM public.reset_registration_sequence();
END;
$function$;
