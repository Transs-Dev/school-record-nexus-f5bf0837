
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowRightLeft, Search, BookOpen } from "lucide-react";
import { getStudentsWithBooks, createBookTransaction, getStudentBookBalance, updateBookStock, getStudentBorrowedBooks } from "@/utils/bookDatabase";
import { getStudents } from "@/utils/studentDatabase";

interface BookReturnProps {
  onTransactionComplete: () => void;
}

const BookReturn = ({ onTransactionComplete }: BookReturnProps) => {
  const [students, setStudents] = useState<any[]>([]);
  const [studentsWithBooks, setStudentsWithBooks] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [studentBorrowedBooks, setStudentBorrowedBooks] = useState<any[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [condition, setCondition] = useState<string>("good");
  const [compensationFee, setCompensationFee] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentBorrowedBooks();
    } else {
      setStudentBorrowedBooks([]);
      setSelectedBook("");
    }
  }, [selectedStudent]);

  const loadData = async () => {
    try {
      const [allStudents, studentsWithBooksData] = await Promise.all([
        getStudents(),
        getStudentsWithBooks()
      ]);
      setStudents(allStudents);
      setStudentsWithBooks(studentsWithBooksData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load student data",
        variant: "destructive",
      });
    }
  };

  const loadStudentBorrowedBooks = async () => {
    if (!selectedStudent) return;
    
    try {
      const borrowedBooks = await getStudentBorrowedBooks(selectedStudent);
      setStudentBorrowedBooks(borrowedBooks);
      console.log('Loaded borrowed books:', borrowedBooks);
    } catch (error) {
      console.error('Error loading student borrowed books:', error);
      toast({
        title: "Error",
        description: "Failed to load student's borrowed books",
        variant: "destructive",
      });
    }
  };

  const handleReturn = async () => {
    if (!selectedStudent || !selectedBook) {
      toast({
        title: "Error",
        description: "Please select both student and book",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Check student's balance for this book
      const balance = await getStudentBookBalance(selectedStudent, selectedBook);
      
      if (balance < quantity) {
        toast({
          title: "Error",
          description: `Student only has ${balance} of this book to return`,
          variant: "destructive",
        });
        return;
      }

      // Create return transaction
      await createBookTransaction({
        student_id: selectedStudent,
        book_id: selectedBook,
        transaction_type: 'return',
        quantity,
        condition: condition as 'good' | 'bad' | 'new',
        compensation_fee: compensationFee > 0 ? compensationFee : undefined,
        notes: notes.trim() || undefined,
      });

      // Update book stock
      await updateBookStock(selectedBook, {
        available_quantity: quantity
      });

      toast({
        title: "Success",
        description: "Book returned successfully",
      });

      // Reset form
      setSelectedStudent("");
      setSelectedBook("");
      setQuantity(1);
      setCondition("good");
      setCompensationFee(0);
      setNotes("");
      
      onTransactionComplete();
      loadData();
      
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

  const filteredStudents = studentsWithBooks.filter(student =>
    student.students?.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.students?.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedStudentInfo = studentsWithBooks.find(s => s.student_id === selectedStudent);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Return Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowRightLeft className="h-5 w-5" />
            <span>Return Books</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Student</Label>
            <div className="flex items-center space-x-2 mb-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {filteredStudents.map((student) => (
                  <SelectItem key={student.student_id} value={student.student_id}>
                    {student.students?.student_name} - {student.students?.registration_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStudent && (
            <div className="space-y-2">
              <Label>Borrowed Books</Label>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a book to return" />
                </SelectTrigger>
                <SelectContent>
                  {studentBorrowedBooks.map((book) => (
                    <SelectItem key={book.book_id} value={book.book_id}>
                      {book.book_stock?.book_title} - Balance: {book.balance}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {studentBorrowedBooks.length === 0 && (
                <p className="text-sm text-gray-500">No borrowed books found for this student</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label>Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="bad">Bad/Damaged</SelectItem>
                  <SelectItem value="new">Like New</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {condition === "bad" && (
            <div className="space-y-2">
              <Label>Compensation Fee ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={compensationFee}
                onChange={(e) => setCompensationFee(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about the return..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleReturn} 
            disabled={loading || !selectedStudent || !selectedBook}
            className="w-full"
          >
            {loading ? "Processing..." : "Process Return"}
          </Button>
        </CardContent>
      </Card>

      {/* Student Info and Borrowed Books */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>
              {selectedStudent ? 'Student Books' : 'Students with Books'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedStudent && selectedStudentInfo ? (
            <div className="space-y-4">
              {/* Student Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">
                  {selectedStudentInfo.students?.student_name}
                </h3>
                <p className="text-sm text-gray-600">
                  Registration: {selectedStudentInfo.students?.registration_number}
                </p>
                <p className="text-sm text-gray-600">
                  Grade: {selectedStudentInfo.students?.grade}
                </p>
              </div>

              {/* Borrowed Books List */}
              <div>
                <h4 className="font-medium mb-2">Borrowed Books:</h4>
                {studentBorrowedBooks.length > 0 ? (
                  <div className="space-y-2">
                    {studentBorrowedBooks.map((book) => (
                      <div key={book.book_id} className="border rounded p-3">
                        <div className="font-medium">{book.book_stock?.book_title}</div>
                        <div className="text-sm text-gray-600">
                          Author: {book.book_stock?.author || 'Unknown'}
                        </div>
                        <div className="text-sm">
                          <Badge variant="outline">Balance: {book.balance}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No borrowed books found</p>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.student_id}>
                      <TableCell className="font-medium">
                        {student.students?.student_name || 'Unknown'}
                      </TableCell>
                      <TableCell>{student.students?.registration_number}</TableCell>
                      <TableCell>{student.students?.grade}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Has Books</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No students with books found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookReturn;
