
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, User, GraduationCap, DollarSign, BookOpen, Award, Loader2, Printer, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  fetchAllStudents, 
  fetchExaminationMarks, 
  calculateStudentPosition,
  type Student,
  type ExaminationMark 
} from "@/utils/studentDatabase";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const StudentPortal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ registrationNumber: "", password: "" });
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [examResults, setExamResults] = useState<Record<string, ExaminationMark | null>>({});
  const [studentPosition, setStudentPosition] = useState<Record<string, number>>({});
  const reportRef = useRef<HTMLDivElement>(null);

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

  // Function to print results
  const handlePrintResults = () => {
    if (!reportRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Print Error",
        description: "Unable to open print window. Please check your browser settings.",
        variant: "destructive"
      });
      return;
    }

    const studentName = studentData?.student_name || "Student";
    const regNumber = studentData?.registration_number || "";
    const totalMarks = examResults[selectedTerm]?.total_marks || 0;
    const percentage = calculatePercentage(totalMarks);
    const position = studentPosition[selectedTerm] || 0;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Academic Report - ${studentName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .student-info { margin-bottom: 20px; }
          .student-info p { margin: 5px 0; }
          .print-date { text-align: right; margin-top: 20px; font-size: 12px; }
          .result-summary { display: flex; justify-content: space-between; margin: 20px 0; }
          .result-box { padding: 10px; background-color: #f5f5f5; border-radius: 5px; width: 30%; text-align: center; }
          .result-box p:first-child { margin-top: 0; font-weight: bold; }
          .result-box p:last-child { margin-bottom: 0; font-size: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">RONGA SECONDARY SCHOOL (RSS)</div>
          <h2>Student Academic Report</h2>
          <h3>${selectedTerm} - ${currentYear}</h3>
        </div>
        
        <div class="student-info">
          <p><strong>Student Name:</strong> ${studentName}</p>
          <p><strong>Registration Number:</strong> ${regNumber}</p>
          <p><strong>Class:</strong> ${studentData?.grade || ""}</p>
        </div>
        
        <div class="result-summary">
          <div class="result-box">
            <p>Total Marks</p>
            <p>${totalMarks}/600</p>
          </div>
          <div class="result-box">
            <p>Percentage</p>
            <p>${percentage}%</p>
          </div>
          <div class="result-box">
            <p>Position</p>
            <p>${position > 0 ? '#' + position : 'N/A'}</p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Score</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            ${subjects.map(subject => {
              const score = examResults[selectedTerm]?.[subject.key as keyof ExaminationMark] as number || 0;
              return `
                <tr>
                  <td>${subject.label}</td>
                  <td>${score}/100</td>
                  <td>${getGrade(score)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        ${examResults[selectedTerm]?.remarks ? `
          <div style="margin-top: 20px; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #2563eb;">
            <h4 style="margin-top: 0;">Teacher's Remarks</h4>
            <p>${examResults[selectedTerm]?.remarks}</p>
          </div>
        ` : ''}
        
        <div class="print-date">
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  // Function to download results as PDF
  const handleDownloadPDF = async () => {
    if (!reportRef.current || !studentData) return;

    try {
      setLoading(true);
      
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;
      
      pdf.setFontSize(18);
      pdf.text('RONGA SECONDARY SCHOOL', pdfWidth / 2, 10, { align: 'center' });
      pdf.setFontSize(14);
      pdf.text('Academic Report', pdfWidth / 2, 20, { align: 'center' });
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${studentData.student_name}_${selectedTerm}_${currentYear}.pdf`);
      
      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Examination Results - {selectedTerm}</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center space-x-1"
                  onClick={handlePrintResults}
                  disabled={!currentExamResult?.total_marks}
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center space-x-1"
                  onClick={handleDownloadPDF}
                  disabled={loading || !currentExamResult?.total_marks}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Download PDF</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentExamResult && currentExamResult.total_marks && currentExamResult.total_marks > 0 ? (
                <div className="space-y-6" ref={reportRef}>
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
