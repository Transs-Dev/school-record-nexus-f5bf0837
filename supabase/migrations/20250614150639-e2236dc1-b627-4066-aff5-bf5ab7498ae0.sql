
-- Add a class_teacher column to the subjects table
ALTER TABLE public.subjects ADD COLUMN class_teacher TEXT;

-- Create a table for class information
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_name TEXT NOT NULL UNIQUE,
  class_teacher TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger for updating updated_at on classes
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default classes
INSERT INTO public.classes (class_name) VALUES
('Grade 1'),
('Grade 2'),
('Grade 3'),
('Grade 4'),
('Grade 5'),
('Grade 6');
