
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader } from "lucide-react";
import { fetchAllStudents, printStudentList, downloadStudentList, type Student } from "@/utils/studentDatabase";
import { toast } from "@/hooks/use-toast";

const StudentRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error Loading Students",
        description: "Failed to load student records. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  // Get unique years from student data
  const years = Array.from(new Set(students.map(student => 
    student.admission_date ? new Date(student.admission_date).getFullYear().toString() : '2025'
  ))).sort().reverse();

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.registration_number && student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGrade = selectedGrade === "all" || student.grade === selectedGrade;
    
    const studentYear = student.admission_date ? new Date(student.admission_date).getFullYear().toString() : '2025';
    const matchesYear = selectedYear === "all" || studentYear === selectedYear;
    
    return matchesSearch && matchesGrade && matchesYear;
  });

  const handlePrint = () => {
    printStudentList(filteredStudents);
    toast({
      title: "Print Prepared",
      description: `Preparing to print ${filteredStudents.length} student records...`,
    });
  };

  const handleDownload = () => {
    downloadStudentList(filteredStudents);
    toast({
      title: "Download Started",
      description: `Downloading ${filteredStudents.length} student records as CSV...`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin" />
          <span>Loading student records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Records</h2>
        <p className="text-gray-600">Manage and view all student information</p>
      </div>

      {/* Filters and Search */}
      <Card className="transform hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or registration number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handlePrint}
                className="flex-1 transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </Button>
              <Button 
                variant="outline"
                onClick={handleDownload}
                className="transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredStudents.length} of {students.length} students
        </p>
        <div className="flex space-x-2">
          {selectedGrade !== "all" && (
            <Badge variant="secondary" className="animate-scale-in">{selectedGrade}</Badge>
          )}
          {selectedYear !== "all" && (
            <Badge variant="secondary" className="animate-scale-in">Year {selectedYear}</Badge>
          )}
          {searchTerm && (
            <Badge variant="secondary" className="animate-scale-in">Search: "{searchTerm}"</Badge>
          )}
        </div>
      </div>

      {/* Student Records Table */}
      <Card className="transform hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle>Student Records</CardTitle>
          <CardDescription>
            Complete list of enrolled students with their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Parent/Guardian</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead>Alternative Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student, index) => (
                  <TableRow 
                    key={student.id} 
                    className="hover:bg-gray-50 transform transition-all duration-200 hover:scale-[1.01]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-sm">
                      {student.registration_number}
                    </TableCell>
                    <TableCell className="font-medium">{student.student_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.grade}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.gender === 'Male' ? 'default' : 'secondary'}>
                        {student.gender}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>{student.parent_name}</TableCell>
                    <TableCell>{student.primary_contact}</TableCell>
                    <TableCell className="text-gray-500">
                      {student.alternative_contact || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 animate-fade-in">
              <p className="text-gray-500">No students found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRecords;
