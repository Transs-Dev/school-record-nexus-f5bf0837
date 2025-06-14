
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User, BookOpen, DollarSign, Trophy, Calendar, GraduationCap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  fetchAllStudents, 
  fetchExaminationMarks,
  calculateStudentPosition,
  type Student,
  type ExaminationMark 
} from "@/utils/studentDatabase";
import { supabase } from "@/integrations/supabase/client";

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

const StudentPortal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [examResults, setExamResults] = useState<ExaminationMark[]>([]);
  const [feeRecords, setFeeRecords] = useState<StudentFeeRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const currentYear = new Date().getFullYear().toString();
  const terms = ["Term 1", "Term 2", "Term 3"];

  useEffect(() => {
    loadStudents();
    fetchSubjects();
  }, []);

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

  const loadStudents = async () => {
    try {
      const data = await fetchAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      });
    }
  };

  const loadStudentData = async (student: Student) => {
    try {
      setLoading(true);
      setSelectedStudent(student);

      // Load examination results for all terms
      const allExamResults: ExaminationMark[] = [];
      for (const term of terms) {
        const termResults = await fetchExaminationMarks(student.grade, term, currentYear);
        const studentResult = termResults.find(result => result.student_id === student.id);
        if (studentResult) {
          allExamResults.push(studentResult);
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
        title: "Student Data Loaded",
        description: `Loaded data for ${student.student_name}`,
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

  const filteredStudents = students.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const calculatePosition = async (studentId: string, grade: string, term: string) => {
    try {
      return await calculateStudentPosition(studentId, grade, term, currentYear);
    } catch (error) {
      console.error('Error calculating position:', error);
      return 0;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-6 h-6" />
            <span>Student Portal</span>
          </CardTitle>
          <CardDescription>Search and view student academic records and fee status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Student Search */}
            <div className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="search">Search Student</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name or registration number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Student Results */}
              {searchTerm && (
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => loadStudentData(student)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{student.student_name}</p>
                          <p className="text-sm text-gray-600">{student.registration_number} - {student.grade}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      No students found matching your search.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Student Details */}
            {selectedStudent && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>Name:</strong> {selectedStudent.student_name}</p>
                      <p><strong>Registration:</strong> {selectedStudent.registration_number}</p>
                      <p><strong>Grade:</strong> {selectedStudent.grade}</p>
                    </div>
                    <div>
                      <p><strong>Date of Birth:</strong> {selectedStudent.date_of_birth}</p>
                      <p><strong>Parent:</strong> {selectedStudent.parent_name}</p>
                      <p><strong>Contact:</strong> {selectedStudent.primary_contact}</p>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="academic" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="academic" className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Academic Records</span>
                    </TabsTrigger>
                    <TabsTrigger value="fees" className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Fee Status</span>
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
                        {examResults.map((result) => (
                          <Card key={result.id}>
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center space-x-2">
                                  <Calendar className="w-5 h-5" />
                                  <span>{result.term} - {result.academic_year}</span>
                                </span>
                                <div className="flex items-center space-x-2">
                                  <Trophy className="w-5 h-5 text-yellow-500" />
                                  <Badge variant="outline">
                                    Total: {result.total_marks || 0}/{subjects.reduce((sum, subject) => sum + subject.max_marks, 0)}
                                  </Badge>
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
                                {result.remarks && (
                                  <div>
                                    <h4 className="font-medium mb-2">Teacher's Remarks</h4>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{result.remarks}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <GraduationCap className="w-12 h-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Academic Records</h3>
                          <p className="text-gray-600 text-center">
                            No examination results found for this student in the current academic year.
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
                            No fee records found for this student in the current academic year.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Initial State */}
            {!selectedStudent && !searchTerm && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Search for a Student</h3>
                  <p className="text-gray-600 text-center">
                    Enter a student's name or registration number to view their academic records and fee status.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPortal;
