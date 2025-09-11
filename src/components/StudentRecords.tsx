import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Filter, Edit, Trash2, Save, X } from "lucide-react";
import { fetchAllStudents, printStudentList, downloadStudentList, type Student } from "@/utils/studentDatabase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const StudentRecords = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleEditStudent = (student: Student) => {
    setEditingStudent({ ...student });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingStudent || !editingStudent.id) return;

    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('students')
        .update({
          student_name: editingStudent.student_name,
          grade: editingStudent.grade,
          date_of_birth: editingStudent.date_of_birth,
          parent_name: editingStudent.parent_name,
          address: editingStudent.address,
          primary_contact: editingStudent.primary_contact,
          alternative_contact: editingStudent.alternative_contact,
          gender: editingStudent.gender,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingStudent.id);

      if (error) throw error;

      // Update local state
      setStudents(prev => prev.map(student => 
        student.id === editingStudent.id ? editingStudent : student
      ));

      setIsEditDialogOpen(false);
      setEditingStudent(null);

      toast({
        title: "Student Updated",
        description: `${editingStudent.student_name}'s information has been updated successfully.`,
      });

    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update student information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!student.id) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${student.student_name}? This action cannot be undone and will also remove all associated examination records, fee data, book transactions, furniture transactions, and laboratory clearance records.`
    );

    if (!confirmDelete) return;

    try {
      console.log('Starting deletion process for student:', student.id);

      // Delete all related records in the correct order to avoid foreign key constraint violations
      
      // 1. Delete book transactions first
      const { error: bookTransactionError } = await supabase
        .from('book_transactions')
        .delete()
        .eq('student_id', student.id);

      if (bookTransactionError) {
        console.error('Error deleting book transactions:', bookTransactionError);
        throw bookTransactionError;
      }

      // 2. Delete furniture transactions
      const { error: furnitureTransactionError } = await supabase
        .from('furniture_transactions')
        .delete()
        .eq('student_id', student.id);

      if (furnitureTransactionError) {
        console.error('Error deleting furniture transactions:', furnitureTransactionError);
        throw furnitureTransactionError;
      }

      // 3. Delete laboratory clearance records
      const { error: labClearanceError } = await supabase
        .from('laboratory_clearance')
        .delete()
        .eq('student_id', student.id);

      if (labClearanceError) {
        console.error('Error deleting laboratory clearance:', labClearanceError);
        throw labClearanceError;
      }

      // 4. Delete examination marks
      const { error: examMarksError } = await supabase
        .from('examination_marks')
        .delete()
        .eq('student_id', student.id);

      if (examMarksError) {
        console.error('Error deleting examination marks:', examMarksError);
        throw examMarksError;
      }

      // 5. Delete fee payments
      const { error: feePaymentsError } = await supabase
        .from('fee_payments')
        .delete()
        .eq('student_id', student.id);

      if (feePaymentsError) {
        console.error('Error deleting fee payments:', feePaymentsError);
        throw feePaymentsError;
      }

      // 6. Delete student fee records
      const { error: studentFeeRecordsError } = await supabase
        .from('student_fee_records')
        .delete()
        .eq('student_id', student.id);

      if (studentFeeRecordsError) {
        console.error('Error deleting student fee records:', studentFeeRecordsError);
        throw studentFeeRecordsError;
      }

      // 7. Finally delete the student record
      const { error: studentError } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id);

      if (studentError) {
        console.error('Error deleting student:', studentError);
        throw studentError;
      }

      // Update local state
      setStudents(prev => prev.filter(s => s.id !== student.id));

      toast({
        title: "Student Deleted",
        description: `${student.student_name} has been removed from the system.`,
      });

      console.log('Student deletion completed successfully');

    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete student. Please try again.",
        variant: "destructive"
      });
    }
  };

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
          <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
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
            Complete list of enrolled students with their details and management options
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
                  <TableHead className="text-center">Actions</TableHead>
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
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStudent(student)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteStudent(student)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
            <DialogDescription>
              Update the student's details. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          {editingStudent && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Student Name *</Label>
                <Input
                  id="edit-name"
                  value={editingStudent.student_name}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, student_name: e.target.value } : null)}
                  placeholder="Enter student's full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-grade">Grade *</Label>
                <Select value={editingStudent.grade} onValueChange={(value) => setEditingStudent(prev => prev ? { ...prev, grade: value } : null)}>
                  <SelectTrigger id="edit-grade">
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
                <Label htmlFor="edit-dob">Date of Birth *</Label>
                <Input
                  id="edit-dob"
                  type="date"
                  value={editingStudent.date_of_birth}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, date_of_birth: e.target.value } : null)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-gender">Gender *</Label>
                <Select value={editingStudent.gender} onValueChange={(value: 'Male' | 'Female') => setEditingStudent(prev => prev ? { ...prev, gender: value } : null)}>
                  <SelectTrigger id="edit-gender">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-parent">Parent/Guardian Name *</Label>
                <Input
                  id="edit-parent"
                  value={editingStudent.parent_name}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, parent_name: e.target.value } : null)}
                  placeholder="Enter parent/guardian name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-primary-contact">Primary Contact *</Label>
                <Input
                  id="edit-primary-contact"
                  value={editingStudent.primary_contact}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, primary_contact: e.target.value } : null)}
                  placeholder="Enter primary phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-alternative-contact">Alternative Contact</Label>
                <Input
                  id="edit-alternative-contact"
                  value={editingStudent.alternative_contact || ""}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, alternative_contact: e.target.value } : null)}
                  placeholder="Enter alternative phone number"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="edit-address">Home Address</Label>
                <Input
                  id="edit-address"
                  value={editingStudent.address || ""}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, address: e.target.value } : null)}
                  placeholder="Enter home address"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentRecords;
