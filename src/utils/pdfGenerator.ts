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
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  // School Header with Logo Area
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(25, 35, 75);
  pdf.text('SCHOOL MANAGEMENT SYSTEM', 148, 20, { align: 'center' });
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(60, 80, 120);
  pdf.text(title.toUpperCase(), 148, 30, { align: 'center' });
  
  // Separator line
  pdf.setDrawColor(25, 35, 75);
  pdf.setLineWidth(1);
  pdf.line(20, 35, 277, 35);
  
  // Date and summary info
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 20, 45);
  pdf.text(`Total Records: ${students.length}`, 220, 45);
  
  // Prepare enhanced table data
  const tableData = students.map((student, index) => [
    (index + 1).toString(),
    student.registration_number,
    student.student_name,
    student.grade,
    student.gender,
    student.parent_name,
    student.primary_contact,
    new Date(student.admission_date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  ]);
  
  // Enhanced table with better styling
  pdf.autoTable({
    head: [['#', 'Registration Number', 'Student Name', 'Grade', 'Gender', 'Parent/Guardian', 'Contact', 'Admission Date']],
    body: tableData,
    startY: 55,
    margin: { left: 20, right: 20 },
    styles: {
      fontSize: 8,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      font: 'helvetica',
      textColor: [40, 40, 40],
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [25, 35, 75],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: { top: 5, right: 3, bottom: 5, left: 3 },
    },
    alternateRowStyles: {
      fillColor: [248, 249, 252],
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 30 },
      2: { cellWidth: 45, fontStyle: 'bold' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 50 },
      6: { cellWidth: 35 },
      7: { cellWidth: 32, halign: 'center' },
    },
    didParseCell: function(data: any) {
      // Highlight first column
      if (data.column.index === 0) {
        data.cell.styles.fillColor = [240, 242, 247];
        data.cell.styles.fontStyle = 'bold';
      }
      // Style student names
      if (data.column.index === 2) {
        data.cell.styles.textColor = [25, 35, 75];
      }
    },
  });
  
  // Enhanced footer
  const finalY = (pdf as any).lastAutoTable.finalY || 200;
  const pageCount = (pdf as any).internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    // Footer separator
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(20, 200, 277, 200);
    
    // Footer content
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('School Management System - Confidential Document', 20, 207);
    pdf.text(`Page ${i} of ${pageCount}`, 250, 207);
    
    // Add generation timestamp
    pdf.text(`Report ID: SMS-${Date.now().toString().slice(-8)}`, 148, 207, { align: 'center' });
  }
  
  return pdf;
};

