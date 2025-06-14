
-- Add stock management table
CREATE TABLE public.furniture_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('chair', 'locker')),
  available_quantity INTEGER NOT NULL DEFAULT 0,
  total_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger for updating updated_at
CREATE TRIGGER update_furniture_stock_updated_at
  BEFORE UPDATE ON public.furniture_stock
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add condition field to furniture_transactions
ALTER TABLE public.furniture_transactions 
ADD COLUMN condition TEXT CHECK (condition IN ('good', 'bad', 'new')) DEFAULT 'new',
ADD COLUMN compensation_fee NUMERIC DEFAULT 0;

-- Insert initial stock records
INSERT INTO public.furniture_stock (item_type, available_quantity, total_quantity)
VALUES 
  ('chair', 0, 0),
  ('locker', 0, 0);

-- Create function to update stock automatically
CREATE OR REPLACE FUNCTION public.update_furniture_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.transaction_type = 'distribution' THEN
    -- Subtract from available stock on distribution
    UPDATE public.furniture_stock 
    SET available_quantity = available_quantity - NEW.chair_quantity
    WHERE item_type = 'chair';
    
    UPDATE public.furniture_stock 
    SET available_quantity = available_quantity - NEW.locker_quantity
    WHERE item_type = 'locker';
    
  ELSIF NEW.transaction_type = 'return' THEN
    -- Add back to available stock on return
    UPDATE public.furniture_stock 
    SET available_quantity = available_quantity + NEW.chair_quantity
    WHERE item_type = 'chair';
    
    UPDATE public.furniture_stock 
    SET available_quantity = available_quantity + NEW.locker_quantity
    WHERE item_type = 'locker';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update stock
CREATE TRIGGER furniture_stock_update_trigger
  AFTER INSERT ON public.furniture_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_furniture_stock();
