
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Package, Users, Plus } from "lucide-react";
import { fetchAllStudents, Student } from "@/utils/studentDatabase";
import { createFurnitureTransaction, getFurnitureStock } from "@/utils/furnitureDatabase";

interface FurnitureDistributionProps {
  onTransactionComplete: () => void;
}

const FurnitureDistribution = ({ onTransactionComplete }: FurnitureDistributionProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [stock, setStock] = useState<{ chairs: number; lockers: number }>({ chairs: 0, lockers: 0 });
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [chairQuantity, setChairQuantity] = useState<number>(0);
  const [lockerQuantity, setLockerQuantity] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, stockData] = await Promise.all([
        fetchAllStudents(),
        getFurnitureStock()
      ]);
      
      setStudents(studentsData);
      
      const chairStock = stockData.find(s => s.item_type === 'chair')?.available_quantity || 0;
      const lockerStock = stockData.find(s => s.item_type === 'locker')?.available_quantity || 0;
      setStock({ chairs: chairStock, lockers: lockerStock });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
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

  const handleDistribution = async () => {
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

    if (chairQuantity > stock.chairs) {
      toast({
        title: "Error",
        description: `Insufficient chair stock. Available: ${stock.chairs}`,
        variant: "destructive",
      });
      return;
    }

    if (lockerQuantity > stock.lockers) {
      toast({
        title: "Error",
        description: `Insufficient locker stock. Available: ${stock.lockers}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      await createFurnitureTransaction({
        student_id: selectedStudent,
        transaction_type: 'distribution',
        chair_quantity: chairQuantity,
        locker_quantity: lockerQuantity,
        condition: 'new',
        notes: notes.trim() || undefined
      });

      toast({
        title: "Success",
        description: "Furniture distributed successfully",
      });

      // Reset form
      setSelectedGrade("");
      setSelectedStudent("");
      setChairQuantity(0);
      setLockerQuantity(0);
      setNotes("");
      
      // Reload data and notify parent
      loadData();
      onTransactionComplete();
    } catch (error) {
      console.error('Error distributing furniture:', error);
      toast({
        title: "Error",
        description: "Failed to distribute furniture",
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
          <Plus className="h-5 w-5" />
          <span>Distribute Furniture</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stock Display */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Available Stock</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{stock.chairs}</div>
              <p className="text-sm text-blue-700">Chairs</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{stock.lockers}</div>
              <p className="text-sm text-blue-700">Lockers</p>
            </div>
          </div>
        </div>

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

        {/* Quantity Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="chair-quantity">Chair Quantity</Label>
            <Input
              id="chair-quantity"
              type="number"
              min="0"
              max={stock.chairs}
              value={chairQuantity}
              onChange={(e) => setChairQuantity(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 mt-1">Max: {stock.chairs}</p>
          </div>
          <div>
            <Label htmlFor="locker-quantity">Locker Quantity</Label>
            <Input
              id="locker-quantity"
              type="number"
              min="0"
              max={stock.lockers}
              value={lockerQuantity}
              onChange={(e) => setLockerQuantity(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-gray-500 mt-1">Max: {stock.lockers}</p>
          </div>
        </div>

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
          onClick={handleDistribution} 
          disabled={!selectedStudent || (chairQuantity === 0 && lockerQuantity === 0) || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Distributing...
            </>
          ) : (
            <>
              <Package className="h-4 w-4 mr-2" />
              Distribute Furniture
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FurnitureDistribution;
