import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Save, Search, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  fetchStudentsByGrade,
  saveExaminationMarks,
  fetchExaminationMarks,
  type Student,
  type ExaminationMark,
} from "@/utils/studentDatabase";
import { fetchSubjects, type Subject } from "@/utils/subjectDatabase";

const AcademicSection = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<{ [key: string]: { [subjectId: string]: number } }>({});
  const [existingMarks, setExistingMarks] = useState<ExaminationMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9",
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
  }, [selectedGrade, selectedTerm, subjects]);

  const loadSubjects = async () => {
    try {
      const subjectsData = await fetchSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error loading subjects:", error);
      toast({
        title: "Error Loading Subjects",
        description: "Failed to load subjects. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  const loadStudentsAndMarks = async () => {
    try {
      setLoading(true);
      const studentsData = await fetchStudentsByGrade(selectedGrade);
      setStudents(studentsData);
      
      const marksData = await fetchExaminationMarks(selectedGrade, selectedTerm, currentYear);
      setExistingMarks(marksData);

      // Initialize marks state
      const marksState: { [key: string]: { [subjectId: string]: number } } = {};
      
      studentsData.forEach((student) => {
        marksState[student.id] = {};
        subjects.forEach((subject) => {
          // Find if this student has existing marks for this subject
          const existingExam = marksData.find(mark => mark.student_id === student.id);
          if (existingExam) {
            const subjectMark = existingExam.subject_marks?.find(sm => sm.subject_id === subject.id);
            marksState[student.id][subject.id] = subjectMark?.marks || 0;
          } else {
            marksState[student.id][subject.id] = 0;
          }
        });
      });
      
      setMarks(marksState);
    } catch (error) {
      console.error("Error loading students and marks:", error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load students and marks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId: string, subjectId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const subject = subjects.find(s => s.id === subjectId);
    
    if (!subject) return;

    if (numValue > subject.max_marks) {
      toast({
        title: "Invalid Mark",
        description: `Mark cannot exceed ${subject.max_marks} for ${subject.label}`,
        variant: "destructive",
      });
      return;
    }

    if (numValue < 0) {
      toast({
        title: "Invalid Mark",
        description: "Mark cannot be negative",
        variant: "destructive",
      });
      return;
    }

    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: numValue,
      },
    }));
  };

  const calculateTotal = (studentId: string) => {
    if (!marks[studentId]) return 0;
    return Object.entries(marks[studentId]).reduce((sum, [subjectId, mark]) => {
      return sum + (mark || 0);
    }, 0);
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
        variant: "destructive",
      });
      return;
    }

    if (students.length === 0) {
      toast({
        title: "No Students",
        description: "There are no students in the selected grade.",
        variant: "destructive",
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

          // Prepare subject marks data
          const subjectMarksData = Object.entries(studentMarks).map(([subjectId, mark]) => ({
            subject_id: subjectId,
            marks: mark,
          }));

          // Save the examination record
          await saveExaminationMarks({
            student_id: student.id,
            grade: selectedGrade,
            term: selectedTerm,
            academic_year: currentYear,
            subject_marks: subjectMarksData,
            total_marks: total,
          });

          savedCount++;
        } catch (error) {
          console.error(`Error saving marks for student ${student.student_name}:`, error);
          errorCount++;
        }
      }

      if (savedCount > 0) {
        toast({
          title: "Marks Saved",
          description: `Successfully saved marks for ${savedCount} student(s). ${errorCount > 0 ? `${errorCount} failed.` : ""}`,
        });
        await loadStudentsAndMarks();
      } else {
        toast({
          title: "Save Failed",
          description: "No marks were saved. Please check your input and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving marks:", error);
      toast({
        title: "Error Saving Marks",
        description: "An unexpected error occurred while saving marks.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Academic Records</CardTitle>
          <CardDescription>Manage student examination marks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Select
                value={selectedGrade}
                onValueChange={(value) => {
                  setSelectedGrade(value);
                  setMarks({});
                }}
              >
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
            <div>
              <Label htmlFor="term">Term</Label>
              <Select
                value={selectedTerm}
                onValueChange={(value) => {
                  setSelectedTerm(value);
                  setMarks({});
                }}
              >
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
            <div className="flex items-end">
              <Button onClick={loadStudentsAndMarks} disabled={!selectedGrade || !selectedTerm}>
                <Search className="mr-2 h-4 w-4" />
                Load Students
              </Button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {!loading && students.length > 0 && (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      {subjects.map((subject) => (
                        <TableHead key={subject.id}>
                          {subject.label} ({subject.max_marks})
                        </TableHead>
                      ))}
                      <TableHead>Total</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const total = calculateTotal(student.id);
                      const grade = getGrade(total);
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.student_name}
                          </TableCell>
                          {subjects.map((subject) => (
                            <TableCell key={`${student.id}-${subject.id}`}>
                              <Input
                                type="number"
                                min="0"
                                max={subject.max_marks}
                                value={marks[student.id]?.[subject.id] || 0}
                                onChange={(e) =>
                                  handleMarkChange(student.id, subject.id, e.target.value)
                                }
                                className="w-20"
                              />
                            </TableCell>
                          ))}
                          <TableCell>{total}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                grade === "A"
                                  ? "default"
                                  : grade === "F"
                                  ? "destructive"
                                  : "secondary"
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
              <div className="mt-4 flex justify-end">
                <Button onClick={saveMarks} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Marks
                </Button>
              </div>
            </>
          )}

          {!loading && students.length === 0 && selectedGrade && selectedTerm && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="mx-auto h-8 w-8" />
              <p className="mt-2">No students found for {selectedGrade} - {selectedTerm}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicSection;
