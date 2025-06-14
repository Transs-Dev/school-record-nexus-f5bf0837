
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fetchStudentsByGrade, saveExaminationMarks, type Student, type SubjectMark } from "@/utils/studentDatabase";
import ResultsSection from "./ResultsSection";

const AcademicSection = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [subjectMarks, setSubjectMarks] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState("");
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

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  useEffect(() => {
    if (selectedGrade) {
      loadStudentsByGrade();
    } else {
      setStudents([]);
      setSelectedStudent("");
    }
  }, [selectedGrade]);

  const loadStudentsByGrade = async () => {
    try {
      const studentsData = await fetchStudentsByGrade(selectedGrade);
      setStudents(studentsData);
      setSelectedStudent(""); // Reset selected student when grade changes
    } catch (error) {
      console.error("Error loading students:", error);
      toast({
        title: "Error",
        description: "Failed to load students for selected grade",
        variant: "destructive",
      });
    }
  };

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
    } catch (error) {
      console.error("Error saving examination marks:", error);
      toast({
        title: "Error",
        description: "Failed to save examination marks",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Academic Management</CardTitle>
          <CardDescription>Manage examination marks and view student performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="marks-entry" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="marks-entry">Marks Entry</TabsTrigger>
              <TabsTrigger value="performance">Student Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="marks-entry" className="space-y-6">
              <div className="space-y-6">
                {/* Grade Selection First */}
                <div>
                  <Label htmlFor="grade">Select Grade First</Label>
                  <Select onValueChange={setSelectedGrade} value={selectedGrade}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Student and Term Selection - Only show if grade is selected */}
                {selectedGrade && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="student">Student</Label>
                      <Select onValueChange={setSelectedStudent} value={selectedStudent}>
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
                      <Label htmlFor="term">Term</Label>
                      <Select onValueChange={setSelectedTerm} value={selectedTerm}>
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
                  </div>
                )}

                {selectedGrade && (
                  <div>
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      type="number"
                      id="academicYear"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                    />
                  </div>
                )}

                {/* Subject Marks - Only show if student is selected */}
                {selectedStudent && (
                  <>
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
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="performance">
              <ResultsSection />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicSection;
