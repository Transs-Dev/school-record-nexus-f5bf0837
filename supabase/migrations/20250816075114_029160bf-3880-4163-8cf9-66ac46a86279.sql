
-- Create a table to store individual subject marks for each student
CREATE TABLE public.student_subject_marks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  grade TEXT NOT NULL,
  term TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE)::text,
  marks INTEGER NOT NULL DEFAULT 0,
  max_marks INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject_id, grade, term, academic_year)
);

-- Enable RLS for the new table
ALTER TABLE public.student_subject_marks ENABLE ROW LEVEL SECURITY;

-- Create policy for the new table
CREATE POLICY "Allow all operations on student_subject_marks" 
  ON public.student_subject_marks 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create a table for custom grade configurations
CREATE TABLE public.grade_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grade_letter TEXT NOT NULL,
  min_marks INTEGER NOT NULL,
  max_marks INTEGER NOT NULL,
  points INTEGER NOT NULL,
  remarks TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(grade_letter, min_marks, max_marks)
);

-- Enable RLS for grade configurations
ALTER TABLE public.grade_configurations ENABLE ROW LEVEL SECURITY;

-- Create policy for grade configurations
CREATE POLICY "Allow all operations on grade_configurations" 
  ON public.grade_configurations 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Insert default grade configuration
INSERT INTO public.grade_configurations (grade_letter, min_marks, max_marks, points, remarks) VALUES
('A', 80, 100, 12, 'Excellent'),
('A–', 75, 79, 11, 'Very Good'),
('B+', 70, 74, 10, 'Good'),
('B', 65, 69, 9, 'Above Average'),
('B–', 60, 64, 8, 'Average'),
('C+', 55, 59, 7, 'Fairly Good'),
('C', 50, 54, 6, 'Fair'),
('C–', 45, 49, 5, 'Fair but Weak'),
('D+', 40, 44, 4, 'Poor'),
('D', 35, 39, 3, 'Very Poor'),
('D–', 30, 34, 2, 'Weak'),
('E', 0, 29, 1, 'Fail');

-- Fix fee_configuration table constraint if it exists
ALTER TABLE public.fee_configuration DROP CONSTRAINT IF EXISTS unique_term_year;
ALTER TABLE public.fee_configuration ADD CONSTRAINT unique_term_year UNIQUE (term, academic_year);
