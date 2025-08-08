
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { fetchStudentsByGrade, saveExaminationMarks, type Student } from "@/utils/studentDatabase";
import { supabase } from "@/integrations/supabase/client";

interface Subject {
  id: string;
  key: string;
  label: string;
  max_marks: number;
}

const BulkMarksEntry = () => {
  const [selectedTerm, setSelectedTerm] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const terms = ["Term 1", "Term 2", "Term 3"];
  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('label');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      });
    }
  };

  const generateCSVTemplate = async () => {
    if (!selectedTerm) {
      toast({
        title: "Error",
        description: "Please select a term first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a workbook-style CSV with multiple sections for each grade
      const csvSections = [];

      for (const grade of grades) {
        const students = await fetchStudentsByGrade(grade);
        
        if (students.length > 0) {
          // Add grade header
          csvSections.push(`\n${grade} Students`);
          csvSections.push("=".repeat(50));
          
          // Create headers
          const headers = [
            "Registration Number",
            "Student Name",
            ...subjects.map(subject => `${subject.label} (Max: ${subject.max_marks})`)
          ];
          csvSections.push(headers.join(","));
          
          // Add student rows
          students.forEach(student => {
            const row = [
              student.registration_number,
              `"${student.student_name}"`,
              ...subjects.map(() => "0") // Default marks as 0
            ];
            csvSections.push(row.join(","));
          });
        }
      }

      const csvContent = csvSections.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `marks_template_${selectedTerm.replace(" ", "_")}_${academicYear}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Template Downloaded",
          description: `CSV template for ${selectedTerm} downloaded successfully. Each grade section contains students for that grade.`,
        });
      }
    } catch (error) {
      console.error("Error generating template:", error);
      toast({
        title: "Error",
        description: "Failed to generate CSV template",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedTerm) {
      toast({
        title: "Error",
        description: "Please select a term first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      
      let currentGrade = "";
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if this line indicates a new grade section
        const gradeMatch = line.match(/^(Grade \d+) Students?/);
        if (gradeMatch) {
          currentGrade = gradeMatch[1];
          continue;
        }
        
        // Skip separator lines and headers
        if (line.startsWith("=") || line.includes("Registration Number") || !line.includes(",")) {
          continue;
        }

        // Parse data line
        const values = line.split(",").map(v => v.trim().replace(/"/g, ""));
        
        if (values.length < 2) continue;

        const registrationNumber = values[0];
        const studentName = values[1];
        const marksData = values.slice(2);

        try {
          // Find student by registration number
          const { data: student, error: studentError } = await supabase
            .from('students')
            .select('id, grade')
            .eq('registration_number', registrationNumber)
            .single();

          if (studentError || !student) {
            errors.push(`Student not found: ${registrationNumber}`);
            errorCount++;
            continue;
          }

          // Prepare subject marks
          const subjectMarks = subjects.map((subject, index) => ({
            subject_id: subject.key,
            marks: parseInt(marksData[index]) || 0
          })).filter(mark => mark.marks > 0);

          const totalMarks = subjectMarks.reduce((sum, mark) => sum + mark.marks, 0);

          // Save examination marks
          await saveExaminationMarks({
            student_id: student.id,
            grade: student.grade,
            term: selectedTerm,
            academic_year: academicYear,
            subject_marks: subjectMarks,
            total_marks: totalMarks,
            remarks: `Bulk uploaded for ${selectedTerm}`
          });

          successCount++;
        } catch (error) {
          console.error(`Error processing ${registrationNumber}:`, error);
          errors.push(`Failed to process ${registrationNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          errorCount++;
        }
      }

      toast({
        title: "Upload Complete",
        description: `Successfully processed ${successCount} students. ${errorCount} errors occurred.`,
        variant: errorCount > 0 ? "destructive" : "default",
      });

      if (errors.length > 0) {
        console.log("Upload errors:", errors);
      }

      // Clear the file input
      event.target.value = "";

    } catch (error) {
      console.error("File processing error:", error);
      toast({
        title: "Error",
        description: "Failed to process the uploaded file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>Bulk Marks Entry</span>
          </CardTitle>
          <CardDescription>
            Upload student marks in bulk using CSV files. Download the template first, fill in the marks, then upload.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Term *</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map(term => (
                    <SelectItem key={term} value={term}>{term}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Input
                type="number"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={generateCSVTemplate}
              disabled={!selectedTerm}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </Button>

            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading || !selectedTerm}
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {isUploading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-gray-600">Uploading...</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Select a term and download the CSV template</li>
              <li>• The template contains sections for each grade with enrolled students</li>
              <li>• Fill in the marks for each subject (leave as 0 if not applicable)</li>
              <li>• Upload the completed file to bulk update student records</li>
              <li>• All uploaded marks will be reflected in student portals immediately</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkMarksEntry;
