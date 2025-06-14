import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fetchAllStudents, saveExaminationMarks, fetchExaminationMarks, type Student, type SubjectMark } from "@/utils/studentDatabase";
import { fetchAllSubjects, type Subject } from "@/utils/subjectDatabase";

const AcademicSection = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [subjectMarks, setSubjectMarks] = useState<SubjectMark[]>([]);
  const [remarks, setRemarks] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const studentsData = await fetchAllStudents();
        setStudents(studentsData);

        const subjectsData = await fetchAllSubjects();
        setSubjects(subjectsData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load students or subjects",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [toast]);

  useEffect(() => {
    loadResults();
  }, [selectedGrade, selectedTerm, academicYear, toast]);

  const handleStudentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStudent(event.target.value);
  };

  const handleGradeChange = (value: string) => {
    setSelectedGrade(value);
  };

  const handleTermChange = (value: string) => {
    setSelectedTerm(value);
  };

  const handleAcademicYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAcademicYear(event.target.value);
  };

  const handleSubjectMarkChange = (subjectId: string, value: string) => {
    const marks = parseInt(value);
    setSubjectMarks(prevMarks => {
      const existingMarkIndex = prevMarks.findIndex(mark => mark.subject_id === subjectId);
      if (existingMarkIndex !== -1) {
        const newMarks = [...prevMarks];
        newMarks[existingMarkIndex] = { subject_id: subjectId, marks: marks };
        return newMarks;
      } else {
        return [...prevMarks, { subject_id: subjectId, marks: marks }];
      }
    });
  };

  const handleRemarksChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRemarks(event.target.value);
  };

  const calculateTotalMarks = () => {
    return subjectMarks.reduce((total, mark) => total + mark.marks, 0);
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

    try {
      await saveExaminationMarks({
        student_id: selectedStudent,
        grade: selectedGrade,
        term: selectedTerm,
        academic_year: academicYear,
        subject_marks: subjectMarks,
        total_marks: totalMarks,
        remarks: remarks
      });

      toast({
        title: "Success",
        description: "Examination marks saved successfully",
      });

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
        
        // Safely handle the Json type conversion
        let parsedSubjectMarks: SubjectMark[] = [];
        if (result.subject_marks) {
          try {
            if (Array.isArray(result.subject_marks)) {
              parsedSubjectMarks = result.subject_marks as SubjectMark[];
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
          <CardTitle>Examination Marks</CardTitle>
          <CardDescription>Enter examination marks for students</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
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
              <Select onValueChange={handleGradeChange}>
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
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="term">Term</Label>
              <Select onValueChange={handleTermChange}>
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
                onChange={handleAcademicYearChange}
              />
            </div>
          </div>
          <div>
            <Label>Subject Marks</Label>
            {subjects.map(subject => (
              <div key={subject.id} className="grid grid-cols-2 gap-2 items-center">
                <Label htmlFor={`subject-${subject.id}`}>{subject.subject_name}</Label>
                <Input
                  type="number"
                  id={`subject-${subject.id}`}
                  onChange={(e) => handleSubjectMarkChange(subject.id, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              placeholder="Enter remarks"
              value={remarks}
              onChange={handleRemarksChange}
            />
          </div>
          <Button onClick={handleSubmit}>Save Marks</Button>
        </CardContent>
      </Card>

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
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks
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
                        {result.subject_marks && result.subject_marks.map((mark, index) => (
                          <div key={index} className="text-sm text-gray-900">
                            {subjects.find(subject => subject.id === mark.subject_id)?.subject_name}
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {result.subject_marks && result.subject_marks.map((mark, index) => (
                          <div key={index} className="text-sm text-gray-900">
                            {mark.marks}
                          </div>
                        ))}
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
