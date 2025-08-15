
-- Enable RLS and create policies for the examination_marks table
ALTER TABLE public.examination_marks ENABLE ROW LEVEL SECURITY;

-- Allow all operations on examination_marks (since this is for school administration)
CREATE POLICY "Allow all operations on examination_marks" 
  ON public.examination_marks 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
