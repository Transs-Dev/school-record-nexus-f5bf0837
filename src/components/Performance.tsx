import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, Users, Award, BookOpen, AlertTriangle, BarChart3 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, LineChart } from "recharts";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getCBCGrade, getCBCBadgeVariant, CBC_GRADES } from "@/utils/cbcGrading";
import PerformanceReports from "./PerformanceReports";

interface PerformanceData {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  grade: string;
  term: string;
  academicYear: string;
  subjectMarks: Array<{
    subject_id: string;
    subject_name: string;
    marks: number;
    max_marks: number;
    percentage: number;
    cbc_grade: string;
  }>;
  totalMarks: number;
  totalPossible: number;
  overallPercentage: number;
  overallCBCGrade: string;
  position?: number;
}

interface Subject {
  id: string;
  label: string;
  max_marks: number;
}

interface ClassMetrics {
  grade: string;
  term: string;
  academicYear: string;
  totalStudents: number;
  averagePercentage: number;
  passRate: number;
  subjectAverages: Record<string, number>;
  gradeDistribution: Record<string, number>;
  topPerformers: PerformanceData[];
  bottomPerformers: PerformanceData[];
  subjectStrengths: string[];
  subjectWeaknesses: string[];
}

interface StudentRemark {
  studentId: string;
  strongSubjects: string[];
  weakSubjects: string[];
  overallRemark: string;
  improvementAreas: string[];
}

