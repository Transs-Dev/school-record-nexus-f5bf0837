import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, DollarSign, Trophy, Calendar, GraduationCap, LogOut, Medal, Award } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  fetchExaminationMarks,
  calculateStudentPosition,
  type Student,
  type ExaminationMark 
} from "@/utils/studentDatabase";
import { supabase } from "@/integrations/supabase/client";
import StudentAuth from "./StudentAuth";
import { useAuth } from "@/hooks/useAuth";
import { generateStudentResultsPDF } from "@/utils/pdfGenerator";

interface Subject {
  id: string;
  key: string;
  label: string;
  max_marks: number;
}

interface StudentFeeRecord {
  term: string;
  academic_year: string;
  required_amount: number;
  paid_amount: number;
  balance: number;
  payment_percentage: number;
}

interface StudentResultWithPosition extends ExaminationMark {
  position: number;
}

const StudentPortal = () => {
  const { user, signOut } = useAuth();
  const [authenticatedStudent, setAuthenticatedStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examResults, setExamResults] = useState<StudentResultWithPosition[]>([]);
  const [feeRecords, setFeeRecords] = useState<StudentFeeRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear().toString();
  const terms = ["Term 1", "Term 2", "Term 3"];

  useEffect(() => {
    if (authenticatedStudent) {
      fetchSubjects();
      loadStudentData(authenticatedStudent);
    }
  }, [authenticatedStudent]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('label');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Fallback to default subjects if database fetch fails
      setSubjects([
        { id: "1", key: "agriculture", label: "Agriculture", max_marks: 100 },
        { id: "2", key: "biology", label: "Biology", max_marks: 100 },
        { id: "3", key: "business_studies", label: "Business Studies", max_marks: 100 },
        { id: "4", key: "chemistry", label: "Chemistry", max_marks: 100 },
        { id: "5", key: "english", label: "English", max_marks: 100 },
        { id: "6", key: "geography", label: "Geography", max_marks: 100 },
        { id: "7", key: "history", label: "History", max_marks: 100 },
        { id: "8", key: "ire_cre", label: "IRE/CRE", max_marks: 100 },
        { id: "9", key: "kiswahili", label: "Kiswahili", max_marks: 100 },
        { id: "10", key: "mathematics", label: "Mathematics", max_marks: 100 },
        { id: "11", key: "physics", label: "Physics", max_marks: 100 }
      ]);
    }
  };

  const loadStudentData = async (student: Student) => {
    try {
      setLoading(true);

      // Load examination results for all terms
      const allExamResults: StudentResultWithPosition[] = [];
      for (const term of terms) {
        const termResults = await fetchExaminationMarks(student.grade, term, currentYear);
        const studentResult = termResults.find(result => result.student_id === student.id);
        if (studentResult) {
          // Calculate position for this student
          const position = await calculateStudentPosition(student.id, student.grade, term, currentYear);
          allExamResults.push({
            ...studentResult,
            position: position
          });
        }
      }
      setExamResults(allExamResults);

      // Load fee records
      const { data: feeData, error: feeError } = await supabase
        .from('student_fee_records')
        .select('*')
        .eq('student_id', student.id)
        .eq('academic_year', currentYear);

      if (feeError) {
        console.error('Error loading fee records:', feeError);
      } else {
        setFeeRecords(feeData || []);
      }

      toast({
        title: "Welcome",
        description: `Welcome to your portal, ${student.student_name}`,
      });
    } catch (error) {
      console.error('Error loading student data:', error);
      toast({
        title: "Error",
        description: "Failed to load student data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setAuthenticatedStudent(null);
    setExamResults([]);
    setFeeRecords([]);
    setSubjects([]);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  const printResults = async (result: StudentResultWithPosition) => {
    if (!authenticatedStudent) return;
    
    try {
      const pdf = await generateStudentResultsPDF(authenticatedStudent, result);
      pdf.save(`${authenticatedStudent.student_name}_${result.term}_${result.academic_year}_Results.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Student results have been generated successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
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

  const getMarksBadgeVariant = (marks: number, maxMarks: number = 100) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    if (percentage >= 40) return "outline";
    return "destructive";
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

  const getGradeBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "default"; // A
    if (percentage >= 70) return "secondary"; // B
    if (percentage >= 60) return "outline"; // C
    if (percentage >= 50) return "outline"; // D
    return "destructive"; // E
  };

  const getCBCGrade = (percentage: number) => {
    if (percentage >= 80) return { letter: "EE", descriptor: "Exceeding Expectation" };
    if (percentage >= 50) return { letter: "ME", descriptor: "Meeting Expectation" };
    if (percentage >= 40) return { letter: "AE", descriptor: "Approaching Expectation" };
    return { letter: "BE", descriptor: "Below Expectation" };
  };

  const getCBCBadgeVariant = (gradeIndicator: string) => {
    switch (gradeIndicator) {
      case 'EE': return "default";
      case 'ME': return "secondary";
      case 'AE': return "outline";
      case 'BE': return "destructive";
      default: return "outline";
    }
  };

  // Show authentication form if no student is authenticated
  if (!authenticatedStudent) {
    return (
      <div className="container mx-auto p-4">
        <StudentAuth onAuthenticated={setAuthenticatedStudent} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Student Portal - {authenticatedStudent.student_name}</span>
              </CardTitle>
              <CardDescription>Your academic records and fee status</CardDescription>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Student Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Name:</strong> {authenticatedStudent.student_name}</p>
                  <p><strong>Registration:</strong> {authenticatedStudent.registration_number}</p>
                  <p><strong>Grade:</strong> {authenticatedStudent.grade}</p>
                </div>
                <div>
                  <p><strong>Date of Birth:</strong> {authenticatedStudent.date_of_birth}</p>
                  <p><strong>Parent:</strong> {authenticatedStudent.parent_name}</p>
                  <p><strong>Contact:</strong> {authenticatedStudent.primary_contact}</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="academic" className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto">
                <TabsTrigger value="academic" className="flex items-center justify-center space-x-2 text-xs sm:text-sm">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Academic Records</span>
                  <span className="sm:hidden">Academic</span>
                </TabsTrigger>
                <TabsTrigger value="fees" className="flex items-center justify-center space-x-2 text-xs sm:text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline">Fee Status</span>
                  <span className="sm:hidden">Fees</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="academic" className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading academic records...</span>
                  </div>
                ) : examResults.length > 0 ? (
                  <div className="space-y-6">
                    {examResults.map((result) => {
                      const totalMaxMarks = subjects.reduce((sum, subject) => sum + subject.max_marks, 0);
                      const percentage = totalMaxMarks > 0 ? ((result.total_marks || 0) / totalMaxMarks) * 100 : 0;
                      const cbcGrade = getCBCGrade(percentage);
                      
                      return (
                        <Card key={result.id}>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5" />
                                <span>{result.term} - {result.academic_year}</span>
                              </span>
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  {getPositionIcon(result.position)}
                                  <Badge variant={getPositionBadgeVariant(result.position)}>
                                    Position: {result.position}
                                  </Badge>
                                </div>
                                <Badge variant={getCBCBadgeVariant(cbcGrade.letter)} className="text-lg font-bold">
                                  {cbcGrade.letter} - {cbcGrade.descriptor}
                                </Badge>
                                <Badge variant="outline" className="text-sm">
                                  {percentage.toFixed(1)}%
                                </Badge>
                                <Badge variant="outline">
                                  Total: {result.total_marks || 0}/{totalMaxMarks}
                                </Badge>
                                <Button 
                                  onClick={() => printResults(result)}
                                  size="sm" 
                                  variant="outline"
                                  className="ml-auto"
                                >
                                  Print Results
                                </Button>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-3">Subject-wise Performance</h4>
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Subject</TableHead>
                                        <TableHead className="text-center">Marks Obtained</TableHead>
                                        <TableHead className="text-center">Max Marks</TableHead>
                                        <TableHead className="text-center">Percentage</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {subjects.map((subject) => {
                                        const marks = getSubjectMark(result, subject.key);
                                        const percentage = ((marks / subject.max_marks) * 100).toFixed(1);
                                        return (
                                          <TableRow key={subject.key}>
                                            <TableCell className="font-medium">{subject.label}</TableCell>
                                            <TableCell className="text-center">
                                              <Badge variant={getMarksBadgeVariant(marks, subject.max_marks)}>
                                                {marks}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">{subject.max_marks}</TableCell>
                                            <TableCell className="text-center">{percentage}%</TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>

                              {/* Performance Summary */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Performance Summary</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="text-center">
                                    <p className="text-sm text-gray-600">Total Marks</p>
                                    <p className="text-2xl font-bold">{result.total_marks || 0}/{totalMaxMarks}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-gray-600">Percentage</p>
                                    <p className="text-2xl font-bold">{percentage.toFixed(1)}%</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm text-gray-600">Class Position</p>
                                    <div className="flex items-center justify-center space-x-2">
                                      {getPositionIcon(result.position)}
                                      <p className="text-2xl font-bold">#{result.position}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {result.remarks && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span>Teacher's Remarks</span>
                                  </h4>
                                  <p className="text-gray-700 italic">{result.remarks}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <GraduationCap className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Academic Records</h3>
                      <p className="text-gray-600 text-center">
                        No examination results found for the current academic year.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="fees" className="space-y-4">
                {feeRecords.length > 0 ? (
                  <div className="space-y-4">
                    {feeRecords.map((record) => (
                      <Card key={`${record.term}-${record.academic_year}`}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span>{record.term} - {record.academic_year}</span>
                            <Badge variant={record.balance <= 0 ? "default" : "destructive"}>
                              {record.balance <= 0 ? "Paid" : "Pending"}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">Required Amount</p>
                              <p className="text-lg font-semibold">KSh {record.required_amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Paid Amount</p>
                              <p className="text-lg font-semibold text-green-600">KSh {record.paid_amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Balance</p>
                              <p className={`text-lg font-semibold ${record.balance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                KSh {record.balance.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Payment Percentage</p>
                              <p className="text-lg font-semibold">{record.payment_percentage?.toFixed(1) || 0}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <DollarSign className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Fee Records</h3>
                      <p className="text-gray-600 text-center">
                        No fee records found for the current academic year.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPortal;
