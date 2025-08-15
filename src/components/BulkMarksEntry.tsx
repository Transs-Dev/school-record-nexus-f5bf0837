import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileSpreadsheet, AlertCircle } from "lucide-react";
import { fetchAllStudents, Student } from "@/utils/studentDatabase";
import { fetchSubjects, Subject } from "@/utils/subjectDatabase";
import { supabase } from "@/integrations/supabase/client";
import { calculateOverallGrade } from "@/utils/gradingSystem";

const BulkMarksEntry = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(new Date().getFullYear().toString());
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8"];
  const terms = ["Term 1", "Term 2", "Term 3"];

  useEffect(() => {
    loadStudents();
    loadSubjects();
  }, []);

  const loadStudents = async () => {
    try {
      const studentsData = await fetchAllStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    }
  };

  const loadSubjects = async () => {
    try {
      const subjectsData = await fetchSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      });
    }
  };

  const downloadCSVTemplate = () => {
    if (!selectedGrade || !selectedTerm) {
      toast({
        title: "Error",
        description: "Please select grade and term first",
        variant: "destructive",
      });
      return;
    }

    const gradeStudents = students.filter(student => student.grade === selectedGrade);
    
    if (gradeStudents.length === 0) {
      toast({
        title: "Error", 
        description: `No students found for ${selectedGrade}`,
        variant: "destructive",
      });
      return;
    }

    // Create headers: Student info (without grade) + all subjects
    const headers = [
      'Student Name*',
      'Registration Number*',
      ...subjects.map(subject => subject.label)
    ];

    let csvContent = headers.join(',') + '\n';

    // Add student rows with empty subject marks
    gradeStudents.forEach(student => {
      const row = [
        student.student_name,
        student.registration_number,
        ...subjects.map(() => '') // Empty marks to be filled
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedGrade.replace(' ', '_')}_${selectedTerm.replace(' ', '_')}_marks_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `CSV template downloaded for ${selectedGrade} - ${selectedTerm}`,
    });
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

    setUploading(true);
    setUploadProgress(0);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV file must contain at least one student row");
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['Student Name*', 'Registration Number*'];
      
      if (!requiredHeaders.every(header => headers.includes(header))) {
        throw new Error("CSV headers don't match the template. Please use the downloaded template.");
      }

      // Get subject headers (everything after the required headers)
      const subjectHeaders = headers.slice(2);
      const subjectMap = new Map();
      
      subjectHeaders.forEach(header => {
        const subject = subjects.find(s => s.label === header);
        if (subject) {
          subjectMap.set(header, subject);
        }
      });

      const marksData = [];
      const errors = [];
      const gradeStudents = students.filter(s => s.grade === selectedGrade);

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Incorrect number of columns`);
          continue;
        }

        const studentName = values[headers.indexOf('Student Name*')];
        const registrationNumber = values[headers.indexOf('Registration Number*')];

        // Find student
        const student = gradeStudents.find(s => 
          s.registration_number === registrationNumber && 
          s.student_name === studentName
        );

        if (!student) {
          errors.push(`Row ${i + 1}: Student not found: ${studentName} (${registrationNumber})`);
          continue;
        }

        // Validate all subject marks are provided
        const subjectMarks = [];
        let hasIncompleteMarks = false;

        subjectHeaders.forEach((header, index) => {
          const subject = subjectMap.get(header);
          if (subject) {
            const markValue = values[2 + index];
            
            if (!markValue || markValue.trim() === '') {
              hasIncompleteMarks = true;
              errors.push(`Row ${i + 1}: Missing marks for ${header}`);
              return;
            }

            const marks = parseInt(markValue);
            if (isNaN(marks) || marks < 0 || marks > subject.max_marks) {
              errors.push(`Row ${i + 1}: Invalid marks for ${header}. Must be between 0 and ${subject.max_marks}`);
              return;
            }

            subjectMarks.push({
              subject_id: subject.id,
              subject_name: subject.label,
              marks: marks,
              max_marks: subject.max_marks
            });
          }
        });

        if (hasIncompleteMarks) {
          continue; // Skip this student if any marks are missing
        }

        const totalMarks = subjectMarks.reduce((sum, mark) => sum + mark.marks, 0);
        const totalMaxMarks = subjectMarks.reduce((sum, mark) => sum + mark.max_marks, 0);
        const overallGrade = calculateOverallGrade(totalMarks, totalMaxMarks);

        marksData.push({
          student_id: student.id,
          student_name: studentName,
          registration_number: registrationNumber,
          grade: selectedGrade,
          term: selectedTerm,
          academic_year: selectedAcademicYear,
          subject_marks: subjectMarks,
          total_marks: totalMarks,
          overall_grade: overallGrade.grade,
          overall_points: overallGrade.points,
          remarks: overallGrade.remarks
        });
      }

      if (errors.length > 0) {
        throw new Error(`Upload failed with errors:\n${errors.slice(0, 10).join('\n')}${errors.length > 10 ? `\n... and ${errors.length - 10} more errors` : ''}`);
      }

      if (marksData.length === 0) {
        throw new Error("No valid student marks found to upload");
      }

      console.log('Uploading marks data:', marksData);

      // Upload marks in batches
      const batchSize = 10;
      let uploadedCount = 0;

      for (let i = 0; i < marksData.length; i += batchSize) {
        const batch = marksData.slice(i, i + batchSize);
        
        const promises = batch.map(async (studentMarks) => {
          // Check if record already exists
          const { data: existing, error: checkError } = await supabase
            .from('examination_marks')
            .select('id')
            .eq('student_id', studentMarks.student_id)
            .eq('grade', studentMarks.grade)
            .eq('term', studentMarks.term)
            .eq('academic_year', studentMarks.academic_year)
            .maybeSingle();

          if (checkError) {
            console.error('Error checking existing record:', checkError);
            throw checkError;
          }

          const dataToSave = {
            student_id: studentMarks.student_id,
            grade: studentMarks.grade,
            term: studentMarks.term,
            academic_year: studentMarks.academic_year,
            subject_marks: studentMarks.subject_marks,
            total_marks: studentMarks.total_marks,
            remarks: `${studentMarks.overall_grade} - ${studentMarks.remarks}`,
            updated_at: new Date().toISOString()
          };

          if (existing) {
            // Update existing record
            console.log('Updating existing record:', existing.id, dataToSave);
            const { error: updateError } = await supabase
              .from('examination_marks')
              .update(dataToSave)
              .eq('id', existing.id);

            if (updateError) {
              console.error('Error updating record:', updateError);
              throw updateError;
            }
          } else {
            // Insert new record
            console.log('Inserting new record:', dataToSave);
            const { error: insertError } = await supabase
              .from('examination_marks')
              .insert(dataToSave);

            if (insertError) {
              console.error('Error inserting record:', insertError);
              throw insertError;
            }
          }
        });

        await Promise.all(promises);
        uploadedCount += batch.length;
        setUploadProgress(Math.round((uploadedCount / marksData.length) * 100));
        
        // Show progress
        if (uploadedCount < marksData.length) {
          toast({
            title: "Progress",
            description: `Uploaded marks for ${uploadedCount} of ${marksData.length} students`,
          });
        }
      }

      toast({
        title: "Success",
        description: `Successfully uploaded marks for ${marksData.length} students with professional grading`,
      });

      // Reset form
      event.target.value = "";
      setUploadProgress(0);

    } catch (error) {
      console.error('Error uploading marks:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload marks",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getGradeStudentCount = () => {
    if (!selectedGrade) return 0;
    return students.filter(student => student.grade === selectedGrade).length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSpreadsheet className="h-5 w-5" />
          <span>Bulk Marks Entry</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Instructions:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Select grade, term, and academic year</li>
            <li>2. Download the CSV template with all students (grade column removed)</li>
            <li>3. Fill in ALL subject marks for ALL students (incomplete uploads will be rejected)</li>
            <li>4. Upload the completed CSV file with professional grading applied</li>
          </ol>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Professional Grading Scale:</h4>
          <div className="text-sm text-green-700 grid grid-cols-2 gap-2">
            <div>A (80-100): Excellent</div>
            <div>A– (75-79): Very Good</div>
            <div>B+ (70-74): Good</div>
            <div>B (65-69): Above Average</div>
            <div>B– (60-64): Average</div>
            <div>C+ (55-59): Fairly Good</div>
            <div>C (50-54): Fair</div>
            <div>C– (45-49): Fair but Weak</div>
            <div>D+ (40-44): Poor</div>
            <div>D (35-39): Very Poor</div>
            <div>D– (30-34): Weak</div>
            <div>E (0-29): Fail</div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-800">Important:</h4>
              <p className="text-sm text-orange-700">
                You must provide marks for ALL subjects for ALL students. Any student with missing marks will be skipped.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Grade</Label>
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
            <Label>Term</Label>
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
            <Label>Academic Year</Label>
            <Input
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              placeholder="e.g., 2024"
            />
          </div>
        </div>

        {selectedGrade && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>{getGradeStudentCount()}</strong> students found in {selectedGrade}
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            onClick={downloadCSVTemplate}
            disabled={!selectedGrade || !selectedTerm}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV Template</span>
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="marks-upload">Upload Completed CSV</Label>
          <Input
            id="marks-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploading || !selectedGrade || !selectedTerm}
          />
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Uploading marks... {uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkMarksEntry;
