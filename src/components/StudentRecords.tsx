
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Printer, Download } from "lucide-react";

const StudentRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  // Mock student data
  const students = [
    {
      registrationNumber: "RSS/00001/25",
      name: "John Kamau",
      grade: "Grade 8",
      admissionDate: "2025-01-15",
      parentName: "Mary Kamau",
      primaryContact: "+254712345678",
      alternativeContact: "+254723456789",
      year: "2025"
    },
    {
      registrationNumber: "RSS/00002/25",
      name: "Sarah Wanjiku",
      grade: "Grade 7",
      admissionDate: "2025-01-20",
      parentName: "Peter Wanjiku",
      primaryContact: "+254734567890",
      alternativeContact: "",
      year: "2025"
    },
    {
      registrationNumber: "RSS/00003/24",
      name: "David Mwangi",
      grade: "Grade 9",
      admissionDate: "2024-02-10",
      parentName: "Grace Mwangi",
      primaryContact: "+254745678901",
      alternativeContact: "+254756789012",
      year: "2024"
    },
    {
      registrationNumber: "RSS/00004/25",
      name: "Faith Akinyi",
      grade: "Grade 6",
      admissionDate: "2025-01-25",
      parentName: "James Akinyi",
      primaryContact: "+254767890123",
      alternativeContact: "",
      year: "2025"
    },
    {
      registrationNumber: "RSS/00005/24",
      name: "Michael Ochieng",
      grade: "Grade 8",
      admissionDate: "2024-03-05",
      parentName: "Rose Ochieng",
      primaryContact: "+254778901234",
      alternativeContact: "+254789012345",
      year: "2024"
    }
  ];

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  const years = ["2024", "2025"];

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = selectedGrade === "all" || student.grade === selectedGrade;
    const matchesYear = selectedYear === "all" || student.year === selectedYear;
    
    return matchesSearch && matchesGrade && matchesYear;
  });

  const handlePrint = (grade?: string) => {
    const printData = grade 
      ? filteredStudents.filter(s => s.grade === grade)
      : filteredStudents;
    
    console.log("Printing student records:", printData);
    // Here you would implement actual printing functionality
    alert(`Preparing to print ${printData.length} student records...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Records</h2>
        <p className="text-gray-600">Manage and view all student information</p>
      </div>

      {/* Filters and Search */}
      <Card>
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
                onClick={() => handlePrint()}
                className="flex-1"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print All
              </Button>
              <Button 
                variant="outline"
                onClick={() => handlePrint(selectedGrade !== "all" ? selectedGrade : undefined)}
              >
                <Download className="w-4 h-4" />
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
            <Badge variant="secondary">{selectedGrade}</Badge>
          )}
          {selectedYear !== "all" && (
            <Badge variant="secondary">Year {selectedYear}</Badge>
          )}
          {searchTerm && (
            <Badge variant="secondary">Search: "{searchTerm}"</Badge>
          )}
        </div>
      </div>

      {/* Student Records Table */}
      <Card>
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
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Parent/Guardian</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead>Alternative Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.registrationNumber} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-sm">
                      {student.registrationNumber}
                    </TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.grade}</Badge>
                    </TableCell>
                    <TableCell>{student.admissionDate}</TableCell>
                    <TableCell>{student.parentName}</TableCell>
                    <TableCell>{student.primaryContact}</TableCell>
                    <TableCell className="text-gray-500">
                      {student.alternativeContact || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRecords;
