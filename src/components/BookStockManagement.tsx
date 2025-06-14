
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Library } from "lucide-react";
import { getBookStock, addBookStock, updateBookStock, deleteBookStock, BookStock } from "@/utils/bookDatabase";

const BookStockManagement = () => {
  const [books, setBooks] = useState<BookStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState<BookStock | null>(null);
  const [formData, setFormData] = useState({
    book_title: "",
    author: "",
    isbn: "",
    available_quantity: 0,
    total_quantity: 0
  });
  const { toast } = useToast();

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
        description: "Failed to load book stock",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.book_title.trim()) {
      toast({
        title: "Error",
        description: "Book title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingBook) {
        await updateBookStock(editingBook.id, formData);
        toast({
          title: "Success",
          description: "Book updated successfully",
        });
      } else {
        await addBookStock(formData);
        toast({
          title: "Success",
          description: "Book added successfully",
        });
      }
      
      resetForm();
      loadBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      toast({
        title: "Error",
        description: "Failed to save book",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (book: BookStock) => {
    setEditingBook(book);
    setFormData({
      book_title: book.book_title,
      author: book.author || "",
      isbn: book.isbn || "",
      available_quantity: book.available_quantity,
      total_quantity: book.total_quantity
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      await deleteBookStock(id);
      toast({
        title: "Success",
        description: "Book deleted successfully",
      });
      loadBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingBook(null);
    setFormData({
      book_title: "",
      author: "",
      isbn: "",
      available_quantity: 0,
      total_quantity: 0
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Library className="h-5 w-5" />
          <span>Book Stock Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add/Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="book_title">Book Title *</Label>
              <Input
                id="book_title"
                value={formData.book_title}
                onChange={(e) => setFormData({ ...formData, book_title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="total_quantity">Total Quantity</Label>
              <Input
                id="total_quantity"
                type="number"
                min="0"
                value={formData.total_quantity}
                onChange={(e) => setFormData({ ...formData, total_quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          {!editingBook && (
            <div>
              <Label htmlFor="available_quantity">Available Quantity</Label>
              <Input
                id="available_quantity"
                type="number"
                min="0"
                value={formData.available_quantity}
                onChange={(e) => setFormData({ ...formData, available_quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
          )}

          <div className="flex space-x-2">
            <Button type="submit" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{editingBook ? 'Update Book' : 'Add Book'}</span>
            </Button>
            {editingBook && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        {/* Books Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>ISBN</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.book_title}</TableCell>
                  <TableCell>{book.author || '-'}</TableCell>
                  <TableCell>{book.isbn || '-'}</TableCell>
                  <TableCell>
                    <span className={book.available_quantity === 0 ? 'text-red-600' : 'text-green-600'}>
                      {book.available_quantity}
                    </span>
                  </TableCell>
                  <TableCell>{book.total_quantity}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(book)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(book.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {books.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No books found. Add your first book above.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookStockManagement;
