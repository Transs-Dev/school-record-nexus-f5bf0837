
import { supabase } from "@/integrations/supabase/client";

export interface Student {
  id?: string;
  registration_number: string;
  student_name: string;
  grade: string;
  date_of_birth: string;
  parent_name: string;
  address?: string;
  primary_contact: string;
  alternative_contact?: string;
  gender: 'Male' | 'Female';
  admission_date?: string;
  created_at?: string;
  updated_at?: string;
}

export const insertStudent = async (studentData: Omit<Student, 'id' | 'registration_number' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('students')
    .insert(studentData)
    .select()
    .single();

  if (error) {
    console.error('Error inserting student:', error);
    throw error;
  }

  return data;
};

export const fetchAllStudents = async (): Promise<Student[]> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching students:', error);
    throw error;
  }

  return (data || []).map(student => ({
    ...student,
    gender: student.gender as 'Male' | 'Female'
  }));
};

export const getStudentStats = async () => {
  const { data: students, error } = await supabase
    .from('students')
    .select('gender');

  if (error) {
    console.error('Error fetching student stats:', error);
    throw error;
  }

  const total = students?.length || 0;
  const maleCount = students?.filter(s => s.gender === 'Male').length || 0;
  const femaleCount = students?.filter(s => s.gender === 'Female').length || 0;

  return {
    total,
    maleCount,
    femaleCount
  };
};

// Utility functions for print and download
export const printStudentList = (students: Student[]) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Student Records - Ronga Secondary School</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .print-date { text-align: right; margin-top: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">RONGA SECONDARY SCHOOL (RSS)</div>
        <h2>Student Records Report</h2>
        <p>Total Students: ${students.length}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Reg. Number</th>
            <th>Student Name</th>
            <th>Grade</th>
            <th>Gender</th>
            <th>Parent/Guardian</th>
            <th>Primary Contact</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(student => `
            <tr>
              <td>${student.registration_number}</td>
              <td>${student.student_name}</td>
              <td>${student.grade}</td>
              <td>${student.gender}</td>
              <td>${student.parent_name}</td>
              <td>${student.primary_contact}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="print-date">
        Printed on: ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};

export const downloadStudentList = (students: Student[]) => {
  const headers = ['Registration Number', 'Student Name', 'Grade', 'Gender', 'Date of Birth', 'Parent/Guardian', 'Address', 'Primary Contact', 'Alternative Contact', 'Admission Date'];
  const csvContent = [
    headers.join(','),
    ...students.map(student => [
      student.registration_number,
      `"${student.student_name}"`,
      student.grade,
      student.gender,
      student.date_of_birth,
      `"${student.parent_name}"`,
      `"${student.address || ''}"`,
      student.primary_contact,
      student.alternative_contact || '',
      student.admission_date || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `student_records_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
