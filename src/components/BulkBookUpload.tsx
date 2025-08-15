
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import { addBookStock } from "@/utils/bookDatabase";

const BulkBookUpload = () => {
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", 
    "Grade 5", "Grade 6", "Grade 7", "Grade 8"
  ];

  const downloadCSVTemplate = () => {
    if (!selectedGrade) {
      toast({
        title: "Error",
        description: "Please select a grade first",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Book Title*', 'Author', 'ISBN', 'Total Quantity'];
    const csvContent = headers.join(',') + '\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedGrade.replace(' ', '_')}_books_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `CSV template downloaded for ${selectedGrade}`,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedGrade) {
      toast({
        title: "Error",
        description: "Please select a grade first",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV file must contain at least one data row");
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const expectedHeaders = ['Book Title*', 'Author', 'ISBN', 'Total Quantity'];
      
      if (!expectedHeaders.every(header => headers.includes(header))) {
        throw new Error("CSV headers don't match the template. Please use the downloaded template.");
      }

      const bookData = [];
      const errors = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Incorrect number of columns`);
          continue;
        }

        const bookTitle = values[headers.indexOf('Book Title*')];
        const author = values[headers.indexOf('Author')];
        const isbn = values[headers.indexOf('ISBN')];
        const totalQuantity = parseInt(values[headers.indexOf('Total Quantity')]) || 0;

        if (!bookTitle) {
          errors.push(`Row ${i + 1}: Book Title is required`);
          continue;
        }

        if (totalQuantity <= 0) {
          errors.push(`Row ${i + 1}: Total Quantity must be greater than 0`);
          continue;
        }

        bookData.push({
          book_title: bookTitle,
          author: author || "",
          isbn: isbn || "",
          grade: selectedGrade,
          total_quantity: totalQuantity,
          available_quantity: totalQuantity
        });
      }

      if (errors.length > 0) {
        throw new Error(`Upload failed with errors:\n${errors.join('\n')}`);
      }

      // Upload books in batches
      const batchSize = 10;
      let uploadedCount = 0;

      for (let i = 0; i < bookData.length; i += batchSize) {
        const batch = bookData.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(book => addBookStock(book))
        );
        
        uploadedCount += batch.length;
        
        // Show progress
        toast({
          title: "Progress",
          description: `Uploaded ${uploadedCount} of ${bookData.length} books`,
        });
      }

      toast({
        title: "Success",
        description: `Successfully uploaded ${bookData.length} books for ${selectedGrade}`,
      });

      // Reset form
      setSelectedGrade("");
      event.target.value = "";

    } catch (error) {
      console.error('Error uploading books:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload books",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSpreadsheet className="h-5 w-5" />
          <span>Bulk Book Upload</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">How to use:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Select the grade for the books</li>
            <li>2. Download the CSV template</li>
            <li>3. Fill in the book details in the CSV file</li>
            <li>4. Upload the completed CSV file</li>
          </ol>
        </div>

        <div className="space-y-2">
          <Label>Select Grade</Label>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a grade" />
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

        <div className="flex gap-4">
          <Button
            onClick={downloadCSVTemplate}
            disabled={!selectedGrade}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV Template</span>
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="book-upload">Upload Completed CSV</Label>
          <Input
            id="book-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploading || !selectedGrade}
          />
          {!selectedGrade && (
            <p className="text-sm text-orange-600">Please select a grade first</p>
          )}
        </div>

        {uploading && (
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Uploading books...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkBookUpload;
