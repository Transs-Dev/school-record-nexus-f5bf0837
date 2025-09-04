-- Fix RLS policies for fee_configuration table
-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Allow insert access to fee configurations" ON public.fee_configuration;
DROP POLICY IF EXISTS "Allow read access to fee configurations" ON public.fee_configuration;
DROP POLICY IF EXISTS "Allow update access to fee configurations" ON public.fee_configuration;

-- Create new permissive policies that allow all operations
CREATE POLICY "Enable all operations for fee_configuration" 
ON public.fee_configuration 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Also ensure RLS is enabled
ALTER TABLE public.fee_configuration ENABLE ROW LEVEL SECURITY;