-- Fix RLS policies for fee_payments table
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow all access to fee payments" ON public.fee_payments;

-- Create comprehensive RLS policy for fee_payments
CREATE POLICY "Enable all operations for fee_payments"
ON public.fee_payments
FOR ALL
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled on fee_payments
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;