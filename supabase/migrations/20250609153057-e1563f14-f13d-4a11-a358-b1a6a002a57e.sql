
-- Create a table for subjects
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  max_marks INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default subjects
INSERT INTO public.subjects (key, label, max_marks) VALUES
('mathematics', 'Mathematics', 100),
('english', 'English', 100),
('kiswahili', 'Kiswahili', 100),
('science', 'Science', 100),
('social_studies', 'Social Studies', 100),
('ire_cre', 'IRE/CRE', 100);

-- Create a table for PIN management
CREATE TABLE public.pin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default PIN (1200) - in a real app you'd hash this
INSERT INTO public.pin_settings (pin_hash) VALUES ('1200');

-- Add trigger for updating updated_at on subjects
CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updating updated_at on pin_settings
CREATE TRIGGER update_pin_settings_updated_at
  BEFORE UPDATE ON public.pin_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
