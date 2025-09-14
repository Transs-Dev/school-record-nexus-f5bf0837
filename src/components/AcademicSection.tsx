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
import { supabase } from "@/integrations/supabase/client";
import ResultsSection from "./ResultsSection";
import BulkMarksEntry from "./BulkMarksEntry";

interface Subject {
  id: string;
  key: string;
  label: string;
  max_marks: number;
}

const AcademicSection = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [subjectMarks, setSubjectMarks] = useState<Record<string, number>>({});
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      loadStudentsByGrade();
    } else {
      setStudents([]);
      setSelectedStudent("");
    }
  }, [selectedGrade]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
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
        description: "Failed to load subjects from database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStudentsByGrade = async () => {
    try {
      console.log("Loading students for grade:", selectedGrade);
      const studentsData = await fetchStudentsByGrade(selectedGrade);
      console.log("Students loaded:", studentsData);
      setStudents(studentsData);
      setSelectedStudent("");
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

  const calculateMaxPossibleMarks = () => {
    return subjects.reduce((total, subject) => total + subject.max_marks, 0);
  };

  const handleSubmit = async () => {
    console.log("Starting examination marks submission...");

    if (!selectedStudent || !selectedGrade || !selectedTerm || !academicYear) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const hasMarks = Object.values(subjectMarks).some(mark => mark > 0);
    if (!hasMarks) {
      toast({
        title: "Error", 
        description: "Please enter marks for at least one subject",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const totalMarks = calculateTotalMarks();
      const subjectMarksArray: SubjectMark[] = Object.entries(subjectMarks)
        .filter(([_, marks]) => marks > 0)
        .map(([subject_id, marks]) => ({
          subject_id,
          marks
        }));

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

      setSubjectMarks({});
      setRemarks("");
    } catch (error) {
      console.error("Error saving examination marks:", error);
      
      let errorMessage = "Failed to save examination marks";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading subjects...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Academic Management</CardTitle>
          <CardDescription>Manage examination marks and view student performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="marks-entry" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 h-auto">
              <TabsTrigger value="marks-entry" className="text-xs sm:text-sm">Individual Marks Entry</TabsTrigger>
              <TabsTrigger value="bulk-entry" className="text-xs sm:text-sm">Bulk Marks Entry</TabsTrigger>
              <TabsTrigger value="performance" className="text-xs sm:text-sm">Student Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="marks-entry" className="space-y-6">
              <div className="space-y-6">
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

                {selectedStudent && subjects.length > 0 && (
                  <>
                    <div>
                      <Label className="text-lg font-semibold mb-4 block">Subject Marks</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {subjects.map(subject => (
                          <div key={subject.key} className="space-y-2">
                            <Label htmlFor={`subject-${subject.key}`} className="text-sm font-medium">
                              {subject.label} (Max: {subject.max_marks})
                            </Label>
                            <Input
                              type="number"
                              id={`subject-${subject.key}`}
                              placeholder={`0-${subject.max_marks}`}
                              min="0"
                              max={subject.max_marks}
                              value={subjectMarks[subject.key] || ''}
                              onChange={(e) => handleSubjectMarkChange(subject.key, e.target.value)}
                              className="w-full"
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                        <Label className="text-sm font-medium">Total Marks: </Label>
                        <span className="text-lg font-bold text-blue-600">
                          {calculateTotalMarks()}/{calculateMaxPossibleMarks()}
                        </span>
                      </div>
                    </div>

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

                    <Button 
                      onClick={handleSubmit} 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Marks"}
                    </Button>
                  </>
                )}

                {selectedStudent && subjects.length === 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-800 mb-2">No Subjects Available</h4>
                    <p className="text-sm text-yellow-700">
                      No subjects have been configured yet. Please go to the "Subject Management" tab to add subjects before entering marks.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="bulk-entry">
              <BulkMarksEntry />
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
