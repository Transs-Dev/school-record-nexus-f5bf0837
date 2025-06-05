
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, User, GraduationCap, DollarSign, BookOpen, Award, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  fetchAllStudents, 
  fetchExaminationMarks, 
  calculateStudentPosition,
  type Student,
  type ExaminationMark 
} from "@/utils/studentDatabase";

const StudentPortal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ registrationNumber: "", password: "" });
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [examResults, setExamResults] = useState<Record<string, ExaminationMark | null>>({});
  const [studentPosition, setStudentPosition] = useState<Record<string, number>>({});

  const terms = ["Term 1", "Term 2", "Term 3"];
  const currentYear = new Date().getFullYear().toString();

  const subjects = [
    { key: "mathematics", label: "Mathematics" },
    { key: "english", label: "English" },
    { key: "kiswahili", label: "Kiswahili" },
    { key: "science", label: "Science" },
    { key: "social_studies", label: "Social Studies" },
    { key: "ire_cre", label: "IRE/CRE" }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Find student by registration number
      const students = await fetchAllStudents();
      const foundStudent = students.find(
        student => student.registration_number === loginData.registrationNumber
      );

      if (!foundStudent) {
        toast({
          title: "Student not found",
          description: "The registration number entered is not found in our records.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Check password (default is "student")
      if (loginData.password !== "student") {
        toast({
          title: "Invalid password",
          description: "Please check your password and try again.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Login successful
      setIsLoggedIn(true);
      setStudentData(foundStudent);
      
      // Load examination results for all terms
      await loadExaminationResults(foundStudent);

      toast({
        title: "Login Successful!",
        description: `Welcome back, ${foundStudent.student_name}`,
      });

    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadExaminationResults = async (student: Student) => {
    const results: Record<string, ExaminationMark | null> = {};
    const positions: Record<string, number> = {};

    for (const term of terms) {
      try {
        const termResults = await fetchExaminationMarks(student.grade, term, currentYear);
        const studentResult = termResults.find(result => result.student_id === student.id);
        
        if (studentResult) {
          results[term] = studentResult;
          // Calculate position for this student
          const position = await calculateStudentPosition(
            student.id!,
            student.grade,
            term,
            currentYear
          );
          positions[term] = position;
        } else {
          results[term] = null;
          positions[term] = 0;
        }
      } catch (error) {
        console.error(`Error loading results for ${term}:`, error);
        results[term] = null;
        positions[term] = 0;
      }
    }

    setExamResults(results);
    setStudentPosition(positions);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudentData(null);
    setExamResults({});
    setStudentPosition({});
    setLoginData({ registrationNumber: "", password: "" });
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const calculatePercentage = (totalMarks: number, maxMarks: number = 600) => {
    return Math.round((totalMarks / maxMarks) * 100);
  };

  const getGrade = (score: number) => {
    if (score >= 80) return "A";
    if (score >= 60) return "B";
    if (score >= 40) return "C";
    return "D";
  };

  const getGradeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  // Mock fee data (can be replaced with real data from database later)
  const getFeeData = (term: string) => {
    const baseAmount = 20000;
    const paid = Math.floor(Math.random() * baseAmount);
    return {
      paid,
      total: baseAmount,
      percentage: Math.round((paid / baseAmount) * 100)
    };
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Student Portal</CardTitle>
            <CardDescription>
              Enter your registration number and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registration">Registration Number</Label>
                <Input
                  id="registration"
                  placeholder="e.g., RSS/00001/25"
                  value={loginData.registrationNumber}
                  onChange={(e) => setLoginData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login to Portal
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Login Information</h4>
              <p className="text-sm text-blue-600">
                Use your registration number as username<br />
                Default password: student
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentExamResult = examResults[selectedTerm];
  const currentPosition = studentPosition[selectedTerm] || 0;
  const currentFees = getFeeData(selectedTerm);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h2>
          <p className="text-gray-600">Welcome back, {studentData?.student_name}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Details</CardTitle>
            <User className="w-4 h-4 ml-auto text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{studentData?.student_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registration Number</p>
                <p className="font-mono text-sm">{studentData?.registration_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Grade</p>
                <Badge variant="secondary">{studentData?.grade}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="text-sm">{studentData?.date_of_birth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Status</CardTitle>
            <DollarSign className="w-4 h-4 ml-auto text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Paid</span>
                  <span>KES {currentFees.paid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total</span>
                  <span>KES {currentFees.total.toLocaleString()}</span>
                </div>
              </div>
              <Progress value={currentFees.percentage} className="h-2" />
              <p className="text-sm font-medium">{currentFees.percentage}% Paid</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Academic Performance</CardTitle>
            <GraduationCap className="w-4 h-4 ml-auto text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentExamResult ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Exam</span>
                    <span className="font-medium">{currentExamResult.total_marks || 0}/600</span>
                  </div>
                  {currentPosition > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Class Position</span>
                      <Badge variant="default">#{currentPosition}</Badge>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Percentage</span>
                    <span className="font-medium">
                      {calculatePercentage(currentExamResult.total_marks || 0)}%
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600">No results available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Term Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Term</CardTitle>
          <CardDescription>
            Choose a term to view detailed fees and results information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {terms.map((term) => (
                <SelectItem key={term} value={term}>
                  {term}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="results" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="results" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Exam Results</span>
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Fee Details</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Examination Results - {selectedTerm}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentExamResult && currentExamResult.total_marks && currentExamResult.total_marks > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-600 font-medium">Total Marks</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {currentExamResult.total_marks}/600
                      </p>
                    </div>
                    {currentPosition > 0 && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-purple-600 font-medium">Class Position</p>
                        <p className="text-2xl font-bold text-purple-700">
                          #{currentPosition}
                        </p>
                      </div>
                    )}
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-600 font-medium">Percentage</p>
                      <p className="text-2xl font-bold text-green-700">
                        {calculatePercentage(currentExamResult.total_marks)}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Subject-wise Performance</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead className="text-center">Score</TableHead>
                          <TableHead className="text-center">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjects.map((subject) => {
                          const score = currentExamResult[subject.key as keyof ExaminationMark] as number || 0;
                          return (
                            <TableRow key={subject.key}>
                              <TableCell className="font-medium">{subject.label}</TableCell>
                              <TableCell className="text-center">{score}/100</TableCell>
                              <TableCell className="text-center">
                                <Badge variant={getGradeVariant(score)}>
                                  {getGrade(score)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {currentExamResult.remarks && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Teacher's Remarks</h4>
                      <p className="text-gray-700">{currentExamResult.remarks}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Results Not Available</h3>
                  <p className="text-gray-600">
                    Examination results for {selectedTerm} are not yet available. 
                    Please check back later or contact your teacher.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Fee Payment Details - {selectedTerm}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 font-medium">Amount Paid</p>
                    <p className="text-2xl font-bold text-green-700">
                      KES {currentFees.paid.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-600 font-medium">Outstanding Balance</p>
                    <p className="text-2xl font-bold text-orange-700">
                      KES {(currentFees.total - currentFees.paid).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">Total Fees</p>
                    <p className="text-2xl font-bold text-blue-700">
                      KES {currentFees.total.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Payment Progress</Label>
                  <div className="mt-2">
                    <Progress value={currentFees.percentage} className="h-3" />
                    <p className="text-sm text-gray-600 mt-1">
                      {currentFees.percentage}% of total fees paid
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Payment Status</h4>
                  <Badge 
                    variant={currentFees.percentage === 100 ? "default" : currentFees.percentage >= 75 ? "secondary" : "destructive"}
                  >
                    {currentFees.percentage === 100 ? "Fully Paid" : 
                     currentFees.percentage >= 75 ? "Almost Complete" : "Outstanding Balance"}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    Contact the school bursar for payment arrangements or to update your payment status.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentPortal;
