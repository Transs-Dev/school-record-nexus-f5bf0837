
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Save, Search, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  fetchStudentsByGrade, 
  saveExaminationMarks,
  fetchExaminationMarks,
  type Student,
  type ExaminationMark 
} from "@/utils/studentDatabase";
import { fetchSubjects, type Subject } from "@/utils/subjectDatabase";

const AcademicSection = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<{ [key: string]: { [subject: string]: number } }>({});
  const [existingMarks, setExistingMarks] = useState<ExaminationMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  const terms = ["Term 1", "Term 2", "Term 3"];
  const currentYear = new Date().getFullYear().toString();

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedGrade && selectedTerm) {
      loadStudentsAndMarks();
    }
  }, [selectedGrade, selectedTerm]);

  const loadSubjects = async () => {
    try {
      const subjectsData = await fetchSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast({
        title: "Error Loading Subjects",
        description: "Failed to load subjects. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  const loadStudentsAndMarks = async () => {
    try {
      setLoading(true);
      
      // Load students for the selected grade
      const studentsData = await fetchStudentsByGrade(selectedGrade);
      setStudents(studentsData);

      // Load existing marks for the selected grade, term, and year
      const marksData = await fetchExaminationMarks(selectedGrade, selectedTerm, currentYear);
      setExistingMarks(marksData);

      // Initialize marks state with existing data
      const marksState: { [key: string]: { [subject: string]: number } } = {};
      
      studentsData.forEach(student => {
        marksState[student.id] = {};
        subjects.forEach(subject => {
          const existingMark = marksData.find(mark => mark.student_id === student.id);
          marksState[student.id][subject.key] = existingMark ? (existingMark[subject.key as keyof ExaminationMark] as number || 0) : 0;
        });
      });

      setMarks(marksState);
      
    } catch (error) {
      console.error('Error loading students and marks:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load students and marks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, subject: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const subjectData = subjects.find(s => s.key === subject);
    const maxMarks = subjectData?.max_marks || 100;
    
    if (numValue > maxMarks) {
      toast({
        title: "Invalid Mark",
        description: `Mark cannot exceed ${maxMarks} for ${subjectData?.label || subject}.`,
        variant: "destructive"
      });
      return;
    }
    
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: numValue
      }
    }));
  };

  const calculateTotal = (studentId: string) => {
    if (!marks[studentId]) return 0;
    return Object.values(marks[studentId]).reduce((sum, mark) => sum + (mark || 0), 0);
  };

  const getGrade = (total: number) => {
    const totalPossible = subjects.reduce((sum, subject) => sum + subject.max_marks, 0);
    const percentage = totalPossible > 0 ? (total / totalPossible) * 100 : 0;
    
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  const saveMarks = async () => {
    if (!selectedGrade || !selectedTerm) {
      toast({
        title: "Selection Required",
        description: "Please select both grade and term before saving marks.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      let savedCount = 0;
      let errorCount = 0;

      for (const student of students) {
        try {
          const studentMarks = marks[student.id] || {};
          const total = calculateTotal(student.id);
          
          const examData = {
            student_id: student.id,
            grade: selectedGrade,
            term: selectedTerm,
            academic_year: currentYear,
            total_marks: total,
            ...studentMarks
          };

          await saveExaminationMarks(examData);
          savedCount++;
        } catch (error) {
          console.error(`Error saving marks for student ${student.student_name}:`, error);
          errorCount++;
        }
      }

      if (savedCount > 0) {
        toast({
          title: "Marks Saved Successfully",
          description: `Saved marks for ${savedCount} student(s). ${errorCount > 0 ? `${errorCount} failed.` : ''}`,
        });
        
        // Reload data to show updated marks
        await loadStudentsAndMarks();
      } else {
        toast({
          title: "Save Failed",
          description: "No marks were saved. Please try again.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error saving marks:', error);
      toast({
        title: "Error Saving Marks",
        description: "Failed to save examination marks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Academic Management</h2>
        <p className="text-gray-600">Enter and manage student examination marks</p>
      </div>

      {/* Selection Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Select Class and Term</span>
          </CardTitle>
          <CardDescription>
            Choose the grade and term to enter examination marks
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading students and marks...</span>
          </CardContent>
        </Card>
      )}

      {/* Marks Entry Table */}
      {selectedGrade && selectedTerm && !loading && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Marks Entry - {selectedGrade} ({selectedTerm})</span>
              </div>
              <Button onClick={saveMarks} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save All Marks
                  </>
                )}
              </Button>
            </CardTitle>
            <CardDescription>
              Enter marks for each subject. Maximum marks are shown for each subject.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Reg. Number</TableHead>
                    <TableHead className="min-w-[150px]">Student Name</TableHead>
                    {subjects.map((subject) => (
                      <TableHead key={subject.key} className="min-w-[100px] text-center">
                        {subject.label}
                        <br />
                        <span className="text-xs text-gray-500">/{subject.max_marks}</span>
                      </TableHead>
                    ))}
                    <TableHead className="min-w-[100px] text-center">Total</TableHead>
                    <TableHead className="min-w-[80px] text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const total = calculateTotal(student.id);
                    const grade = getGrade(total);
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-mono text-sm">
                          {student.registration_number}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.student_name}
                        </TableCell>
                        {subjects.map((subject) => (
                          <TableCell key={subject.key} className="text-center">
                            <Input
                              type="number"
                              min="0"
                              max={subject.max_marks}
                              value={marks[student.id]?.[subject.key] || 0}
                              onChange={(e) => handleMarkChange(student.id, subject.key, e.target.value)}
                              className="w-20 mx-auto text-center"
                              disabled={saving}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-bold">
                            {total}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={
                              grade === "A" ? "default" :
                              grade === "B" || grade === "C" ? "secondary" : "destructive"
                            }
                          >
                            {grade}
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

      {/* No Students Found */}
      {selectedGrade && selectedTerm && !loading && students.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600 text-center">
              No students are enrolled in {selectedGrade}. Please check the enrollment section.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {(!selectedGrade || !selectedTerm) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plus className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Grade and Term</h3>
            <p className="text-gray-600 text-center">
              Choose a grade and term to start entering examination marks
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AcademicSection;
