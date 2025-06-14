
-- Create a table for furniture distribution and returns
CREATE TABLE public.furniture_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  student_id UUID NOT NULL REFERENCES public.students(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('distribution', 'return')),
  chair_quantity INTEGER DEFAULT 0,
  locker_quantity INTEGER DEFAULT 0,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger for updating updated_at
CREATE TRIGGER update_furniture_transactions_updated_at
  BEFORE UPDATE ON public.furniture_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a function to generate tracking numbers
CREATE OR REPLACE FUNCTION public.generate_furniture_tracking_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_num INTEGER;
  year_suffix TEXT;
BEGIN
  -- Get the next sequence number based on existing records
  SELECT COALESCE(MAX(CAST(SUBSTRING(tracking_number FROM 'FT/(\d+)/') AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.furniture_transactions
  WHERE tracking_number ~ '^FT/\d+/\d{2}$';
  
  -- If no records exist, start from 1
  IF next_num IS NULL THEN
    next_num := 1;
  END IF;
  
  SELECT RIGHT(EXTRACT(YEAR FROM CURRENT_DATE)::TEXT, 2) INTO year_suffix;
  RETURN 'FT/' || LPAD(next_num::TEXT, 5, '0') || '/' || year_suffix;
END;
$$;

-- Create a trigger to auto-generate tracking numbers
CREATE OR REPLACE FUNCTION public.set_furniture_tracking_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    NEW.tracking_number := public.generate_furniture_tracking_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_furniture_tracking_number_trigger
  BEFORE INSERT ON public.furniture_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_furniture_tracking_number();
