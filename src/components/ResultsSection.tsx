import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, BookOpen, Loader2, Printer, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  fetchStudentsByGrade, 
  fetchExaminationMarks, 
  type Student,
  type ExaminationMark 
} from "@/utils/studentDatabase";
import { supabase } from "@/integrations/supabase/client";

interface Subject {
  id: string;
  key: string;
  label: string;
  max_marks: number;
}

const ResultsSection = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [examResults, setExamResults] = useState<ExaminationMark[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  const terms = ["Term 1", "Term 2", "Term 3"];
  const currentYear = new Date().getFullYear().toString();

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedGrade && selectedTerm) {
      loadResults();
    } else {
      setStudents([]);
      setExamResults([]);
    }
  }, [selectedGrade, selectedTerm]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('label');

      if (error) throw error;

      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Error Loading Subjects",
        description: "Failed to load subjects from database. Using default subjects.",
        variant: "destructive"
      });
      
      // Fallback to default subjects if database fetch fails
      setSubjects([
        { id: "1", key: "agriculture", label: "Agriculture", max_marks: 100 },
        { id: "2", key: "biology", label: "Biology", max_marks: 100 },
        { id: "3", key: "business_studies", label: "Business Studies", max_marks: 100 },
        { id: "4", key: "chemistry", label: "Chemistry", max_marks: 100 },
        { id: "5", key: "english", label: "English", max_marks: 100 },
        { id: "6", key: "geography", label: "Geography", max_marks: 100 },
        { id: "7", key: "history", label: "History", max_marks: 100 },
        { id: "8", key: "ire_cre", label: "IRE/CRE", max_marks: 100 },
        { id: "9", key: "kiswahili", label: "Kiswahili", max_marks: 100 },
        { id: "10", key: "mathematics", label: "Mathematics", max_marks: 100 },
        { id: "11", key: "physics", label: "Physics", max_marks: 100 }
      ]);
    }
  };

  const loadResults = async () => {
    try {
      setLoading(true);
      
      // Load students for the selected grade
      const studentsData = await fetchStudentsByGrade(selectedGrade);
      
      // Load examination results for the selected term and grade
      const resultsData = await fetchExaminationMarks(selectedGrade, selectedTerm, currentYear);
      
      // Sort results by total marks in descending order (highest to lowest)
      const sortedResults = resultsData.sort((a, b) => (b.total_marks || 0) - (a.total_marks || 0));
      
      setStudents(studentsData);
      setExamResults(sortedResults);
      
      toast({
        title: "Results Loaded",
        description: `Loaded ${sortedResults.length} student results for ${selectedGrade} - ${selectedTerm}`,
      });
    } catch (error) {
      console.error('Error loading results:', error);
      toast({
        title: "Error Loading Results",
        description: "Failed to load examination results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStudentByExamResult = (examResult: ExaminationMark) => {
    return students.find(student => student.id === examResult.student_id);
  };

  const getSubjectMark = (examResult: ExaminationMark, subjectKey: string) => {
    if (!examResult.subject_marks) return 0;
    
    let parsedSubjectMarks: any[] = [];
    try {
      if (Array.isArray(examResult.subject_marks)) {
        parsedSubjectMarks = examResult.subject_marks;
      } else if (typeof examResult.subject_marks === 'string') {
        parsedSubjectMarks = JSON.parse(examResult.subject_marks);
      }
    } catch (error) {
      console.error("Error parsing subject marks:", error);
      return 0;
    }
    
    const subjectMark = parsedSubjectMarks.find(mark => mark.subject_id === subjectKey);
    return subjectMark?.marks || 0;
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getPositionBadgeVariant = (position: number) => {
    if (position <= 3) return "default";
    if (position <= 10) return "secondary";
    return "outline";
  };

  const getMarksBadgeVariant = (marks: number, maxMarks: number = 100) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    if (percentage >= 40) return "outline";
    return "destructive";
  };

  const getLetterGrade = (totalMarks: number, maxPossibleMarks: number) => {
    const percentage = maxPossibleMarks > 0 ? (totalMarks / maxPossibleMarks) * 100 : 0;
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "E";
  };

  const handlePrint = () => {
    if (!selectedGrade || !selectedTerm || examResults.length === 0) {
      toast({
        title: "No Data to Print",
        description: "Please select a grade and term with available results.",
        variant: "destructive"
      });
      return;
    }

    const maxPossibleMarks = subjects.reduce((sum, subject) => sum + subject.max_marks, 0);
    
    const printContent = `
      <html>
        <head>
          <title>Student Performance Report - ${selectedGrade} ${selectedTerm}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { margin: 0; color: #333; }
            .header p { margin: 5px 0; color: #666; }
            .info-section { margin-bottom: 20px; }
            .info-section strong { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .position { font-weight: bold; }
            .grade-a { color: #16a34a; }
            .grade-b { color: #2563eb; }
            .grade-c { color: #ca8a04; }
            .grade-d { color: #dc2626; }
            .grade-e { color: #991b1b; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Student Performance Report</h1>
            <p>Academic Excellence Analysis</p>
          </div>
          
          <div class="info-section">
            <p><strong>Grade:</strong> ${selectedGrade}</p>
            <p><strong>Term:</strong> ${selectedTerm}</p>
            <p><strong>Academic Year:</strong> ${currentYear}</p>
            <p><strong>Total Students:</strong> ${examResults.length}</p>
            <p><strong>Report Generated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Registration Number</th>
                <th>Student Name</th>
                ${subjects.map(subject => `<th>${subject.label}</th>`).join('')}
                <th>Total Marks</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              ${examResults.map((result, index) => {
                const student = students.find(s => s.id === result.student_id);
                const position = index + 1;
                const letterGrade = getLetterGrade(result.total_marks || 0, maxPossibleMarks);
                const gradeClass = `grade-${letterGrade.toLowerCase()}`;
                
                if (!student) return '';
                
                return `
                  <tr>
                    <td class="position">#${position}</td>
                    <td>${student.registration_number}</td>
                    <td>${student.student_name}</td>
                    ${subjects.map(subject => {
                      const marks = getSubjectMark(result, subject.key);
                      return `<td>${marks}</td>`;
                    }).join('')}
                    <td><strong>${result.total_marks || 0}/${maxPossibleMarks}</strong></td>
                    <td class="${gradeClass}"><strong>${letterGrade}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Generated by School Management System | ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      toast({
        title: "Print Failed",
        description: "Unable to open print window. Please check your browser settings.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    if (!selectedGrade || !selectedTerm || examResults.length === 0) {
      toast({
        title: "No Data to Download",
        description: "Please select a grade and term with available results.",
        variant: "destructive"
      });
      return;
    }

    const maxPossibleMarks = subjects.reduce((sum, subject) => sum + subject.max_marks, 0);
    
    // Create CSV content
    const headers = [
      'Position',
      'Registration Number',
      'Student Name',
      ...subjects.map(subject => subject.label),
      'Total Marks',
      'Max Possible',
      'Percentage',
      'Grade'
    ];

    const csvRows = [
      headers.join(','),
      ...examResults.map((result, index) => {
        const student = students.find(s => s.id === result.student_id);
        const position = index + 1;
        const totalMarks = result.total_marks || 0;
        const percentage = maxPossibleMarks > 0 ? ((totalMarks / maxPossibleMarks) * 100).toFixed(1) : '0.0';
        const letterGrade = getLetterGrade(totalMarks, maxPossibleMarks);
        
        if (!student) return '';
        
        const row = [
          position,
          student.registration_number,
          `"${student.student_name}"`, // Wrap in quotes to handle commas in names
          ...subjects.map(subject => getSubjectMark(result, subject.key)),
          totalMarks,
          maxPossibleMarks,
          `${percentage}%`,
          letterGrade
        ];
        
        return row.join(',');
      }).filter(row => row) // Remove empty rows
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `student_performance_${selectedGrade.replace(' ', '_')}_${selectedTerm.replace(' ', '_')}_${currentYear}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Complete",
        description: `Student performance data downloaded successfully.`,
      });
    } else {
      toast({
        title: "Download Failed",
        description: "Your browser doesn't support file downloads.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Student Performance</h3>
        <p className="text-gray-600">View student results ranked by performance</p>
      </div>

      {/* Selection Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="grade-select">Grade</Label>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger id="grade-select">
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="term-select">Term</Label>
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger id="term-select">
              <SelectValue placeholder="Select Term" />
            </SelectTrigger>
            <SelectContent>
              {terms.map((term) => (
                <SelectItem key={term} value={term}>
                  {term}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Print and Download Actions */}
      {selectedGrade && selectedTerm && !loading && examResults.length > 0 && (
        <div className="flex gap-2">
          <Button 
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Results
          </Button>
          <Button 
            onClick={handleDownload}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Loading results...</span>
        </div>
      )}

      {/* Results Table */}
      {selectedGrade && selectedTerm && !loading && examResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Performance Rankings - {selectedGrade} ({selectedTerm})</span>
              <Badge variant="secondary">{examResults.length} Students</Badge>
            </CardTitle>
            <CardDescription>
              Students ranked by total marks (highest to lowest performance)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Position</TableHead>
                    <TableHead className="min-w-[120px]">Reg. Number</TableHead>
                    <TableHead className="min-w-[150px]">Student Name</TableHead>
                    {subjects.map((subject) => (
                      <TableHead key={subject.key} className="min-w-[80px] text-center">
                        {subject.label}
                      </TableHead>
                    ))}
                    <TableHead className="min-w-[100px] text-center">Total</TableHead>
                    <TableHead className="min-w-[80px] text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examResults.map((result, index) => {
                    const student = getStudentByExamResult(result);
                    const position = index + 1;
                    const maxPossibleMarks = subjects.reduce((sum, subject) => sum + subject.max_marks, 0);
                    const letterGrade = getLetterGrade(result.total_marks || 0, maxPossibleMarks);
                    
                    if (!student) return null;
                    
                    return (
                      <TableRow key={result.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getPositionIcon(position)}
                            <Badge variant={getPositionBadgeVariant(position)}>
                              #{position}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.registration_number}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.student_name}
                        </TableCell>
                        {subjects.map((subject) => {
                          const marks = getSubjectMark(result, subject.key);
                          return (
                            <TableCell key={subject.key} className="text-center">
                              <Badge variant={getMarksBadgeVariant(marks, subject.max_marks)}>
                                {marks}
                              </Badge>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center">
                          <Badge 
                            variant={getMarksBadgeVariant(result.total_marks || 0, maxPossibleMarks)}
                            className="text-lg font-bold"
                          >
                            {result.total_marks || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-bold">
                            {letterGrade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results Found */}
      {selectedGrade && selectedTerm && !loading && examResults.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
            <p className="text-gray-600 text-center">
              No examination results found for {selectedGrade} - {selectedTerm}. 
              Please check if marks have been entered for this grade and term.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!selectedGrade && !selectedTerm && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Grade and Term</h3>
            <p className="text-gray-600 text-center">
              Choose a grade and term to view student performance rankings
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsSection;
