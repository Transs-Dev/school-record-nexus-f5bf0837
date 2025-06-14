
-- Add grade column to book_stock table for grade-based book management
ALTER TABLE public.book_stock 
ADD COLUMN IF NOT EXISTS grade text;

-- Create an index for better performance when filtering books by grade
CREATE INDEX IF NOT EXISTS idx_book_stock_grade 
ON public.book_stock (grade);

-- Create a trigger to automatically decrease laboratory tool quantity when breakage is recorded
CREATE OR REPLACE FUNCTION public.update_lab_stock_on_breakage()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only decrease quantity when a new clearance record is created (INSERT)
  IF TG_OP = 'INSERT' THEN
    -- Decrease available quantity by the broken/lost quantity
    UPDATE public.laboratory_stock 
    SET available_quantity = available_quantity - NEW.quantity
    WHERE id = NEW.tool_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update stock when breakage is recorded
CREATE TRIGGER update_lab_stock_on_breakage_trigger
  AFTER INSERT ON public.laboratory_clearance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lab_stock_on_breakage();
