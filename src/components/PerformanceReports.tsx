import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, FileText, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generatePerformanceReportPDF } from "@/utils/pdfGenerator";

const PerformanceReports = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];
  const terms = ["Term 1", "Term 2", "Term 3"];

  const generateReport = async (reportType: 'class' | 'school') => {
    if (reportType === 'class' && (!selectedGrade || !selectedTerm || !selectedYear)) {
      toast({
        title: "Missing Information",
        description: "Please select grade, term, and academic year for class report",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let reportData;
      let reportTitle;

      if (reportType === 'class') {
        // Fetch class-specific data
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('grade', selectedGrade);

        if (studentsError) throw studentsError;

        const { data: examMarks, error: examError } = await supabase
          .from('examination_marks')
          .select('*')
          .eq('grade', selectedGrade)
          .eq('term', selectedTerm)
          .eq('academic_year', selectedYear);

        if (examError) throw examError;

        const { data: subjects, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .order('label');

        if (subjectsError) throw subjectsError;

        reportData = {
          type: 'class',
          grade: selectedGrade,
          term: selectedTerm,
          academicYear: selectedYear,
          students: students || [],
          examMarks: examMarks || [],
          subjects: subjects || []
        };
        reportTitle = `${selectedGrade}_${selectedTerm}_${selectedYear}_Class_Report`;
      } else {
        // Fetch school-wide data
        const { data: allStudents, error: studentsError } = await supabase
          .from('students')
          .select('*');

        if (studentsError) throw studentsError;

        const { data: allExamMarks, error: examError } = await supabase
          .from('examination_marks')
          .select('*')
          .eq('academic_year', selectedYear);

        if (examError) throw examError;

        const { data: subjects, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .order('label');

        if (subjectsError) throw subjectsError;

        reportData = {
          type: 'school',
          academicYear: selectedYear,
          students: allStudents || [],
          examMarks: allExamMarks || [],
          subjects: subjects || []
        };
        reportTitle = `${selectedYear}_School_Wide_Performance_Report`;
      }

      const pdf = await generatePerformanceReportPDF(reportData);
      pdf.save(`${reportTitle}.pdf`);

      toast({
        title: "Report Generated",
        description: `${reportType === 'class' ? 'Class' : 'School-wide'} performance report has been generated successfully`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate performance report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Performance Reports
          </h2>
          <p className="text-muted-foreground mt-1">
            Generate detailed PDF reports for class and school-wide performance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Performance Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Class Performance Report</span>
            </CardTitle>
            <CardDescription>
              Generate detailed performance analysis for a specific class, term, and year
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class-grade">Grade</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
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
                <Label htmlFor="class-term">Term</Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
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

              <div className="space-y-2">
                <Label htmlFor="class-year">Academic Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2023, 2022].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={() => generateReport('class')}
              disabled={loading || !selectedGrade || !selectedTerm || !selectedYear}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? "Generating..." : "Generate Class Report"}
            </Button>
          </CardContent>
        </Card>

        {/* School-Wide Performance Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>School-Wide Report</span>
            </CardTitle>
            <CardDescription>
              Generate comprehensive performance analysis across all grades and classes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="school-year">Academic Year</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2023, 2022].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Report Includes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Overall school performance metrics</li>
                <li>• Grade-wise performance comparison</li>
                <li>• Subject performance analysis</li>
                <li>• CBC grade distribution</li>
                <li>• Trends and insights</li>
              </ul>
            </div>

            <Button 
              onClick={() => generateReport('school')}
              disabled={loading || !selectedYear}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? "Generating..." : "Generate School Report"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceReports;