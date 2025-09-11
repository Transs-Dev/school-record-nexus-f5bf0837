-- Update all subjects to have max_marks = 100 for CBC system
UPDATE public.subjects SET max_marks = 100 WHERE max_marks != 100;

-- Create CBC grading configuration table
CREATE TABLE IF NOT EXISTS public.cbc_grading (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade_letter TEXT NOT NULL UNIQUE,
  grade_descriptor TEXT NOT NULL,
  min_percentage INTEGER NOT NULL,
  max_percentage INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure no overlapping percentage ranges
  CONSTRAINT valid_percentage_range CHECK (min_percentage >= 0 AND max_percentage <= 100 AND min_percentage <= max_percentage)
);

-- Enable RLS on CBC grading table
ALTER TABLE public.cbc_grading ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for CBC grading
CREATE POLICY "cbc_grading_public_access"
ON public.cbc_grading
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Insert CBC grading scale for Kenya
INSERT INTO public.cbc_grading (grade_letter, grade_descriptor, min_percentage, max_percentage, points) VALUES
('EE', 'Exceeding Expectation', 80, 100, 4),
('ME', 'Meeting Expectation', 50, 79, 3),
('AE', 'Approaching Expectation', 40, 49, 2),
('BE', 'Below Expectation', 0, 39, 1)
ON CONFLICT (grade_letter) DO UPDATE SET
  grade_descriptor = EXCLUDED.grade_descriptor,
  min_percentage = EXCLUDED.min_percentage,
  max_percentage = EXCLUDED.max_percentage,
  points = EXCLUDED.points,
  updated_at = now();

-- Create function to get CBC grade from percentage
CREATE OR REPLACE FUNCTION public.get_cbc_grade(percentage NUMERIC)
RETURNS TABLE(grade_letter TEXT, grade_descriptor TEXT, points INTEGER) 
LANGUAGE sql
STABLE
AS $$
  SELECT c.grade_letter, c.grade_descriptor, c.points
  FROM public.cbc_grading c
  WHERE percentage >= c.min_percentage 
    AND percentage <= c.max_percentage 
    AND c.is_active = true
  ORDER BY c.min_percentage DESC
  LIMIT 1;
$$;