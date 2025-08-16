-- Create user roles system for proper access control
CREATE TYPE public.app_role AS ENUM ('admin', 'financial_staff', 'teacher', 'student');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has financial access
CREATE OR REPLACE FUNCTION public.has_financial_access(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'financial_staff')
  )
$$;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all access to fee payments" ON public.fee_payments;
DROP POLICY IF EXISTS "Allow all access to student fee records" ON public.student_fee_records;

-- Create secure RLS policies for fee_payments
CREATE POLICY "Financial staff can view all fee payments"
  ON public.fee_payments
  FOR SELECT
  TO authenticated
  USING (public.has_financial_access(auth.uid()));

CREATE POLICY "Financial staff can insert fee payments"
  ON public.fee_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_financial_access(auth.uid()));

CREATE POLICY "Financial staff can update fee payments"
  ON public.fee_payments
  FOR UPDATE
  TO authenticated
  USING (public.has_financial_access(auth.uid()))
  WITH CHECK (public.has_financial_access(auth.uid()));

CREATE POLICY "Students can view their own fee payments"
  ON public.fee_payments
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'student') AND
    student_id IN (
      SELECT s.id 
      FROM public.students s 
      JOIN public.user_student_map usm ON s.id = usm.student_id 
      WHERE usm.user_id = auth.uid()
    )
  );

-- Create secure RLS policies for student_fee_records
CREATE POLICY "Financial staff can view all fee records"
  ON public.student_fee_records
  FOR SELECT
  TO authenticated
  USING (public.has_financial_access(auth.uid()));

CREATE POLICY "Financial staff can manage fee records"
  ON public.student_fee_records
  FOR ALL
  TO authenticated
  USING (public.has_financial_access(auth.uid()))
  WITH CHECK (public.has_financial_access(auth.uid()));

CREATE POLICY "Students can view their own fee records"
  ON public.student_fee_records
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'student') AND
    student_id IN (
      SELECT s.id 
      FROM public.students s 
      JOIN public.user_student_map usm ON s.id = usm.student_id 
      WHERE usm.user_id = auth.uid()
    )
  );

-- Create user-student mapping table for student access
CREATE TABLE public.user_student_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, student_id)
);

-- Enable RLS on user_student_map
ALTER TABLE public.user_student_map ENABLE ROW LEVEL SECURITY;

-- Only admins can manage user-student mappings
CREATE POLICY "Admins can manage user-student mappings"
  ON public.user_student_map
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can view their own mappings
CREATE POLICY "Users can view their own student mappings"
  ON public.user_student_map
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policy for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add some default admin user (replace with actual user ID when you have real auth)
-- This is a placeholder - in production, you'll add real user IDs
INSERT INTO public.user_roles (user_id, role) 
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;