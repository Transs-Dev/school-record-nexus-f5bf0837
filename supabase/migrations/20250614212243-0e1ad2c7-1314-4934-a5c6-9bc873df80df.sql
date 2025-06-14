
-- Fix the reset_school_system function to work without special permissions
-- by handling foreign key constraints in the correct order
CREATE OR REPLACE FUNCTION public.reset_school_system()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Delete all child records first (those that reference other tables)
  -- in the correct order to avoid foreign key constraint violations
  
  -- Delete book transactions (references students and book_stock)
  DELETE FROM public.book_transactions;
  
  -- Delete furniture transactions (references students)
  DELETE FROM public.furniture_transactions;
  
  -- Delete laboratory clearance (references students and laboratory_stock)
  DELETE FROM public.laboratory_clearance;
  
  -- Delete examination marks (references students)
  DELETE FROM public.examination_marks;
  
  -- Delete fee payments (references students)
  DELETE FROM public.fee_payments;
  
  -- Delete student fee records (references students)
  DELETE FROM public.student_fee_records;
  
  -- Delete subject marks (independent table)
  DELETE FROM public.subject_marks;
  
  -- Delete fee configurations (no foreign key dependencies)
  DELETE FROM public.fee_configuration;
  
  -- Finally delete students (parent table)
  DELETE FROM public.students;
  
  -- Reset registration number sequence to start from 1
  PERFORM public.reset_registration_sequence();
END;
$function$;
