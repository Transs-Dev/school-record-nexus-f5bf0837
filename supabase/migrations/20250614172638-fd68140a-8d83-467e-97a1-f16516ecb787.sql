
-- Create table for laboratory stock/tools
CREATE TABLE public.laboratory_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  total_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  unit_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for laboratory clearance transactions
CREATE TABLE public.laboratory_clearance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT NOT NULL,
  student_id UUID NOT NULL,
  tool_id UUID NOT NULL,
  damage_type TEXT NOT NULL, -- 'broken', 'lost', 'damaged'
  quantity INTEGER DEFAULT 1,
  compensation_fee NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'waived'
  payment_date DATE,
  payment_mode TEXT, -- 'cash', 'bank_transfer', 'mobile_money'
  transaction_code TEXT,
  receipt_number TEXT,
  notes TEXT,
  reported_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to generate laboratory tracking numbers
CREATE OR REPLACE FUNCTION public.generate_lab_tracking_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_num INTEGER;
  year_suffix TEXT;
BEGIN
  -- Get the next sequence number based on existing records
  SELECT COALESCE(MAX(CAST(SUBSTRING(tracking_number FROM 'LAB/(\d+)/') AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.laboratory_clearance
  WHERE tracking_number ~ '^LAB/\d+/\d{2}$';
  
  -- If no records exist, start from 1
  IF next_num IS NULL THEN
    next_num := 1;
  END IF;
  
  SELECT RIGHT(EXTRACT(YEAR FROM CURRENT_DATE)::TEXT, 2) INTO year_suffix;
  RETURN 'LAB/' || LPAD(next_num::TEXT, 5, '0') || '/' || year_suffix;
END;
$$;

-- Create function to set laboratory tracking number
CREATE OR REPLACE FUNCTION public.set_lab_tracking_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    NEW.tracking_number := public.generate_lab_tracking_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Create function to generate receipt numbers
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_num INTEGER;
  year_suffix TEXT;
BEGIN
  -- Get the next sequence number based on existing receipts
  SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 'RCP/(\d+)/') AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.laboratory_clearance
  WHERE receipt_number ~ '^RCP/\d+/\d{2}$';
  
  -- If no records exist, start from 1
  IF next_num IS NULL THEN
    next_num := 1;
  END IF;
  
  SELECT RIGHT(EXTRACT(YEAR FROM CURRENT_DATE)::TEXT, 2) INTO year_suffix;
  RETURN 'RCP/' || LPAD(next_num::TEXT, 5, '0') || '/' || year_suffix;
END;
$$;

-- Create trigger to auto-generate tracking numbers
CREATE TRIGGER set_lab_tracking_number_trigger
  BEFORE INSERT ON public.laboratory_clearance
  FOR EACH ROW
  EXECUTE FUNCTION public.set_lab_tracking_number();

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_lab_clearance_updated_at
  BEFORE UPDATE ON public.laboratory_clearance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_stock_updated_at
  BEFORE UPDATE ON public.laboratory_stock
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample laboratory tools
INSERT INTO public.laboratory_stock (tool_name, description, category, total_quantity, available_quantity, unit_cost) VALUES
('Microscope', 'Compound microscope for biological studies', 'Biology Equipment', 20, 18, 250.00),
('Test Tubes', 'Glass test tubes for experiments', 'Glassware', 100, 85, 2.50),
('Beakers (250ml)', 'Glass beakers for mixing solutions', 'Glassware', 50, 42, 8.00),
('Bunsen Burner', 'Gas burner for heating', 'Heating Equipment', 15, 13, 45.00),
('pH Meter', 'Digital pH measurement device', 'Measuring Instruments', 8, 7, 120.00),
('Pipettes', 'Graduated pipettes for precise measurement', 'Measuring Instruments', 30, 26, 15.00),
('Petri Dishes', 'Plastic petri dishes for culturing', 'Culture Equipment', 200, 180, 1.50),
('Safety Goggles', 'Protective eyewear for lab safety', 'Safety Equipment', 40, 35, 12.00);
