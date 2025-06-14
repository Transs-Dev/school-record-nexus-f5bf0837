
-- Add foreign key constraints to establish proper relationships
ALTER TABLE public.laboratory_clearance 
ADD CONSTRAINT fk_laboratory_clearance_student 
FOREIGN KEY (student_id) REFERENCES public.students(id);

ALTER TABLE public.laboratory_clearance 
ADD CONSTRAINT fk_laboratory_clearance_tool 
FOREIGN KEY (tool_id) REFERENCES public.laboratory_stock(id);