export const generateStudentResultsPDF = async (studentData: any, resultsData: any) => {
  const pdf = new jsPDF();
  
  // Enhanced School Header with better styling
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(25, 35, 75);
  pdf.text('SCHOOL MANAGEMENT SYSTEM', 105, 20, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(60, 80, 120);
  pdf.text('STUDENT ACADEMIC REPORT', 105, 30, { align: 'center' });
  
  // Decorative line
  pdf.setDrawColor(25, 35, 75);
  pdf.setLineWidth(0.8);
  pdf.line(20, 35, 190, 35);
  
  // Student Information Section with better layout
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(25, 35, 75);
  pdf.text('STUDENT INFORMATION', 20, 50);
  
  // Create a bordered box for student info
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.rect(20, 55, 170, 35);
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  const studentInfo = [
    ['Student Name:', studentData.student_name],
    ['Registration Number:', studentData.registration_number],
    ['Grade:', studentData.grade],
    ['Term:', resultsData.term],
    ['Academic Year:', resultsData.academic_year],
  ];
  
  let yPosition = 62;
  studentInfo.forEach(([label, value], index) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, 25, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, 80, yPosition);
    
    // Add second column for better space utilization
    if (index % 2 === 0 && index + 1 < studentInfo.length) {
      const [nextLabel, nextValue] = studentInfo[index + 1];
      pdf.setFont('helvetica', 'bold');
      pdf.text(nextLabel, 120, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(nextValue, 170, yPosition);
    }
    
    yPosition += (index % 2 === 0) ? 8 : 0;
  });
  
  // Academic Results Section
  yPosition = 105;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(25, 35, 75);
  pdf.text('ACADEMIC RESULTS', 20, yPosition);
  
  yPosition += 10;
  
  // Process subject marks with enhanced data structure
  const subjects = Array.isArray(resultsData.subject_marks) 
    ? resultsData.subject_marks.map((subject: any) => {
        // Use a default max marks of 100 if not specified
        const maxMarks = subject.max_marks || 100;
        const percentage = (subject.marks / maxMarks) * 100;
        let grade = 'BE';
        if (percentage >= 80) grade = 'EE';
        else if (percentage >= 50) grade = 'ME';
        else if (percentage >= 40) grade = 'AE';
        
        return {
          ...subject,
          max_marks: maxMarks,
          percentage,
          grade
        };
      })
    : [];
  
  const tableData = subjects.map((subject: any, index: number) => [
    index + 1,
    subject.subject_name || `Subject ${index + 1}`,
    subject.marks,
    subject.max_marks,
    `${subject.percentage.toFixed(1)}%`,
    subject.grade
  ]);
  
  // Calculate totals
  const totalMarks = subjects.reduce((sum: number, subject: any) => sum + (subject.marks || 0), 0);
  const totalPossible = subjects.reduce((sum: number, subject: any) => sum + (subject.max_marks || 100), 0);
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
    head: [['#', 'Subject', 'Marks Obtained', 'Total Marks', 'Percentage', 'CBC Grade']],
    body: tableData,
    startY: yPosition,
    margin: { left: 20, right: 20 },
    styles: {
      fontSize: 9,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      font: 'helvetica',
      textColor: [40, 40, 40],
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [25, 35, 75],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      cellPadding: { top: 5, right: 3, bottom: 5, left: 3 },
    },
    alternateRowStyles: {
      fillColor: [248, 249, 252],
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 65, fontStyle: 'bold' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: function(data: any) {
      // Style the totals row
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [229, 231, 235];
        data.cell.styles.textColor = [25, 35, 75];
      }
      
      // Color code grades
      if (data.column.index === 5 && data.row.index < tableData.length - 1) {
        const grade = data.cell.text[0];
        if (grade === 'EE') {
          data.cell.styles.fillColor = [34, 197, 94];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (grade === 'ME') {
          data.cell.styles.fillColor = [59, 130, 246];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (grade === 'AE') {
          data.cell.styles.fillColor = [245, 158, 11];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (grade === 'BE') {
          data.cell.styles.fillColor = [239, 68, 68];
          data.cell.styles.textColor = [255, 255, 255];
        }
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

// Enhanced PDF generation for performance reports
export const generatePerformanceReportPDF = async (reportData: any) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Enhanced Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(25, 35, 75);
  
  if (reportData.type === 'class') {
    pdf.text(`${reportData.grade.toUpperCase()} PERFORMANCE REPORT`, 148, 20, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text(`${reportData.term} - ${reportData.academicYear}`, 148, 30, { align: 'center' });
  } else {
    pdf.text('SCHOOL-WIDE PERFORMANCE REPORT', 148, 20, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text(`Academic Year: ${reportData.academicYear}`, 148, 30, { align: 'center' });
  }

  // Header decoration
  pdf.setDrawColor(25, 35, 75);
  pdf.setLineWidth(1);
  pdf.line(20, 35, 277, 35);

  // Report generation info
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 20, 45);

  let yPosition = 55;

  // Process data and create summary
  const examMarks = reportData.examMarks || [];
  const subjects = reportData.subjects || [];
  const students = reportData.students || [];

  if (reportData.type === 'class') {
    // Class-specific report content
    const classStudents = students.filter((s: any) => s.grade === reportData.grade);
    const classExams = examMarks.filter((e: any) => 
      e.grade === reportData.grade && 
      e.term === reportData.term && 
      e.academic_year === reportData.academicYear
    );

    // Summary statistics
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(25, 35, 75);
    pdf.text('CLASS SUMMARY', 20, yPosition);

    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    const summaryData = [
      ['Total Students Enrolled:', classStudents.length.toString()],
      ['Students with Results:', classExams.length.toString()],
      ['Completion Rate:', `${classExams.length > 0 ? Math.round((classExams.length / classStudents.length) * 100) : 0}%`]
    ];

    summaryData.forEach(([label, value]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, 80, yPosition);
      yPosition += 6;
    });

    yPosition += 10;

    // Student performance table
    if (classExams.length > 0) {
      const tableData = classExams.map((exam: any, index: number) => {
        const student = classStudents.find((s: any) => s.id === exam.student_id);
        const totalPossible = subjects.reduce((sum: number, subject: any) => sum + (subject.max_marks || 100), 0);
        const percentage = totalPossible > 0 ? Math.round((exam.total_marks / totalPossible) * 100) : 0;
        
        let cbcGrade = 'BE';
        if (percentage >= 80) cbcGrade = 'EE';
        else if (percentage >= 50) cbcGrade = 'ME';
        else if (percentage >= 40) cbcGrade = 'AE';

        return [
          (index + 1).toString(),
          student?.student_name || 'Unknown',
          student?.registration_number || 'N/A',
          exam.total_marks?.toString() || '0',
          totalPossible.toString(),
          `${percentage}%`,
          cbcGrade
        ];
      });

      // Sort by total marks descending
      tableData.sort((a, b) => parseInt(b[3]) - parseInt(a[3]));

      pdf.autoTable({
        head: [['Pos.', 'Student Name', 'Reg. Number', 'Total Marks', 'Possible', 'Percentage', 'CBC Grade']],
        body: tableData,
        startY: yPosition,
        margin: { left: 20, right: 20 },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          font: 'helvetica',
          textColor: [40, 40, 40],
        },
        headStyles: {
          fillColor: [25, 35, 75],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [248, 249, 252],
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 60 },
          2: { cellWidth: 40 },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' },
          5: { cellWidth: 25, halign: 'center' },
          6: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
        },
        didParseCell: function(data: any) {
          // Color code CBC grades
          if (data.column.index === 6) {
            const grade = data.cell.text[0];
            if (grade === 'EE') {
              data.cell.styles.fillColor = [34, 197, 94];
              data.cell.styles.textColor = [255, 255, 255];
            } else if (grade === 'ME') {
              data.cell.styles.fillColor = [59, 130, 246];
              data.cell.styles.textColor = [255, 255, 255];
            } else if (grade === 'AE') {
              data.cell.styles.fillColor = [245, 158, 11];
              data.cell.styles.textColor = [255, 255, 255];
            } else if (grade === 'BE') {
              data.cell.styles.fillColor = [239, 68, 68];
              data.cell.styles.textColor = [255, 255, 255];
            }
          }
        }
      });
    }
  } else {
    // School-wide report content
    pdf.text(`Total Students: ${students.length}`, 180, 45);

    // Grade-wise summary
    const gradeGroups = students.reduce((acc: any, student: any) => {
      if (!acc[student.grade]) acc[student.grade] = [];
      acc[student.grade].push(student);
      return acc;
    }, {});

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(25, 35, 75);
    pdf.text('GRADE-WISE ENROLLMENT SUMMARY', 20, yPosition);

    yPosition += 10;

    const gradeTableData = Object.entries(gradeGroups).map(([grade, gradeStudents]: [string, any]) => [
      grade,
      (gradeStudents as any[]).length.toString(),
      (gradeStudents as any[]).filter(s => s.gender === 'Male').length.toString(),
      (gradeStudents as any[]).filter(s => s.gender === 'Female').length.toString(),
    ]);

    pdf.autoTable({
      head: [['Grade', 'Total Students', 'Male', 'Female']],
      body: gradeTableData,
      startY: yPosition,
      margin: { left: 20, right: 150 },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [25, 35, 75],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
      },
    });
  }

  // Footer
  const finalY = (pdf as any).lastAutoTable?.finalY || 200;
  
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.5);
  pdf.line(20, 200, 277, 200);
  
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Generated by School Management System', 20, 207);
  pdf.text(`Report ID: RPT-${Date.now().toString().slice(-8)}`, 220, 207);

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