
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, User, GraduationCap, DollarSign, BookOpen, Award } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const StudentPortal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ registrationNumber: "", password: "" });
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  
  // Mock student data
  const studentData = {
    name: "John Kamau",
    registrationNumber: "RSS/00001/25",
    currentGrade: "Grade 8",
    feesData: {
      "Term 1": { paid: 15000, total: 20000, percentage: 75 },
      "Term 2": { paid: 18000, total: 20000, percentage: 90 },
      "Term 3": { paid: 10000, total: 20000, percentage: 50 }
    },
    resultsData: {
      "Term 1": {
        subjects: [
          { name: "Mathematics", score: 85 },
          { name: "English", score: 78 },
          { name: "Kiswahili", score: 82 },
          { name: "Science", score: 88 },
          { name: "Social Studies", score: 75 },
          { name: "IRE/CRE", score: 80 }
        ],
        totalMarks: 488,
        maxMarks: 600,
        position: 3,
        remarks: "Excellent performance. Keep up the good work!"
      },
      "Term 2": {
        subjects: [
          { name: "Mathematics", score: 92 },
          { name: "English", score: 85 },
          { name: "Kiswahili", score: 88 },
          { name: "Science", score: 90 },
          { name: "Social Studies", score: 82 },
          { name: "IRE/CRE", score: 85 }
        ],
        totalMarks: 522,
        maxMarks: 600,
        position: 1,
        remarks: "Outstanding improvement! First position in class."
      },
      "Term 3": {
        subjects: [
          { name: "Mathematics", score: 0 },
          { name: "English", score: 0 },
          { name: "Kiswahili", score: 0 },
          { name: "Science", score: 0 },
          { name: "Social Studies", score: 0 },
          { name: "IRE/CRE", score: 0 }
        ],
        totalMarks: 0,
        maxMarks: 600,
        position: 0,
        remarks: "Results not yet available"
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginData.registrationNumber === "RSS/00001/25" && loginData.password === "student") {
      setIsLoggedIn(true);
      toast({
        title: "Login Successful!",
        description: `Welcome back, ${studentData.name}`,
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid registration number or password",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ registrationNumber: "", password: "" });
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const currentFees = studentData.feesData[selectedTerm as keyof typeof studentData.feesData];
  const currentResults = studentData.resultsData[selectedTerm as keyof typeof studentData.resultsData];

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
              <Button type="submit" className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                Login to Portal
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Demo Account</h4>
              <p className="text-sm text-blue-600">
                Registration: RSS/00001/25<br />
                Password: student
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h2>
          <p className="text-gray-600">Welcome back, {studentData.name}</p>
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
                <p className="font-medium">{studentData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registration Number</p>
                <p className="font-mono text-sm">{studentData.registrationNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Grade</p>
                <Badge variant="secondary">{studentData.currentGrade}</Badge>
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
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Exam</span>
                <span className="font-medium">{currentResults.totalMarks}/{currentResults.maxMarks}</span>
              </div>
              {currentResults.position > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Class Position</span>
                  <Badge variant="default">#{currentResults.position}</Badge>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Percentage</span>
                <span className="font-medium">
                  {currentResults.totalMarks > 0 ? Math.round((currentResults.totalMarks / currentResults.maxMarks) * 100) : 0}%
                </span>
              </div>
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
              <SelectItem value="Term 1">Term 1</SelectItem>
              <SelectItem value="Term 2">Term 2</SelectItem>
              <SelectItem value="Term 3">Term 3</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="fees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fees" className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span>Fee Details</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Exam Results</span>
          </TabsTrigger>
        </TabsList>

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
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Examination Results - {selectedTerm}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentResults.totalMarks > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-600 font-medium">Total Marks</p>
                      <p className="text-2xl font-bold text-blue-700">
                        {currentResults.totalMarks}/{currentResults.maxMarks}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-600 font-medium">Class Position</p>
                      <p className="text-2xl font-bold text-purple-700">
                        #{currentResults.position}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-600 font-medium">Percentage</p>
                      <p className="text-2xl font-bold text-green-700">
                        {Math.round((currentResults.totalMarks / currentResults.maxMarks) * 100)}%
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
                        {currentResults.subjects.map((subject, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{subject.name}</TableCell>
                            <TableCell className="text-center">{subject.score}/100</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={subject.score >= 80 ? "default" : subject.score >= 60 ? "secondary" : "destructive"}>
                                {subject.score >= 80 ? "A" : subject.score >= 60 ? "B" : subject.score >= 40 ? "C" : "D"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Teacher's Remarks</h4>
                    <p className="text-gray-700">{currentResults.remarks}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Results Not Available</h3>
                  <p className="text-gray-600">
                    Examination results for {selectedTerm} are not yet available. 
                    Please check back later.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentPortal;
