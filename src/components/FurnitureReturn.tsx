
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Package, RotateCcw } from "lucide-react";
import { fetchAllStudents, Student } from "@/utils/studentDatabase";
import { createFurnitureTransaction, getStudentsWithFurniture, getStudentFurnitureBalance } from "@/utils/furnitureDatabase";

interface FurnitureReturnProps {
  onTransactionComplete: () => void;
}

const FurnitureReturn = ({ onTransactionComplete }: FurnitureReturnProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [studentBalance, setStudentBalance] = useState<{ chairs: number; lockers: number }>({ chairs: 0, lockers: 0 });
  const [chairQuantity, setChairQuantity] = useState<number>(0);
  const [lockerQuantity, setLockerQuantity] = useState<number>(0);
  const [condition, setCondition] = useState<'good' | 'bad'>('good');
  const [compensationFee, setCompensationFee] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentBalance();
    }
  }, [selectedStudent]);

  useEffect(() => {
    if (condition === 'good') {
      setCompensationFee(0);
    }
  }, [condition]);

  const loadStudents = async () => {
    try {
      const studentsData = await fetchAllStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    }
  };

  const loadStudentBalance = async () => {
    try {
      const balance = await getStudentFurnitureBalance(selectedStudent);
      setStudentBalance({ chairs: balance.chairs, lockers: balance.lockers });
    } catch (error) {
      console.error('Error loading student balance:', error);
      toast({
        title: "Error",
        description: "Failed to load student furniture balance",
        variant: "destructive",
      });
    }
  };

  const getUniqueGrades = () => {
    const grades = [...new Set(students.map(student => student.grade))];
    return grades.sort();
  };

  const getStudentsByGrade = (grade: string) => {
    return students.filter(student => student.grade === grade);
  };

  const handleReturn = async () => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive",
      });
      return;
    }

    if (chairQuantity === 0 && lockerQuantity === 0) {
      toast({
        title: "Error",
        description: "Please specify at least one item quantity",
        variant: "destructive",
      });
      return;
    }

    if (chairQuantity > studentBalance.chairs) {
      toast({
        title: "Error",
        description: `Student only has ${studentBalance.chairs} chairs`,
        variant: "destructive",
      });
      return;
    }

    if (lockerQuantity > studentBalance.lockers) {
      toast({
        title: "Error",
        description: `Student only has ${studentBalance.lockers} lockers`,
        variant: "destructive",
      });
      return;
    }

    if (condition === 'bad' && compensationFee <= 0) {
      toast({
        title: "Error",
        description: "Please enter compensation fee for damaged furniture",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      await createFurnitureTransaction({
        student_id: selectedStudent,
        transaction_type: 'return',
        chair_quantity: chairQuantity,
        locker_quantity: lockerQuantity,
        condition: condition,
        compensation_fee: condition === 'bad' ? compensationFee : 0,
        notes: notes.trim() || undefined
      });

      toast({
        title: "Success",
        description: "Furniture returned successfully",
      });

      // Reset form
      setSelectedGrade("");
      setSelectedStudent("");
      setStudentBalance({ chairs: 0, lockers: 0 });
      setChairQuantity(0);
      setLockerQuantity(0);
      setCondition('good');
      setCompensationFee(0);
      setNotes("");
      
      // Notify parent
      onTransactionComplete();
    } catch (error) {
      console.error('Error returning furniture:', error);
      toast({
        title: "Error",
        description: "Failed to return furniture",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <RotateCcw className="h-5 w-5" />
          <span>Return Furniture</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grade Selection */}
        <div>
          <Label htmlFor="grade-select">Select Grade</Label>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a grade" />
            </SelectTrigger>
            <SelectContent>
              {getUniqueGrades().map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Student Selection */}
        {selectedGrade && (
          <div>
            <Label htmlFor="student-select">Select Student</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a student" />
              </SelectTrigger>
              <SelectContent>
                {getStudentsByGrade(selectedGrade).map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.student_name} - {student.registration_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Student Balance Display */}
        {selectedStudent && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Student's Current Furniture</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{studentBalance.chairs}</div>
                <p className="text-sm text-green-700">Chairs</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{studentBalance.lockers}</div>
                <p className="text-sm text-green-700">Lockers</p>
              </div>
            </div>
          </div>
        )}

        {/* Quantity Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="chair-quantity">Chair Quantity</Label>
            <Input
              id="chair-quantity"
              type="number"
              min="0"
              max={studentBalance.chairs}
              value={chairQuantity}
              onChange={(e) => setChairQuantity(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 mt-1">Max: {studentBalance.chairs}</p>
          </div>
          <div>
            <Label htmlFor="locker-quantity">Locker Quantity</Label>
            <Input
              id="locker-quantity"
              type="number"
              min="0"
              max={studentBalance.lockers}
              value={lockerQuantity}
              onChange={(e) => setLockerQuantity(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 mt-1">Max: {studentBalance.lockers}</p>
          </div>
        </div>

        {/* Condition Selection */}
        <div>
          <Label htmlFor="condition">Furniture Condition</Label>
          <Select value={condition} onValueChange={(value: 'good' | 'bad') => setCondition(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="good">Good Condition</SelectItem>
              <SelectItem value="bad">Bad Condition (Damaged)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Compensation Fee */}
        {condition === 'bad' && (
          <div>
            <Label htmlFor="compensation-fee">Compensation Fee</Label>
            <Input
              id="compensation-fee"
              type="number"
              min="0"
              step="0.01"
              value={compensationFee}
              onChange={(e) => setCompensationFee(parseFloat(e.target.value) || 0)}
              placeholder="Enter compensation amount"
            />
          </div>
        )}

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleReturn} 
          disabled={!selectedStudent || (chairQuantity === 0 && lockerQuantity === 0) || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Return...
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4 mr-2" />
              Process Return
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FurnitureReturn;
