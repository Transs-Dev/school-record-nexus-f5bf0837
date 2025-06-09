
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Save, Calculator, Loader2, Trophy, Settings, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  fetchStudentsByGrade, 
  saveExaminationMarks, 
  fetchExaminationMarks, 
  calculateStudentPosition,
  type Student,
  type ExaminationMark 
} from "@/utils/studentDatabase";
import ResultsSection from "./ResultsSection";
import SubjectManagement from "./SubjectManagement";
import SystemReset from "./SystemReset";

const AcademicSection = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [studentMarks, setStudentMarks] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  const terms = ["Term 1", "Term 2", "Term 3"];

  const subjects = [
    "mathematics",
    "english",
    "kiswahili",
    "science",
    "social_studies",
    "ire_cre"
  ];

  const subjectLabels = {
    mathematics: "Mathematics",
    english: "English",
    kiswahili: "Kiswahili", 
    science: "Science",
    social_studies: "Social Studies",
    ire_cre: "IRE/CRE"
  };

  const currentYear = new Date().getFullYear().toString();

  // Load students when grade changes
  useEffect(() => {
    if (selectedGrade) {
      loadStudents();
    } else {
      setStudents([]);
      setStudentMarks({});
    }
  }, [selectedGrade]);

  // Load existing marks when grade and term change
  useEffect(() => {
    if (selectedGrade && selectedTerm) {
      loadExistingMarks();
    }
  }, [selectedGrade, selectedTerm]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await fetchStudentsByGrade(selectedGrade);
      setStudents(studentsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load students. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExistingMarks = async () => {
    try {
      const existingMarks = await fetchExaminationMarks(selectedGrade, selectedTerm, currentYear);
      const marksMap: Record<string, any> = {};
      
      existingMarks.forEach((mark) => {
        marksMap[mark.student_id] = {
          mathematics: mark.mathematics || 0,
          english: mark.english || 0,
          kiswahili: mark.kiswahili || 0,
          science: mark.science || 0,
          social_studies: mark.social_studies || 0,
          ire_cre: mark.ire_cre || 0,
          remarks: mark.remarks || ""
        };
      });
      
      setStudentMarks(marksMap);
    } catch (error) {
      console.error("Error loading existing marks:", error);
    }
  };

  const updateMark = (studentId: string, subject: string, mark: string) => {
    const numericMark = parseInt(mark) || 0;
    
    if (numericMark < 0 || numericMark > 100) {
      toast({
        title: "Invalid Mark",
        description: "Marks must be between 0 and 100.",
        variant: "destructive"
      });
      return;
    }
    
    setStudentMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: numericMark
      }
    }));
  };

  const updateRemarks = (studentId: string, remarks: string) => {
    setStudentMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const calculateTotal = (studentId: string) => {
    const marks = studentMarks[studentId] || {};
    return subjects.reduce((total, subject) => total + (marks[subject] || 0), 0);
  };

  const calculatePosition = (studentId: string) => {
    const totals = students.map(student => ({
      studentId: student.id!,
      total: calculateTotal(student.id!)
    })).sort((a, b) => b.total - a.total);

    const position = totals.findIndex(t => t.studentId === studentId) + 1;
    return position;
  };

  const generateRemarks = (total: number) => {
    if (total >= 500) return "Excellent performance";
    if (total >= 400) return "Good performance";
    if (total >= 300) return "Average performance";
    if (total >= 200) return "Below average";
    return "Needs improvement";
  };

  const handleSave = async () => {
    if (!selectedGrade || !selectedTerm) {
      toast({
        title: "Missing Selection",
        description: "Please select both grade and term before saving.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      
      // Save marks for each student
      for (const student of students) {
        const marks = studentMarks[student.id!];
        if (marks) {
          const markData = {
            student_id: student.id!,
            grade: selectedGrade,
            term: selectedTerm,
            academic_year: currentYear,
            mathematics: marks.mathematics || 0,
            english: marks.english || 0,
            kiswahili: marks.kiswahili || 0,
            science: marks.science || 0,
            social_studies: marks.social_studies || 0,
            ire_cre: marks.ire_cre || 0,
            remarks: marks.remarks || generateRemarks(calculateTotal(student.id!))
          };

          await saveExaminationMarks(markData);
        }
      }

      toast({
        title: "Marks Saved Successfully!",
        description: `Results for ${selectedGrade} - ${selectedTerm} have been saved.`,
      });

      // Reload marks to get updated positions
      await loadExistingMarks();

    } catch (error) {
      toast({
        title: "Error Saving Marks",
        description: "Failed to save marks. Please try again.",
        variant: "destructive"
      });
      console.error("Error saving marks:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Academic Section</h2>
        <p className="text-gray-600">Manage examinations, results, subjects, and system settings</p>
      </div>

      <Tabs defaultValue="marks-entry" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="marks-entry" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Marks Entry</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center space-x-2">
            <Trophy className="w-4 h-4" />
            <span>Results</span>
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Subjects</span>
          </TabsTrigger>
          <TabsTrigger value="system-reset" className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>System Reset</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marks-entry" className="space-y-6">
          {/* Selection Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Class & Term Selection</span>
              </CardTitle>
              <CardDescription>
                Select the grade and term to enter examination marks
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
                <span>Loading students...</span>
              </CardContent>
            </Card>
          )}

          {/* Marks Entry Table */}
          {selectedGrade && selectedTerm && !loading && students.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Marks Entry - {selectedGrade} ({selectedTerm})</span>
                  <Badge variant="secondary">{students.length} Students</Badge>
                </CardTitle>
                <CardDescription>
                  Enter marks for each subject (Maximum: 100 marks per subject)
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
                          <TableHead key={subject} className="min-w-[100px] text-center">
                            {subjectLabels[subject as keyof typeof subjectLabels]}
                          </TableHead>
                        ))}
                        <TableHead className="min-w-[80px] text-center">Total</TableHead>
                        <TableHead className="min-w-[80px] text-center">Position</TableHead>
                        <TableHead className="min-w-[200px]">Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const total = calculateTotal(student.id!);
                        const position = calculatePosition(student.id!);
                        
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-mono text-sm">
                              {student.registration_number}
                            </TableCell>
                            <TableCell className="font-medium">
                              {student.student_name}
                            </TableCell>
                            {subjects.map((subject) => (
                              <TableCell key={subject}>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  placeholder="0"
                                  value={studentMarks[student.id!]?.[subject] || ""}
                                  onChange={(e) => updateMark(student.id!, subject, e.target.value)}
                                  className="w-20 text-center"
                                />
                              </TableCell>
                            ))}
                            <TableCell className="text-center font-semibold">
                              <Badge variant={total >= 400 ? "default" : total >= 300 ? "secondary" : "destructive"}>
                                {total}/600
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {total > 0 && (
                                <Badge variant="outline">
                                  #{position}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Textarea
                                placeholder={total > 0 ? generateRemarks(total) : "Enter remarks"}
                                value={studentMarks[student.id!]?.remarks || ""}
                                onChange={(e) => updateRemarks(student.id!, e.target.value)}
                                className="min-w-[200px] h-8 resize-none"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calculator className="w-4 h-4" />
                    <span>Total marks calculated automatically (out of 600)</span>
                  </div>
                  <Button onClick={handleSave} size="lg" disabled={saving}>
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
                  No students found for {selectedGrade}. Please check if students are enrolled in this grade.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Initial State */}
          {!selectedGrade && !selectedTerm && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Grade and Term</h3>
                <p className="text-gray-600 text-center">
                  Choose a grade and term to start entering examination marks
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results">
          <ResultsSection />
        </TabsContent>

        <TabsContent value="subjects">
          <SubjectManagement />
        </TabsContent>

        <TabsContent value="system-reset">
          <SystemReset />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AcademicSection;
