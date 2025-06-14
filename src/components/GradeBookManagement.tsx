
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus } from "lucide-react";
import { getBookStockByGrade, addBookStock, BookStock } from "@/utils/bookDatabase";

const GradeBookManagement = () => {
  const [books, setBooks] = useState<BookStock[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookStock[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // New book form state
  const [newBook, setNewBook] = useState({
    book_title: "",
    author: "",
    isbn: "",
    grade: "",
    total_quantity: 0,
    available_quantity: 0
  });

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", 
    "Grade 5", "Grade 6", "Grade 7", "Grade 8"
  ];

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    filterBooksByGrade();
  }, [selectedGrade, books]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const booksData = await getBookStockByGrade();
      setBooks(booksData);
    } catch (error) {
      console.error('Error loading books:', error);
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterBooksByGrade = () => {
    if (selectedGrade === "all") {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book => book.grade === selectedGrade);
      setFilteredBooks(filtered);
    }
  };

  const handleAddBook = async () => {
    if (!newBook.book_title.trim() || !newBook.grade) {
      toast({
        title: "Error",
        description: "Book title and grade are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await addBookStock(newBook);
      toast({
        title: "Success",
        description: "Book added successfully",
      });
      setNewBook({
        book_title: "",
        author: "",
        isbn: "",
        grade: "",
        total_quantity: 0,
        available_quantity: 0
      });
      loadBooks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add book",
        variant: "destructive",
      });
    }
  };

  const getStockStatus = (book: BookStock) => {
    if (book.available_quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (book.available_quantity < book.total_quantity * 0.2) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <BookOpen className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Grade-Based Book Management</h2>
      </div>

      {/* Add New Book Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Book</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Book Title *</Label>
              <Input
                value={newBook.book_title}
                onChange={(e) => setNewBook({ ...newBook, book_title: e.target.value })}
                placeholder="Enter book title"
              />
            </div>
            <div className="space-y-2">
              <Label>Author</Label>
              <Input
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                placeholder="Enter author name"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>ISBN</Label>
              <Input
                value={newBook.isbn}
                onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                placeholder="Enter ISBN"
              />
            </div>
            <div className="space-y-2">
              <Label>Grade *</Label>
              <Select value={newBook.grade} onValueChange={(value) => setNewBook({ ...newBook, grade: value })}>
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
              <Label>Total Quantity</Label>
              <Input
                type="number"
                min="0"
                value={newBook.total_quantity}
                onChange={(e) => setNewBook({ 
                  ...newBook, 
                  total_quantity: parseInt(e.target.value) || 0,
                  available_quantity: parseInt(e.target.value) || 0
                })}
              />
            </div>
          </div>

          <Button onClick={handleAddBook} disabled={loading}>
            Add Book
          </Button>
        </CardContent>
      </Card>

      {/* Book Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Book Inventory</CardTitle>
          <div className="flex items-center space-x-4">
            <Label>Filter by Grade:</Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All grades</SelectItem>
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.book_title}</TableCell>
                  <TableCell>{book.author || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{book.grade || "Unassigned"}</Badge>
                  </TableCell>
                  <TableCell>{book.isbn || "N/A"}</TableCell>
                  <TableCell>{book.available_quantity}</TableCell>
                  <TableCell>{book.total_quantity}</TableCell>
                  <TableCell>{getStockStatus(book)}</TableCell>
                </TableRow>
              ))}
              {filteredBooks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    {selectedGrade !== "all" ? `No books found for ${selectedGrade}` : "No books found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeBookManagement;
