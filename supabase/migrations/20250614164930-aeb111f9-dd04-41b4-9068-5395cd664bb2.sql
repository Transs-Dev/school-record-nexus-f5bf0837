
-- Create a table for book stock management
CREATE TABLE public.book_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_title TEXT NOT NULL,
  author TEXT,
  isbn TEXT,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  total_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger for updating updated_at
CREATE TRIGGER update_book_stock_updated_at
  BEFORE UPDATE ON public.book_stock
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a table for book distribution and returns
CREATE TABLE public.book_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL UNIQUE,
  student_id UUID NOT NULL REFERENCES public.students(id),
  book_id UUID NOT NULL REFERENCES public.book_stock(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('distribution', 'return')),
  quantity INTEGER DEFAULT 1,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  condition TEXT CHECK (condition IN ('good', 'bad', 'new')) DEFAULT 'new',
  compensation_fee NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger for updating updated_at
CREATE TRIGGER update_book_transactions_updated_at
  BEFORE UPDATE ON public.book_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a function to generate tracking numbers for books
CREATE OR REPLACE FUNCTION public.generate_book_tracking_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_num INTEGER;
  year_suffix TEXT;
BEGIN
  -- Get the next sequence number based on existing records
  SELECT COALESCE(MAX(CAST(SUBSTRING(tracking_number FROM 'BT/(\d+)/') AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.book_transactions
  WHERE tracking_number ~ '^BT/\d+/\d{2}$';
  
  -- If no records exist, start from 1
  IF next_num IS NULL THEN
    next_num := 1;
  END IF;
  
  SELECT RIGHT(EXTRACT(YEAR FROM CURRENT_DATE)::TEXT, 2) INTO year_suffix;
  RETURN 'BT/' || LPAD(next_num::TEXT, 5, '0') || '/' || year_suffix;
END;
$$;

-- Create a trigger to auto-generate tracking numbers for books
CREATE OR REPLACE FUNCTION public.set_book_tracking_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    NEW.tracking_number := public.generate_book_tracking_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_book_tracking_number_trigger
  BEFORE INSERT ON public.book_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_book_tracking_number();

-- Create function to update book stock automatically
CREATE OR REPLACE FUNCTION public.update_book_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.transaction_type = 'distribution' THEN
    -- Subtract from available stock on distribution
    UPDATE public.book_stock 
    SET available_quantity = available_quantity - NEW.quantity
    WHERE id = NEW.book_id;
    
  ELSIF NEW.transaction_type = 'return' THEN
    -- Add back to available stock on return
    UPDATE public.book_stock 
    SET available_quantity = available_quantity + NEW.quantity
    WHERE id = NEW.book_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update book stock
CREATE TRIGGER book_stock_update_trigger
  AFTER INSERT ON public.book_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_book_stock();
