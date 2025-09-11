import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import type { Student } from '@/utils/studentDatabase';

// Extend jsPDF types
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateStudentRecordsPDF = async (students: Student[], title: string = "Student Records") => {
  const pdf = new jsPDF();
  
  // Add school header
  pdf.setFontSize(18);
  pdf.setTextColor(40, 44, 52);
  pdf.text('School Management System', 20, 20);
  
  pdf.setFontSize(14);
  pdf.text(title, 20, 30);
  
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
  
  // Add line separator
  pdf.setDrawColor(200, 200, 200);
  pdf.line(20, 45, 190, 45);
  
  // Prepare table data
  const tableData = students.map((student, index) => [
    index + 1,
    student.registration_number,
    student.student_name,
    student.grade,
    student.gender,
    student.parent_name,
    student.primary_contact,
    new Date(student.admission_date).toLocaleDateString()
  ]);
  
  // Add table
  pdf.autoTable({
    head: [['#', 'Reg. Number', 'Student Name', 'Grade', 'Gender', 'Parent/Guardian', 'Contact', 'Admission Date']],
    body: tableData,
    startY: 55,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 25 },
      2: { cellWidth: 35 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 35 },
      6: { cellWidth: 25 },
      7: { cellWidth: 25 },
    },
  });
  
  // Add footer
  const pageCount = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Page ${i} of ${pageCount}`, 170, 285);
    pdf.text('School Management System - Confidential', 20, 285);
  }
  
  return pdf;
};

export const generateStudentResultsPDF = async (studentData: any, resultsData: any) => {
  const pdf = new jsPDF();
  
  // School Header
  pdf.setFontSize(16);
  pdf.setTextColor(40, 44, 52);
  pdf.text('SCHOOL MANAGEMENT SYSTEM', 105, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text('STUDENT ACADEMIC REPORT', 105, 30, { align: 'center' });
  
  // Student Information
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  const studentInfo = [
    ['Student Name:', studentData.student_name],
    ['Registration Number:', studentData.registration_number],
    ['Grade:', studentData.grade],
    ['Term:', resultsData.term],
    ['Academic Year:', resultsData.academic_year],
  ];
  
  let yPosition = 50;
  studentInfo.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, 70, yPosition);
    yPosition += 8;
  });
  
  // Results Table
  yPosition += 10;
  
  const subjects = resultsData.subject_marks || [];
  const tableData = subjects.map((subject: any, index: number) => {
    const percentage = (subject.marks / 100) * 100;
    let grade = 'BE';
    if (percentage >= 80) grade = 'EE';
    else if (percentage >= 50) grade = 'ME';
    else if (percentage >= 40) grade = 'AE';
    
    return [
      index + 1,
      subject.subject_name || `Subject ${index + 1}`,
      subject.marks,
      100,
      `${percentage.toFixed(1)}%`,
      grade
    ];
  });
  
  // Add totals row
  const totalMarks = subjects.reduce((sum: number, subject: any) => sum + (subject.marks || 0), 0);
  const totalPossible = subjects.length * 100;
  const overallPercentage = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0;
  
  let overallGrade = 'BE';
  if (overallPercentage >= 80) overallGrade = 'EE';
  else if (overallPercentage >= 50) overallGrade = 'ME';
  else if (overallPercentage >= 40) overallGrade = 'AE';
  
  tableData.push([
    '',
    'TOTAL',
    totalMarks,
    totalPossible,
    `${overallPercentage.toFixed(1)}%`,
    overallGrade
  ]);
  
  pdf.autoTable({
    head: [['#', 'Subject', 'Marks', 'Out of', 'Percentage', 'Grade']],
    body: tableData,
    startY: yPosition,
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 60 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25 },
    },
    didParseCell: function(data: any) {
      // Style the totals row
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [229, 231, 235];
      }
    }
  });
  
  // Academic Remarks
  const finalY = (pdf as any).lastAutoTable.finalY + 20;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ACADEMIC REMARKS:', 20, finalY);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  let remarks = '';
  if (overallPercentage >= 80) {
    remarks = 'Excellent performance! The student has exceeded expectations in most subjects and demonstrates exceptional understanding of the curriculum.';
  } else if (overallPercentage >= 50) {
    remarks = 'Good performance. The student has met expectations and shows solid understanding of the curriculum with room for continued growth.';
  } else if (overallPercentage >= 40) {
    remarks = 'Satisfactory performance. The student is approaching expectations and should focus on strengthening understanding in key areas.';
  } else {
    remarks = 'The student needs additional support to meet curriculum expectations. Recommended for remedial programs and extra practice.';
  }
  
  // Split text into lines
  const splitRemarks = pdf.splitTextToSize(remarks, 170);
  pdf.text(splitRemarks, 20, finalY + 10);
  
  // Grading Scale
  const gradeY = finalY + 30 + (splitRemarks.length * 5);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('GRADING SCALE (CBC):', 20, gradeY);
  
  pdf.setFont('helvetica', 'normal');
  const gradingScale = [
    'EE (Exceeding Expectation): 80-100%',
    'ME (Meeting Expectation): 50-79%',
    'AE (Approaching Expectation): 40-49%',
    'BE (Below Expectation): 0-39%'
  ];
  
  gradingScale.forEach((scale, index) => {
    pdf.text(scale, 20, gradeY + 10 + (index * 6));
  });
  
  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 280);
  pdf.text('This is an official academic report', 105, 280, { align: 'center' });
  
  return pdf;
};

export const printElement = async (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save('student-results.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};