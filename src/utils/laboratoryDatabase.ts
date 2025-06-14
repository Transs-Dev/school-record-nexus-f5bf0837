
import { supabase } from '@/integrations/supabase/client';

export interface LaboratoryStock {
  id: string;
  tool_name: string;
  category?: string;
  total_quantity: number;
  available_quantity: number;
  unit_cost?: number;
  created_at: string;
}

export interface LaboratoryClearance {
  id: string;
  tracking_number: string;
  student_id: string;
  tool_id: string;
  damage_type: string;
  quantity: number;
  compensation_fee: number;
  payment_status: string;
  payment_mode?: string;
  payment_date?: string;
  receipt_number?: string;
  notes?: string;
  grade?: string;
  term?: string;
  academic_year?: string;
  breakage_recorded_at?: string;
  created_at: string;
  students?: {
    student_name: string;
    registration_number: string;
    grade: string;
  };
  laboratory_stock?: {
    tool_name: string;
    category?: string;
    unit_cost?: number;
  };
}

// Generate tracking number
const generateTrackingNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LAB-${timestamp}${random}`;
};

// Generate receipt number
const generateReceiptNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `RCP-${timestamp}${random}`;
};

// Laboratory Stock Management
export const getLaboratoryStock = async (): Promise<LaboratoryStock[]> => {
  const { data, error } = await supabase
    .from('laboratory_stock')
    .select('*')
    .order('tool_name');

  if (error) {
    console.error('Error fetching laboratory stock:', error);
    throw error;
  }

  return data || [];
};

export const addLaboratoryStock = async (stock: Omit<LaboratoryStock, 'id' | 'created_at'>): Promise<void> => {
  const { error } = await supabase
    .from('laboratory_stock')
    .insert([stock]);

  if (error) {
    console.error('Error adding laboratory stock:', error);
    throw error;
  }
};

export const updateLaboratoryStock = async (id: string, updates: Partial<LaboratoryStock>): Promise<void> => {
  const { error } = await supabase
    .from('laboratory_stock')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating laboratory stock:', error);
    throw error;
  }
};

export const deleteLaboratoryStock = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('laboratory_stock')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting laboratory stock:', error);
    throw error;
  }
};

// Laboratory Clearances Management
export const createLaboratoryClearance = async (
  clearanceData: Omit<LaboratoryClearance, 'id' | 'tracking_number' | 'created_at' | 'students' | 'laboratory_stock' | 'payment_status'>
): Promise<void> => {
  const trackingNumber = generateTrackingNumber();
  
  const { error } = await supabase
    .from('laboratory_clearance')
    .insert([{
      ...clearanceData,
      tracking_number: trackingNumber,
      payment_status: 'pending'
    }]);

  if (error) {
    console.error('Error creating laboratory clearance:', error);
    throw error;
  }
};

export const getLaboratoryClearances = async (): Promise<LaboratoryClearance[]> => {
  const { data, error } = await supabase
    .from('laboratory_clearance')
    .select(`
      *,
      students (
        student_name,
        registration_number,
        grade
      ),
      laboratory_stock (
        tool_name,
        category,
        unit_cost
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching laboratory clearances:', error);
    throw error;
  }

  // Transform the data to match our interface
  return (data || []).map(item => ({
    id: item.id,
    tracking_number: item.tracking_number,
    student_id: item.student_id,
    tool_id: item.tool_id,
    damage_type: item.damage_type,
    quantity: item.quantity,
    compensation_fee: item.compensation_fee,
    payment_status: item.payment_status,
    payment_mode: item.payment_mode,
    payment_date: item.payment_date,
    receipt_number: item.receipt_number,
    notes: item.notes,
    grade: item.grade,
    term: item.term,
    academic_year: item.academic_year,
    breakage_recorded_at: item.breakage_recorded_at,
    created_at: item.created_at,
    students: Array.isArray(item.students) ? item.students[0] : item.students,
    laboratory_stock: Array.isArray(item.laboratory_stock) ? item.laboratory_stock[0] : item.laboratory_stock
  }));
};

export const updateLaboratoryClearance = async (
  id: string, 
  updates: Partial<LaboratoryClearance>
): Promise<void> => {
  const { error } = await supabase
    .from('laboratory_clearance')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating laboratory clearance:', error);
    throw error;
  }
};

export const processPayment = async (
  clearanceId: string,
  paymentData: { payment_mode: string; payment_date: string }
): Promise<void> => {
  const receiptNumber = generateReceiptNumber();
  
  const { error } = await supabase
    .from('laboratory_clearance')
    .update({
      payment_status: 'paid',
      payment_mode: paymentData.payment_mode,
      payment_date: paymentData.payment_date,
      receipt_number: receiptNumber
    })
    .eq('id', clearanceId);

  if (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

export const getClearancesByStudent = async (studentId: string): Promise<LaboratoryClearance[]> => {
  const { data, error } = await supabase
    .from('laboratory_clearance')
    .select(`
      *,
      laboratory_stock (
        tool_name,
        category,
        unit_cost
      )
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching student clearances:', error);
    throw error;
  }

  // Transform the data to match our interface
  return (data || []).map(item => ({
    id: item.id,
    tracking_number: item.tracking_number,
    student_id: item.student_id,
    tool_id: item.tool_id,
    damage_type: item.damage_type,
    quantity: item.quantity,
    compensation_fee: item.compensation_fee,
    payment_status: item.payment_status,
    payment_mode: item.payment_mode,
    payment_date: item.payment_date,
    receipt_number: item.receipt_number,
    notes: item.notes,
    grade: item.grade,
    term: item.term,
    academic_year: item.academic_year,
    breakage_recorded_at: item.breakage_recorded_at,
    created_at: item.created_at,
    laboratory_stock: Array.isArray(item.laboratory_stock) ? item.laboratory_stock[0] : item.laboratory_stock
  }));
};
