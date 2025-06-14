
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus } from "lucide-react";
import { fetchAllStudents, Student } from "@/utils/studentDatabase";
import { getBookStock, createBookTransaction, BookStock } from "@/utils/bookDatabase";

interface BookDistributionProps {
  onTransactionComplete: () => void;
}

const BookDistribution = ({ onTransactionComplete }: BookDistributionProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [books, setBooks] = useState<BookStock[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, booksData] = await Promise.all([
        fetchAllStudents(),
        getBookStock()
      ]);
      
      setStudents(studentsData);
      setBooks(booksData.filter(book => book.available_quantity > 0));
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

  const getSelectedBook = () => {
    return books.find(book => book.id === selectedBook);
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

    if (!selectedBook) {
      toast({
        title: "Error",
        description: "Please select a book",
        variant: "destructive",
      });
      return;
    }

    const book = getSelectedBook();
    if (!book || quantity > book.available_quantity) {
      toast({
        title: "Error",
        description: `Insufficient stock. Available: ${book?.available_quantity || 0}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      await createBookTransaction({
        student_id: selectedStudent,
        book_id: selectedBook,
        transaction_type: 'distribution',
        quantity: quantity,
        condition: 'new',
        notes: notes.trim() || undefined
      });

      toast({
        title: "Success",
        description: "Book distributed successfully",
      });

      // Reset form
      setSelectedGrade("");
      setSelectedStudent("");
      setSelectedBook("");
      setQuantity(1);
      setNotes("");
      
      // Reload data and notify parent
      loadData();
      onTransactionComplete();
    } catch (error) {
      console.error('Error distributing book:', error);
      toast({
        title: "Error",
        description: "Failed to distribute book",
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
          <Plus className="h-5 w-5" />
          <span>Distribute Books</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Books Display */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Available Books</h4>
          <div className="text-sm text-blue-700">
            {books.length} books available for distribution
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

        {/* Book Selection */}
        <div>
          <Label htmlFor="book-select">Select Book</Label>
          <Select value={selectedBook} onValueChange={setSelectedBook}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a book" />
            </SelectTrigger>
            <SelectContent>
              {books.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.book_title} {book.author && `by ${book.author}`} (Available: {book.available_quantity})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Book Details */}
        {selectedBookData && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Selected Book</h4>
            <div className="text-sm text-green-700">
              <div><strong>Title:</strong> {selectedBookData.book_title}</div>
              {selectedBookData.author && <div><strong>Author:</strong> {selectedBookData.author}</div>}
              {selectedBookData.isbn && <div><strong>ISBN:</strong> {selectedBookData.isbn}</div>}
              <div><strong>Available:</strong> {selectedBookData.available_quantity}</div>
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max={selectedBookData?.available_quantity || 1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Max: {selectedBookData?.available_quantity || 0}
          </p>
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
          disabled={!selectedStudent || !selectedBook || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Distributing...
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Distribute Book
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BookDistribution;
