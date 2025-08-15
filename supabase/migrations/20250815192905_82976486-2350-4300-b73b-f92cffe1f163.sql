
-- Enable RLS and create policies for the laboratory_stock table
ALTER TABLE public.laboratory_stock ENABLE ROW LEVEL SECURITY;

-- Allow all operations on laboratory_stock (since this is for school administration)
CREATE POLICY "Allow all operations on laboratory_stock" 
  ON public.laboratory_stock 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Also fix book_stock and book_transactions tables if they don't have RLS policies
ALTER TABLE public.book_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on book_stock" 
  ON public.book_stock 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

ALTER TABLE public.book_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on book_transactions" 
  ON public.book_transactions 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
