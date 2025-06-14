
-- Fix the reset_school_system function to include WHERE clauses for all DELETE statements
CREATE OR REPLACE FUNCTION public.reset_school_system()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Delete all child records first (those that reference other tables)
  -- in the correct order to avoid foreign key constraint violations
  
  -- Delete book transactions (references students and book_stock)
  DELETE FROM public.book_transactions WHERE id IS NOT NULL;
  
  -- Delete furniture transactions (references students)
  DELETE FROM public.furniture_transactions WHERE id IS NOT NULL;
  
  -- Delete laboratory clearance (references students and laboratory_stock)
  DELETE FROM public.laboratory_clearance WHERE id IS NOT NULL;
  
  -- Delete examination marks (references students)
  DELETE FROM public.examination_marks WHERE id IS NOT NULL;
  
  -- Delete fee payments (references students)
  DELETE FROM public.fee_payments WHERE id IS NOT NULL;
  
  -- Delete student fee records (references students)
  DELETE FROM public.student_fee_records WHERE id IS NOT NULL;
  
  -- Delete subject marks (independent table)
  DELETE FROM public.subject_marks WHERE id IS NOT NULL;
  
  -- Delete fee configurations (no foreign key dependencies)
  DELETE FROM public.fee_configuration WHERE id IS NOT NULL;
  
  -- Finally delete students (parent table)
  DELETE FROM public.students WHERE id IS NOT NULL;
  
  -- Reset registration number sequence to start from 1
  PERFORM public.reset_registration_sequence();
END;
$function$;
