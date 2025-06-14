
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fetchAllStudents, saveExaminationMarks, fetchExaminationMarks, type Student, type SubjectMark } from "@/utils/studentDatabase";

const AcademicSection = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [subjectMarks, setSubjectMarks] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  // Define all subjects in the order requested
  const subjects = [
    { key: "agriculture", label: "Agriculture" },
    { key: "biology", label: "Biology" },
    { key: "business_studies", label: "Business Studies" },
    { key: "chemistry", label: "Chemistry" },
    { key: "english", label: "English" },
    { key: "geography", label: "Geography" },
    { key: "history", label: "History" },
    { key: "ire_cre", label: "IRE/CRE" },
    { key: "kiswahili", label: "Kiswahili" },
    { key: "mathematics", label: "Mathematics" },
    { key: "physics", label: "Physics" }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const studentsData = await fetchAllStudents();
        setStudents(studentsData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load students",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [toast]);

  useEffect(() => {
    loadResults();
  }, [selectedGrade, selectedTerm, academicYear, toast]);

  const handleSubjectMarkChange = (subjectKey: string, value: string) => {
    const marks = parseInt(value) || 0;
    setSubjectMarks(prev => ({
      ...prev,
      [subjectKey]: marks
    }));
  };

  const calculateTotalMarks = () => {
    return Object.values(subjectMarks).reduce((total, mark) => total + mark, 0);
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !selectedGrade || !selectedTerm || !academicYear) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const totalMarks = calculateTotalMarks();
    const subjectMarksArray: SubjectMark[] = Object.entries(subjectMarks).map(([subject_id, marks]) => ({
      subject_id,
      marks
    }));

    try {
      await saveExaminationMarks({
        student_id: selectedStudent,
        grade: selectedGrade,
        term: selectedTerm,
        academic_year: academicYear,
        subject_marks: subjectMarksArray,
        total_marks: totalMarks,
        remarks: remarks
      });

      toast({
        title: "Success",
        description: "Examination marks saved successfully",
      });

      // Clear form
      setSubjectMarks({});
      setRemarks("");
      loadResults();
    } catch (error) {
      console.error("Error saving examination marks:", error);
      toast({
        title: "Error",
        description: "Failed to save examination marks",
        variant: "destructive",
      });
    }
  };

  const loadResults = async () => {
    if (!selectedGrade || !selectedTerm) return;
    
    try {
      const examResults = await fetchExaminationMarks(selectedGrade, selectedTerm, academicYear);
      const studentsData = await fetchAllStudents();
      
      const resultsWithStudentInfo = examResults.map(result => {
        const student = studentsData.find(s => s.id === result.student_id);
        
        let parsedSubjectMarks: SubjectMark[] = [];
        if (result.subject_marks) {
          try {
            if (Array.isArray(result.subject_marks)) {
              parsedSubjectMarks = result.subject_marks as unknown as SubjectMark[];
            } else if (typeof result.subject_marks === 'string') {
              parsedSubjectMarks = JSON.parse(result.subject_marks);
            }
          } catch (error) {
            console.error("Error parsing subject marks:", error);
            parsedSubjectMarks = [];
          }
        }
        
        return {
          ...result,
          student_name: student?.student_name || "Unknown",
          registration_number: student?.registration_number || "Unknown",
          subject_marks: parsedSubjectMarks
        };
      });
      
      setResults(resultsWithStudentInfo);
    } catch (error) {
      console.error("Error loading results:", error);
      toast({
        title: "Error",
        description: "Failed to load results",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Examination Marks Entry</CardTitle>
          <CardDescription>Enter examination marks for students</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Student and Term Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="student">Student</Label>
              <Select onValueChange={setSelectedStudent}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>{student.student_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Select onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade 1">Grade 1</SelectItem>
                  <SelectItem value="Grade 2">Grade 2</SelectItem>
                  <SelectItem value="Grade 3">Grade 3</SelectItem>
                  <SelectItem value="Grade 4">Grade 4</SelectItem>
                  <SelectItem value="Grade 5">Grade 5</SelectItem>
                  <SelectItem value="Grade 6">Grade 6</SelectItem>
                  <SelectItem value="Grade 7">Grade 7</SelectItem>
                  <SelectItem value="Grade 8">Grade 8</SelectItem>
                  <SelectItem value="Grade 9">Grade 9</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="term">Term</Label>
              <Select onValueChange={setSelectedTerm}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Term 1">Term 1</SelectItem>
                  <SelectItem value="Term 2">Term 2</SelectItem>
                  <SelectItem value="Term 3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                type="number"
                id="academicYear"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>
          </div>

          {/* Subject Marks - Column Layout */}
          <div>
            <Label className="text-lg font-semibold mb-4 block">Subject Marks</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(subject => (
                <div key={subject.key} className="space-y-2">
                  <Label htmlFor={`subject-${subject.key}`} className="text-sm font-medium">
                    {subject.label}
                  </Label>
                  <Input
                    type="number"
                    id={`subject-${subject.key}`}
                    placeholder="0-100"
                    min="0"
                    max="100"
                    value={subjectMarks[subject.key] || ''}
                    onChange={(e) => handleSubjectMarkChange(subject.key, e.target.value)}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
            
            {/* Total Marks Display */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <Label className="text-sm font-medium">Total Marks: </Label>
              <span className="text-lg font-bold text-blue-600">
                {calculateTotalMarks()}/{subjects.length * 100}
              </span>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Enter remarks about student performance"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            Save Marks
          </Button>
        </CardContent>
      </Card>

      {/* Results Display */}
      {results.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Examination Results</CardTitle>
            <CardDescription>Results for {selectedGrade}, {selectedTerm}, {academicYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Marks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result) => (
                    <tr key={result.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{result.registration_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{result.student_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{result.total_marks}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{result.remarks}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AcademicSection;
