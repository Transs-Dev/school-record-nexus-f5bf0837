
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Filter } from "lucide-react";
import { getBookStock, addBookStock, updateBookStock, deleteBookStock, BookStock } from "@/utils/bookDatabase";
import GradeBookManagement from "./GradeBookManagement";

const BookStockManagement = () => {
  const [books, setBooks] = useState<BookStock[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Legacy book form state (without grade)
  const [newBook, setNewBook] = useState({
    book_title: "",
    author: "",
    isbn: "",
    total_quantity: 0,
    available_quantity: 0
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const booksData = await getBookStock();
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

  const handleAddBook = async () => {
    if (!newBook.book_title.trim()) {
      toast({
        title: "Error",
        description: "Book title is required",
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

  const handleDeleteBook = async (id: string) => {
    try {
      await deleteBookStock(id);
      toast({
        title: "Success",
        description: "Book deleted successfully",
      });
      loadBooks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete book",
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
        <h2 className="text-2xl font-bold">Book Stock Management</h2>
      </div>

      <Tabs defaultValue="grade-based" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grade-based">Grade-Based Management</TabsTrigger>
          <TabsTrigger value="general">General Stock</TabsTrigger>
        </TabsList>

        <TabsContent value="grade-based">
          <GradeBookManagement />
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          {/* Legacy Add New Book Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add General Book (No Grade Assignment)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Book Title</Label>
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
                <div className="space-y-2">
                  <Label>Available Quantity</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newBook.available_quantity}
                    onChange={(e) => setNewBook({ ...newBook, available_quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <Button onClick={handleAddBook} disabled={loading}>
                Add Book
              </Button>
            </CardContent>
          </Card>

          {/* All Books Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>All Books Inventory</CardTitle>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium">{book.book_title}</TableCell>
                      <TableCell>{book.author || "N/A"}</TableCell>
                      <TableCell>
                        {book.grade ? (
                          <Badge variant="outline">{book.grade}</Badge>
                        ) : (
                          <Badge variant="secondary">General</Badge>
                        )}
                      </TableCell>
                      <TableCell>{book.isbn || "N/A"}</TableCell>
                      <TableCell>{book.available_quantity}</TableCell>
                      <TableCell>{book.total_quantity}</TableCell>
                      <TableCell>{getStockStatus(book)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteBook(book.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {books.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500">
                        No books found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookStockManagement;
