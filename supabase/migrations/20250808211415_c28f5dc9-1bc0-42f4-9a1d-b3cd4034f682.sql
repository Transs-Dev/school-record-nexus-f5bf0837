
-- Enable RLS and create policies for the subjects table
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Allow all operations on subjects (since this is for school administration)
CREATE POLICY "Allow all operations on subjects" 
  ON public.subjects 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
