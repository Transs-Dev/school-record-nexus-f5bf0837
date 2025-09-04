-- Disable RLS temporarily on fee_payments table to allow inserts
ALTER TABLE public.fee_payments DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies 
DROP POLICY IF EXISTS "Enable all operations for fee_payments" ON public.fee_payments;
DROP POLICY IF EXISTS "Allow all access to fee payments" ON public.fee_payments;

-- Re-enable RLS and create a simple permissive policy
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

-- Create a comprehensive policy that allows all operations
CREATE POLICY "fee_payments_all_access"
ON public.fee_payments
FOR ALL
TO public
USING (true)
WITH CHECK (true);