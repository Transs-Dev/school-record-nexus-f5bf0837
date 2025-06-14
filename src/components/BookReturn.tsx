
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw } from "lucide-react";
import { fetchAllStudents, Student } from "@/utils/studentDatabase";
import { getBookStock, createBookTransaction, getStudentBookBalance, BookStock } from "@/utils/bookDatabase";

interface BookReturnProps {
  onTransactionComplete: () => void;
}

const BookReturn = ({ onTransactionComplete }: BookReturnProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [books, setBooks] = useState<BookStock[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [studentBookBalance, setStudentBookBalance] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [condition, setCondition] = useState<'good' | 'bad'>('good');
  const [compensationFee, setCompensationFee] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStudent && selectedBook) {
      loadStudentBookBalance();
    }
  }, [selectedStudent, selectedBook]);

  useEffect(() => {
    if (condition === 'good') {
      setCompensationFee(0);
    }
  }, [condition]);

  const loadData = async () => {
    try {
      const [studentsData, booksData] = await Promise.all([
        fetchAllStudents(),
        getBookStock()
      ]);
      
      setStudents(studentsData);
      setBooks(booksData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    }
  };

  const loadStudentBookBalance = async () => {
    try {
      const balance = await getStudentBookBalance(selectedStudent, selectedBook);
      setStudentBookBalance(balance);
    } catch (error) {
      console.error('Error loading student book balance:', error);
      toast({
        title: "Error",
        description: "Failed to load student book balance",
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

  const getSelectedBook = () => {
    return books.find(book => book.id === selectedBook);
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

    if (!selectedBook) {
      toast({
        title: "Error",
        description: "Please select a book",
        variant: "destructive",
      });
      return;
    }

    if (quantity > studentBookBalance) {
      toast({
        title: "Error",
        description: `Student only has ${studentBookBalance} copies of this book`,
        variant: "destructive",
      });
      return;
    }

    if (condition === 'bad' && compensationFee <= 0) {
      toast({
        title: "Error",
        description: "Please enter compensation fee for damaged book",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      await createBookTransaction({
        student_id: selectedStudent,
        book_id: selectedBook,
        transaction_type: 'return',
        quantity: quantity,
        condition: condition,
        compensation_fee: condition === 'bad' ? compensationFee : 0,
        notes: notes.trim() || undefined
      });

      toast({
        title: "Success",
        description: "Book returned successfully",
      });

      // Reset form
      setSelectedGrade("");
      setSelectedStudent("");
      setSelectedBook("");
      setStudentBookBalance(0);
      setQuantity(1);
      setCondition('good');
      setCompensationFee(0);
      setNotes("");
      
      // Notify parent
      onTransactionComplete();
    } catch (error) {
      console.error('Error returning book:', error);
      toast({
        title: "Error",
        description: "Failed to return book",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedBookData = getSelectedBook();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <RotateCcw className="h-5 w-5" />
          <span>Return Books</span>
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

        {/* Book Selection */}
        {selectedStudent && (
          <div>
            <Label htmlFor="book-select">Select Book</Label>
            <Select value={selectedBook} onValueChange={setSelectedBook}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a book" />
              </SelectTrigger>
              <SelectContent>
                {books.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.book_title} {book.author && `by ${book.author}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Student's Book Balance */}
        {selectedStudent && selectedBook && selectedBookData && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Student's Current Books</h4>
            <div className="text-sm text-green-700">
              <div><strong>Book:</strong> {selectedBookData.book_title}</div>
              <div><strong>Quantity Borrowed:</strong> {studentBookBalance}</div>
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <Label htmlFor="quantity">Return Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max={studentBookBalance}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
          <p className="text-xs text-gray-500 mt-1">Max: {studentBookBalance}</p>
        </div>

        {/* Condition Selection */}
        <div>
          <Label htmlFor="condition">Book Condition</Label>
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
          disabled={!selectedStudent || !selectedBook || studentBookBalance === 0 || loading}
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
            </Button>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BookReturn;
