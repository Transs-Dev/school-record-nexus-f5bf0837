
-- Add columns to laboratory_clearance table to support the new workflow
ALTER TABLE public.laboratory_clearance 
ADD COLUMN IF NOT EXISTS grade text,
ADD COLUMN IF NOT EXISTS term text,
ADD COLUMN IF NOT EXISTS academic_year text DEFAULT (EXTRACT(year FROM CURRENT_DATE))::text,
ADD COLUMN IF NOT EXISTS breakage_recorded_at timestamp with time zone;

-- Create an index for better performance when filtering by grade and payment status
CREATE INDEX IF NOT EXISTS idx_lab_clearance_grade_status 
ON public.laboratory_clearance (grade, payment_status);

-- Create an index for better performance when filtering students with pending clearances
CREATE INDEX IF NOT EXISTS idx_lab_clearance_student_status 
ON public.laboratory_clearance (student_id, payment_status);
