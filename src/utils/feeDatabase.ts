
import { supabase } from "@/integrations/supabase/client";

export interface FeeConfiguration {
  id?: string;
  term: string;
  academic_year: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface StudentFeeRecord {
  id?: string;
  student_id: string;
  term: string;
  academic_year: string;
  required_amount: number;
  paid_amount: number;
  balance?: number;
  payment_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FeePayment {
  id?: string;
  student_id: string;
  term: string;
  academic_year: string;
  amount: number;
  payment_mode: 'Cash' | 'Mobile Money' | 'Bank';
  transaction_code?: string;
  verification_status: 'Pending' | 'Verified' | 'Rejected';
  verified_by?: string;
  verified_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Fee Configuration Functions
export const fetchFeeConfigurations = async (): Promise<FeeConfiguration[]> => {
  const { data, error } = await supabase
    .from('fee_configuration')
    .select('*')
    .order('academic_year', { ascending: false })
    .order('term', { ascending: true });

  if (error) {
    console.error('Error fetching fee configurations:', error);
    throw error;
  }

  return data || [];
};

export const saveFeeConfiguration = async (config: Omit<FeeConfiguration, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('fee_configuration')
    .upsert(config, {
      onConflict: 'term,academic_year'
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving fee configuration:', error);
    throw error;
  }

  return data;
};

// Student Fee Records Functions
export const fetchStudentFeeRecords = async (studentId?: string, term?: string, academicYear?: string): Promise<StudentFeeRecord[]> => {
  let query = supabase
    .from('student_fee_records')
    .select(`
      *,
      students (
        student_name,
        registration_number,
        grade
      )
    `);

  if (studentId) {
    query = query.eq('student_id', studentId);
  }
  if (term) {
    query = query.eq('term', term);
  }
  if (academicYear) {
    query = query.eq('academic_year', academicYear);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching student fee records:', error);
    throw error;
  }

  return data || [];
};

export const createStudentFeeRecord = async (record: Omit<StudentFeeRecord, 'id' | 'created_at' | 'updated_at' | 'balance' | 'payment_percentage'>) => {
  const { data, error } = await supabase
    .from('student_fee_records')
    .insert(record)
    .select()
    .single();

  if (error) {
    console.error('Error creating student fee record:', error);
    throw error;
  }

  return data;
};

// Fee Payments Functions
export const submitFeePayment = async (payment: Omit<FeePayment, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('fee_payments')
    .insert(payment)
    .select()
    .single();

  if (error) {
    console.error('Error submitting fee payment:', error);
    throw error;
  }

  return data;
};

export const fetchFeePayments = async (filters?: {
  studentId?: string;
  term?: string;
  academicYear?: string;
  verificationStatus?: string;
}): Promise<FeePayment[]> => {
  let query = supabase
    .from('fee_payments')
    .select(`
      *,
      students (
        student_name,
        registration_number,
        grade,
        primary_contact
      )
    `);

  if (filters?.studentId) {
    query = query.eq('student_id', filters.studentId);
  }
  if (filters?.term) {
    query = query.eq('term', filters.term);
  }
  if (filters?.academicYear) {
    query = query.eq('academic_year', filters.academicYear);
  }
  if (filters?.verificationStatus) {
    query = query.eq('verification_status', filters.verificationStatus);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching fee payments:', error);
    throw error;
  }

  return data || [];
};

export const verifyFeePayment = async (paymentId: string, status: 'Verified' | 'Rejected', verifiedBy?: string) => {
  const updateData: any = {
    verification_status: status,
    verified_at: new Date().toISOString()
  };

  if (verifiedBy) {
    updateData.verified_by = verifiedBy;
  }

  const { data, error } = await supabase
    .from('fee_payments')
    .update(updateData)
    .eq('id', paymentId)
    .select()
    .single();

  if (error) {
    console.error('Error verifying fee payment:', error);
    throw error;
  }

  return data;
};

// Analytics Functions
export const getFeeAnalytics = async (academicYear?: string) => {
  const currentYear = academicYear || new Date().getFullYear().toString();
  
  const { data: payments, error } = await supabase
    .from('fee_payments')
    .select('amount, verification_status, term')
    .eq('academic_year', currentYear);

  if (error) {
    console.error('Error fetching fee analytics:', error);
    throw error;
  }

  const totalCollected = payments
    ?.filter(p => p.verification_status === 'Verified')
    .reduce((sum, p) => sum + p.amount, 0) || 0;

  const pendingAmount = payments
    ?.filter(p => p.verification_status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0) || 0;

  const termBreakdown = payments?.reduce((acc, payment) => {
    if (payment.verification_status === 'Verified') {
      acc[payment.term] = (acc[payment.term] || 0) + payment.amount;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    totalCollected,
    pendingAmount,
    termBreakdown,
    totalPayments: payments?.length || 0,
    verifiedPayments: payments?.filter(p => p.verification_status === 'Verified').length || 0,
    pendingPayments: payments?.filter(p => p.verification_status === 'Pending').length || 0
  };
};
