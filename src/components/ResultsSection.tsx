
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Trophy, Medal, Award, BookOpen, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  fetchStudentsByGrade, 
  fetchExaminationMarks, 
  type Student,
  type ExaminationMark 
} from "@/utils/studentDatabase";

const ResultsSection = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [examResults, setExamResults] = useState<ExaminationMark[]>([]);
  const [loading, setLoading] = useState(false);

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  const terms = ["Term 1", "Term 2", "Term 3"];
  const currentYear = new Date().getFullYear().toString();

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
    if (selectedGrade && selectedTerm) {
      loadResults();
    } else {
      setStudents([]);
      setExamResults([]);
    }
  }, [selectedGrade, selectedTerm]);

  const loadResults = async () => {
    try {
      setLoading(true);
      
      // Load students for the selected grade
      const studentsData = await fetchStudentsByGrade(selectedGrade);
      
      // Load examination results for the selected term and grade
      const resultsData = await fetchExaminationMarks(selectedGrade, selectedTerm, currentYear);
      
      // Sort results by total marks in descending order (highest to lowest)
      const sortedResults = resultsData.sort((a, b) => (b.total_marks || 0) - (a.total_marks || 0));
      
      setStudents(studentsData);
      setExamResults(sortedResults);
      
      toast({
        title: "Results Loaded",
        description: `Loaded ${sortedResults.length} student results for ${selectedGrade} - ${selectedTerm}`,
      });
    } catch (error) {
      console.error('Error loading results:', error);
      toast({
        title: "Error Loading Results",
        description: "Failed to load examination results. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStudentByExamResult = (examResult: ExaminationMark) => {
    return students.find(student => student.id === examResult.student_id);
  };

  const getSubjectMark = (examResult: ExaminationMark, subjectKey: string) => {
    if (!examResult.subject_marks) return 0;
    
    let parsedSubjectMarks: any[] = [];
    try {
      if (Array.isArray(examResult.subject_marks)) {
        parsedSubjectMarks = examResult.subject_marks;
      } else if (typeof examResult.subject_marks === 'string') {
        parsedSubjectMarks = JSON.parse(examResult.subject_marks);
      }
    } catch (error) {
      console.error("Error parsing subject marks:", error);
      return 0;
    }
    
    const subjectMark = parsedSubjectMarks.find(mark => mark.subject_id === subjectKey);
    return subjectMark?.marks || 0;
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getPositionBadgeVariant = (position: number) => {
    if (position <= 3) return "default";
    if (position <= 10) return "secondary";
    return "outline";
  };

  const getMarksBadgeVariant = (marks: number) => {
    if (marks >= 80) return "default";
    if (marks >= 60) return "secondary";
    if (marks >= 40) return "outline";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Student Performance</h3>
        <p className="text-gray-600">View student results ranked by performance</p>
      </div>

      {/* Selection Filters */}
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mr-2" />
          <span>Loading results...</span>
        </div>
      )}

      {/* Results Table */}
      {selectedGrade && selectedTerm && !loading && examResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Performance Rankings - {selectedGrade} ({selectedTerm})</span>
              <Badge variant="secondary">{examResults.length} Students</Badge>
            </CardTitle>
            <CardDescription>
              Students ranked by total marks (highest to lowest performance)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Position</TableHead>
                    <TableHead className="min-w-[120px]">Reg. Number</TableHead>
                    <TableHead className="min-w-[150px]">Student Name</TableHead>
                    {subjects.map((subject) => (
                      <TableHead key={subject.key} className="min-w-[80px] text-center">
                        {subject.label}
                      </TableHead>
                    ))}
                    <TableHead className="min-w-[100px] text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examResults.map((result, index) => {
                    const student = getStudentByExamResult(result);
                    const position = index + 1;
                    
                    if (!student) return null;
                    
                    return (
                      <TableRow key={result.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getPositionIcon(position)}
                            <Badge variant={getPositionBadgeVariant(position)}>
                              #{position}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.registration_number}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.student_name}
                        </TableCell>
                        {subjects.map((subject) => {
                          const marks = getSubjectMark(result, subject.key);
                          return (
                            <TableCell key={subject.key} className="text-center">
                              <Badge variant={getMarksBadgeVariant(marks)}>
                                {marks}
                              </Badge>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center">
                          <Badge 
                            variant={getMarksBadgeVariant((result.total_marks || 0) / subjects.length)}
                            className="text-lg font-bold"
                          >
                            {result.total_marks || 0}
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

      {/* No Results Found */}
      {selectedGrade && selectedTerm && !loading && examResults.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Available</h3>
            <p className="text-gray-600 text-center">
              No examination results found for {selectedGrade} - {selectedTerm}. 
              Please check if marks have been entered for this grade and term.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!selectedGrade && !selectedTerm && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Grade and Term</h3>
            <p className="text-gray-600 text-center">
              Choose a grade and term to view student performance rankings
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsSection;
