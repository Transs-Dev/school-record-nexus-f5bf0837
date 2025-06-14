
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Package, Users, Plus } from "lucide-react";
import { fetchAllStudents, Student } from "@/utils/studentDatabase";
import { bulkAssignFurnitureToGrade } from "@/utils/furnitureDatabase";

const BulkFurnitureAssignment = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [chairStock, setChairStock] = useState<number>(0);
  const [lockerStock, setLockerStock] = useState<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const studentsData = await fetchAllStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUniqueGrades = () => {
    const grades = [...new Set(students.map(student => student.grade))];
    return grades.sort();
  };

  const getStudentCountByGrade = (grade: string) => {
    return students.filter(student => student.grade === grade).length;
  };

  const handleBulkAssignment = async () => {
    if (!selectedGrade) {
      toast({
        title: "Error",
        description: "Please select a grade",
        variant: "destructive",
      });
      return;
    }

    if (chairStock <= 0 || lockerStock <= 0) {
      toast({
        title: "Error",
        description: "Please enter valid stock quantities for both chairs and lockers",
        variant: "destructive",
      });
      return;
    }

    try {
      setAssigning(true);
      const result = await bulkAssignFurnitureToGrade(selectedGrade, chairStock, lockerStock);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Reset form
        setSelectedGrade("");
        setChairStock(0);
        setLockerStock(0);
      } else {
        toast({
          title: "Assignment Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during bulk assignment:', error);
      toast({
        title: "Error",
        description: "Failed to assign furniture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAssigning(false);
    }
  };

  const selectedGradeStudentCount = selectedGrade ? getStudentCountByGrade(selectedGrade) : 0;
  const requiredChairs = selectedGradeStudentCount;
  const requiredLockers = selectedGradeStudentCount;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Bulk Furniture Assignment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Bulk Furniture Assignment</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="chair-stock">Available Chair Stock</Label>
            <Input
              id="chair-stock"
              type="number"
              min="0"
              value={chairStock}
              onChange={(e) => setChairStock(parseInt(e.target.value) || 0)}
              placeholder="Enter available chairs"
            />
          </div>
          <div>
            <Label htmlFor="locker-stock">Available Locker Stock</Label>
            <Input
              id="locker-stock"
              type="number"
              min="0"
              value={lockerStock}
              onChange={(e) => setLockerStock(parseInt(e.target.value) || 0)}
              placeholder="Enter available lockers"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="grade-select">Select Grade</Label>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a grade" />
            </SelectTrigger>
            <SelectContent>
              {getUniqueGrades().map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade} ({getStudentCountByGrade(grade)} students)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedGrade && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Assignment Summary</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p>Grade: <strong>{selectedGrade}</strong></p>
              <p>Students in grade: <strong>{selectedGradeStudentCount}</strong></p>
              <p>Required chairs: <strong>{requiredChairs}</strong> (Available: {chairStock})</p>
              <p>Required lockers: <strong>{requiredLockers}</strong> (Available: {lockerStock})</p>
            </div>
            
            {(chairStock < requiredChairs || lockerStock < requiredLockers) && (
              <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-sm">
                <strong>Warning:</strong> Insufficient stock for all students in this grade.
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={handleBulkAssignment} 
          disabled={!selectedGrade || chairStock <= 0 || lockerStock <= 0 || assigning}
          className="w-full"
        >
          {assigning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Assigning Furniture...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Assign Furniture to Grade {selectedGrade}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BulkFurnitureAssignment;
