
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { fetchStudentsByGrade, saveExaminationMarks, type Student } from "@/utils/studentDatabase";
import { fetchSubjects, type Subject } from "@/utils/subjectDatabase";
import { supabase } from "@/integrations/supabase/client";

const BulkMarksEntry = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  const terms = ["Term 1", "Term 2", "Term 3"];
  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const subjectsData = await fetchSubjects();
      setSubjects(subjectsData);
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
    if (!selectedGrade || !selectedTerm) {
      toast({
        title: "Error",
        description: "Please select grade and term first",
        variant: "destructive",
      });
      return;
    }

    try {
      const students = await fetchStudentsByGrade(selectedGrade);
      
      if (students.length === 0) {
        toast({
          title: "No Students",
          description: `No students found for ${selectedGrade}`,
          variant: "destructive",
        });
        return;
      }

      // Create headers with student info and all subjects
      const headers = [
        "Registration Number",
        "Student Name",
        ...subjects.map(subject => `${subject.label} (Max: ${subject.max_marks})`)
      ];

      // Create CSV content
      const csvRows = [headers.join(",")];
      
      // Add student rows with default marks as 0
      students.forEach(student => {
        const row = [
          student.registration_number,
          `"${student.student_name}"`,
          ...subjects.map(() => "0") // Default marks as 0
        ];
        csvRows.push(row.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `marks_template_${selectedGrade.replace(" ", "_")}_${selectedTerm.replace(" ", "_")}_${academicYear}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Template Downloaded",
          description: `CSV template for ${selectedGrade} - ${selectedTerm} downloaded successfully with ${subjects.length} subjects.`,
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

  const processBatchMarks = async (batchData: any[], batchIndex: number) => {
    const batchResults = {
      success: 0,
      errors: [] as string[]
    };

    for (const item of batchData) {
      try {
        // Find student by registration number using direct supabase query for better performance
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('id, student_name')
          .eq('registration_number', item.registrationNumber)
          .eq('grade', selectedGrade)
          .single();

        if (studentError || !student) {
          batchResults.errors.push(`Student not found: ${item.registrationNumber}`);
          continue;
        }

        // Prepare subject marks - only include subjects with marks > 0
        const subjectMarks = item.subjectMarks.filter((mark: any) => mark.marks > 0);
        const totalMarks = subjectMarks.reduce((sum: number, mark: any) => sum + mark.marks, 0);

        // Use upsert for better performance and handle existing records
        const { error: saveError } = await supabase
          .from('examination_marks')
          .upsert({
            student_id: student.id,
            grade: selectedGrade,
            term: selectedTerm,
            academic_year: academicYear,
            subject_marks: subjectMarks,
            total_marks: totalMarks,
            remarks: `Bulk uploaded for ${selectedTerm}`,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'student_id,grade,term,academic_year'
          });

        if (saveError) {
          console.error(`Error saving marks for ${item.registrationNumber}:`, saveError);
          batchResults.errors.push(`Failed to save ${item.registrationNumber}: ${saveError.message}`);
        } else {
          batchResults.success++;
        }

        // Update progress
        setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));

      } catch (error) {
        console.error(`Error processing ${item.registrationNumber}:`, error);
        batchResults.errors.push(`Error processing ${item.registrationNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return batchResults;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedGrade || !selectedTerm) {
      toast({
        title: "Error",
        description: "Please select grade and term first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: 0 });

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV file appears to be empty or invalid");
      }

      // Parse header to get subject order
      const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
      const dataLines = lines.slice(1);
      
      // Parse all data first
      const parsedData = [];
      for (const line of dataLines) {
        if (!line.trim()) continue;

        const values = line.split(",").map(v => v.trim().replace(/"/g, ""));
        
        if (values.length < 2) continue;

        const registrationNumber = values[0];
        const studentName = values[1];
        const marksData = values.slice(2);

        // Prepare subject marks with subject IDs
        const subjectMarks = subjects.map((subject, index) => ({
          subject_id: subject.key,
          marks: parseInt(marksData[index]) || 0
        }));

        parsedData.push({
          registrationNumber,
          studentName,
          subjectMarks
        });
      }

      if (parsedData.length === 0) {
        throw new Error("No valid data found in CSV file");
      }

      setUploadProgress({ current: 0, total: parsedData.length });

      // Process in smaller batches for better performance (batch size of 10)
      const batchSize = 10;
      let totalSuccess = 0;
      const allErrors: string[] = [];

      for (let i = 0; i < parsedData.length; i += batchSize) {
        const batch = parsedData.slice(i, i + batchSize);
        const batchIndex = Math.floor(i / batchSize);
        
        console.log(`Processing batch ${batchIndex + 1} of ${Math.ceil(parsedData.length / batchSize)}`);
        
        const batchResult = await processBatchMarks(batch, batchIndex);
        totalSuccess += batchResult.success;
        allErrors.push(...batchResult.errors);

        // Small delay between batches to prevent overwhelming the database
        if (i + batchSize < parsedData.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const totalErrors = allErrors.length;
      
      toast({
        title: "Upload Complete",
        description: `Successfully processed ${totalSuccess} students. ${totalErrors} errors occurred.`,
        variant: totalErrors > 0 ? "destructive" : "default",
      });

      if (allErrors.length > 0 && allErrors.length <= 10) {
        console.log("Upload errors:", allErrors);
        // Show first few errors to user
        toast({
          title: "Some Errors Occurred",
          description: allErrors.slice(0, 3).join("; "),
          variant: "destructive",
        });
      }

      // Clear the file input
      event.target.value = "";

    } catch (error) {
      console.error("File processing error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process the uploaded file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0 });
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
            Upload student marks in bulk using CSV files. Select grade, term and academic year first, then download the template with current subjects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Grade *</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              disabled={!selectedGrade || !selectedTerm || subjects.length === 0}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Template ({subjects.length} subjects)</span>
            </Button>

            <div className="flex items-center space-x-2 flex-1">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading || !selectedGrade || !selectedTerm}
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {isUploading && (
                <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {uploadProgress.total > 0 ? `${uploadProgress.current}/${uploadProgress.total}` : 'Processing...'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Select grade, term and academic year first</li>
              <li>• Download the CSV template which contains all current subjects and students from the selected grade</li>
              <li>• Fill in the marks for each subject (leave as 0 if not applicable)</li>
              <li>• Upload the completed file to bulk update student records</li>
              <li>• Processing is done in batches for better performance</li>
              <li>• All uploaded marks will be reflected in student portals immediately</li>
            </ul>
          </div>

          {subjects.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Available Subjects ({subjects.length}):</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {subjects.map(subject => (
                  <div key={subject.id} className="text-sm text-green-700">
                    {subject.label} (Max: {subject.max_marks})
                  </div>
                ))}
              </div>
            </div>
          )}

          {subjects.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">No Subjects Found</h4>
              <p className="text-sm text-yellow-700">
                Please add subjects first in the Subject Management section before using bulk marks entry.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkMarksEntry;