const Performance = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [classMetrics, setClassMetrics] = useState<ClassMetrics | null>(null);
  const [schoolMetrics, setSchoolMetrics] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studentRemarks, setStudentRemarks] = useState<StudentRemark[]>([]);
  const [loading, setLoading] = useState(false);

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];
  const terms = ["Term 1", "Term 2", "Term 3"];

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedGrade && selectedTerm && selectedYear) {
      loadPerformanceData();
    }
    loadSchoolMetrics();
  }, [selectedGrade, selectedTerm, selectedYear]);

  const loadSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, label, max_marks')
        .order('label');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      });
    }
  };

  const loadPerformanceData = async () => {
    if (!selectedGrade || !selectedTerm || !selectedYear) return;
    
    setLoading(true);
    try {
      // Fetch students and their examination marks with real data from Supabase
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('grade', selectedGrade);

      if (studentsError) throw studentsError;

      const { data: examMarks, error: examError } = await supabase
        .from('examination_marks')
        .select('*')
        .eq('grade', selectedGrade)
        .eq('term', selectedTerm)
        .eq('academic_year', selectedYear);

      if (examError) throw examError;

      // Process performance data
      const processedData: PerformanceData[] = [];
      
      for (const student of students || []) {
        const studentExam = examMarks?.find(exam => exam.student_id === student.id);
        if (!studentExam) continue;

        const subjectMarks = Array.isArray(studentExam.subject_marks) 
          ? (studentExam.subject_marks as any[]).map((sm: any) => {
              const subject = subjects.find(s => s.id === sm.subject_id);
              const percentage = subject ? Math.round((sm.marks / subject.max_marks) * 100) : 0;
              const cbcGrade = getCBCGrade(percentage);
              
              return {
                subject_id: sm.subject_id,
                subject_name: subject?.label || 'Unknown Subject',
                marks: sm.marks,
                max_marks: subject?.max_marks || 100,
                percentage,
                cbc_grade: cbcGrade.grade_letter
              };
            })
          : [];

        const totalPossible = subjectMarks.reduce((sum, sm) => sum + sm.max_marks, 0);
        const overallPercentage = totalPossible > 0 ? Math.round((studentExam.total_marks / totalPossible) * 100) : 0;
        const overallCBC = getCBCGrade(overallPercentage);

        processedData.push({
          studentId: student.id,
          studentName: student.student_name,
          registrationNumber: student.registration_number,
          grade: selectedGrade,
          term: selectedTerm,
          academicYear: selectedYear,
          subjectMarks,
          totalMarks: studentExam.total_marks,
          totalPossible,
          overallPercentage,
          overallCBCGrade: overallCBC.grade_letter
        });
      }

      // Sort by total marks and assign positions
      processedData.sort((a, b) => b.totalMarks - a.totalMarks);
      processedData.forEach((data, index) => {
        data.position = index + 1;
      });

      setPerformanceData(processedData);
      calculateClassMetrics(processedData);
      generateStudentRemarks(processedData);

    } catch (error) {
      console.error('Error loading performance data:', error);
      toast({
        title: "Error",
        description: "Failed to load performance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateClassMetrics = (data: PerformanceData[]) => {
    if (data.length === 0) return;

    const totalStudents = data.length;
    const averagePercentage = Math.round(
      data.reduce((sum, student) => sum + student.overallPercentage, 0) / totalStudents
    );

    // Calculate pass rate (ME + EE)
    const passCount = data.filter(student => 
      student.overallCBCGrade === 'ME' || student.overallCBCGrade === 'EE'
    ).length;
    const passRate = Math.round((passCount / totalStudents) * 100);

    // Calculate subject averages
    const subjectAverages: Record<string, number> = {};
    subjects.forEach(subject => {
      const subjectMarks = data
        .map(student => student.subjectMarks.find(sm => sm.subject_id === subject.id))
        .filter(Boolean)
        .map(sm => sm!.percentage);
      
      if (subjectMarks.length > 0) {
        subjectAverages[subject.label] = Math.round(
          subjectMarks.reduce((sum, mark) => sum + mark, 0) / subjectMarks.length
        );
      }
    });

    // Calculate grade distribution
    const gradeDistribution: Record<string, number> = {};
    CBC_GRADES.forEach(grade => {
      gradeDistribution[grade.grade_letter] = data.filter(
        student => student.overallCBCGrade === grade.grade_letter
      ).length;
    });

    // Identify strengths and weaknesses
    const sortedSubjects = Object.entries(subjectAverages)
      .sort(([,a], [,b]) => b - a);
    
    const subjectStrengths = sortedSubjects.slice(0, 3).map(([subject]) => subject);
    const subjectWeaknesses = sortedSubjects.slice(-3).map(([subject]) => subject);

    const metrics: ClassMetrics = {
      grade: selectedGrade,
      term: selectedTerm,
      academicYear: selectedYear,
      totalStudents,
      averagePercentage,
      passRate,
      subjectAverages,
      gradeDistribution,
      topPerformers: data.slice(0, 5),
      bottomPerformers: data.slice(-5).reverse(),
      subjectStrengths,
      subjectWeaknesses
    };

    setClassMetrics(metrics);
  };

  const generateStudentRemarks = (data: PerformanceData[]) => {
    const remarks: StudentRemark[] = data.map(student => {
      const strongSubjects = student.subjectMarks
        .filter(sm => sm.cbc_grade === 'EE' || sm.cbc_grade === 'ME')
        .map(sm => sm.subject_name)
        .slice(0, 3);

      const weakSubjects = student.subjectMarks
        .filter(sm => sm.cbc_grade === 'AE' || sm.cbc_grade === 'BE')
        .map(sm => sm.subject_name)
        .slice(0, 3);

      let overallRemark = "";
      if (student.overallCBCGrade === 'EE') {
        overallRemark = "Excellent performance! Keep up the outstanding work.";
      } else if (student.overallCBCGrade === 'ME') {
        overallRemark = "Good performance overall. Continue working hard.";
      } else if (student.overallCBCGrade === 'AE') {
        overallRemark = "Shows promise but needs improvement in several areas.";
      } else {
        overallRemark = "Requires significant improvement and additional support.";
      }

      const improvementAreas = weakSubjects.length > 0 
        ? [`Focus more on ${weakSubjects.join(', ')}`]
        : ["Continue maintaining current performance levels"];

      return {
        studentId: student.studentId,
        strongSubjects,
        weakSubjects,
        overallRemark,
        improvementAreas
      };
    });

    setStudentRemarks(remarks);
  };

  const loadSchoolMetrics = async () => {
    try {
      // Load school-wide metrics across all grades and terms
      const { data: allExams, error } = await supabase
        .from('examination_marks')
        .select(`
          *,
          students!inner(grade)
        `)
        .eq('academic_year', selectedYear);

      if (error) throw error;

      // Process school-wide data
      const schoolData = {
        totalStudents: new Set(allExams?.map(exam => exam.student_id)).size,
        gradePerformance: {},
        subjectTrends: {},
        overallDistribution: {}
      };

      setSchoolMetrics(schoolData);
    } catch (error) {
      console.error('Error loading school metrics:', error);
    }
  };

  const chartConfig = {
    EE: { label: "Exceeding Expectation", color: "hsl(var(--chart-1))" },
    ME: { label: "Meeting Expectation", color: "hsl(var(--chart-2))" },
    AE: { label: "Approaching Expectation", color: "hsl(var(--chart-3))" },
    BE: { label: "Below Expectation", color: "hsl(var(--chart-4))" },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Performance Analytics
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            CBC-based performance metrics and insights
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select grade, term, and academic year to view performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grade">Grade</Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
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

          <div className="space-y-2">
            <Label htmlFor="term">Term</Label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
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

          <div className="space-y-2">
            <Label htmlFor="year">Academic Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2023, 2022].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-muted-foreground">Loading performance data...</span>
        </div>
      )}

      {!loading && classMetrics && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="subjects" className="text-xs sm:text-sm">Subjects</TabsTrigger>
            <TabsTrigger value="students" className="text-xs sm:text-sm">Students</TabsTrigger>
            <TabsTrigger value="remarks" className="text-xs sm:text-sm">Remarks</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classMetrics.totalStudents}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Class Average</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classMetrics.averagePercentage}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{classMetrics.passRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">ME + EE grades</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Subject</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold">{classMetrics.subjectStrengths[0]}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {classMetrics.subjectAverages[classMetrics.subjectStrengths[0]]}% avg
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CBC Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>CBC Grade Distribution</CardTitle>
                <CardDescription>Distribution of students across CBC grade bands</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(classMetrics.gradeDistribution).map(([grade, count]) => ({
                          grade,
                          count,
                          percentage: Math.round((count / classMetrics.totalStudents) * 100)
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {Object.keys(classMetrics.gradeDistribution).map((grade, index) => (
                          <Cell key={`cell-${index}`} fill={chartConfig[grade as keyof typeof chartConfig]?.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-6">
            {/* Subject Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
                <CardDescription>Average percentage scores by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(classMetrics.subjectAverages).map(([subject, average]) => ({
                        subject,
                        average
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="average" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Subject Strengths and Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Subject Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {classMetrics.subjectStrengths.map((subject, index) => (
                      <div key={subject} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">{subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-green-600">
                            {classMetrics.subjectAverages[subject]}%
                          </span>
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {classMetrics.subjectWeaknesses.map((subject) => (
                      <div key={subject} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="font-medium">{subject}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-red-600">
                            {classMetrics.subjectAverages[subject]}%
                          </span>
                          <Badge variant="outline" className="border-red-200 text-red-700">
                            Needs Focus
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            {/* Top and Bottom Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-gold" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {classMetrics.topPerformers.map((student, index) => (
                      <div key={student.studentId} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <div className="font-medium">{student.studentName}</div>
                          <div className="text-sm text-muted-foreground">{student.registrationNumber}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{student.overallPercentage}%</div>
                          <Badge variant={getCBCBadgeVariant(student.overallCBCGrade)}>
                            {student.overallCBCGrade}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    Needs Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {classMetrics.bottomPerformers.map((student) => (
                      <div key={student.studentId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <div className="font-medium">{student.studentName}</div>
                          <div className="text-sm text-muted-foreground">{student.registrationNumber}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{student.overallPercentage}%</div>
                          <Badge variant={getCBCBadgeVariant(student.overallCBCGrade)}>
                            {student.overallCBCGrade}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Full Student Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Student Performance</CardTitle>
                <CardDescription>Detailed performance breakdown for all students</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Position</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Total Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>CBC Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceData.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell className="font-medium">{student.position}</TableCell>
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>{student.registrationNumber}</TableCell>
                        <TableCell>{student.totalMarks}/{student.totalPossible}</TableCell>
                        <TableCell>{student.overallPercentage}%</TableCell>
                        <TableCell>
                          <Badge variant={getCBCBadgeVariant(student.overallCBCGrade)}>
                            {student.overallCBCGrade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="remarks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automatic Teacher Remarks</CardTitle>
                <CardDescription>AI-generated remarks based on CBC performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {performanceData.map((student) => {
                    const remark = studentRemarks.find(r => r.studentId === student.studentId);
                    if (!remark) return null;

                    return (
                      <div key={student.studentId} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{student.studentName}</h4>
                            <p className="text-sm text-muted-foreground">{student.registrationNumber}</p>
                          </div>
                          <Badge variant={getCBCBadgeVariant(student.overallCBCGrade)} className="ml-2">
                            {student.overallCBCGrade} - {student.overallPercentage}%
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-green-700">
                            <strong>Strengths:</strong> {remark.strongSubjects.length > 0 ? remark.strongSubjects.join(', ') : 'Continue working across all subjects'}
                          </p>
                          
                          {remark.weakSubjects.length > 0 && (
                            <p className="text-sm font-medium text-red-700">
                              <strong>Areas for Improvement:</strong> {remark.weakSubjects.join(', ')}
                            </p>
                          )}
                          
                          <p className="text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                            <strong>Overall Remark:</strong> {remark.overallRemark}
                          </p>
                          
                          <p className="text-sm text-muted-foreground">
                            <strong>Recommendation:</strong> {remark.improvementAreas.join('; ')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <PerformanceReports />
          </TabsContent>
        </Tabs>
      )}

      {!loading && !classMetrics && (selectedGrade && selectedTerm) && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Performance Data Found</h3>
            <p className="text-muted-foreground">
              No examination data found for {selectedGrade} - {selectedTerm} {selectedYear}.
              Please ensure exam results have been entered for this period.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Performance;