
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, FileSpreadsheet } from "lucide-react";
import { addSubject } from "@/utils/subjectDatabase";

const BulkSubjectUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const generateCSVTemplate = () => {
    const headers = [
      "Subject Key",
      "Subject Label",
      "Max Marks",
      "Class Teacher"
    ];
    
    const sampleData = [
      ["mathematics", "Mathematics", "100", "John Doe"],
      ["english", "English Language", "100", "Jane Smith"],
      ["science", "Science", "100", "Dr. Johnson"]
    ];

    const csvContent = [
      headers.join(","),
      ...sampleData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "subjects_template.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Template Downloaded",
        description: "CSV template downloaded successfully. Fill in the subject details and upload.",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(",").map(v => v.trim().replace(/"/g, ""));
        
        if (values.length < 3) {
          errors.push(`Line ${i + 1}: Invalid format - requires at least Subject Key, Label, and Max Marks`);
          errorCount++;
          continue;
        }

        const [key, label, maxMarks, classTeacher = ""] = values;

        if (!key || !label) {
          errors.push(`Line ${i + 1}: Subject Key and Label are required`);
          errorCount++;
          continue;
        }

        try {
          await addSubject({
            key: key.toLowerCase().replace(/\s+/g, '_'),
            label: label,
            max_marks: parseInt(maxMarks) || 100,
            class_teacher: classTeacher || null
          });
          successCount++;
        } catch (error) {
          console.error(`Error processing subject ${key}:`, error);
          errors.push(`Line ${i + 1}: Failed to add subject ${key} - ${error instanceof Error ? error.message : 'Unknown error'}`);
          errorCount++;
        }
      }

      toast({
        title: "Upload Complete",
        description: `Successfully added ${successCount} subjects. ${errorCount} errors occurred.`,
        variant: errorCount > 0 ? "destructive" : "default",
      });

      if (errors.length > 0) {
        console.log("Upload errors:", errors);
      }

      // Clear the file input
      event.target.value = "";

    } catch (error) {
      console.error("File processing error:", error);
      toast({
        title: "Error",
        description: "Failed to process the uploaded file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSpreadsheet className="h-5 w-5" />
          <span>Bulk Subject Upload</span>
        </CardTitle>
        <CardDescription>
          Upload subjects in bulk using CSV files. Download the template first, fill in the subject details, then upload.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={generateCSVTemplate}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download Template</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {isUploading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-gray-600">Uploading...</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">CSV Format Instructions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Subject Key:</strong> Unique identifier (e.g., "mathematics", "english")</li>
            <li>• <strong>Subject Label:</strong> Display name (e.g., "Mathematics", "English Language")</li>
            <li>• <strong>Max Marks:</strong> Maximum marks for the subject (default: 100)</li>
            <li>• <strong>Class Teacher:</strong> Teacher assigned to the subject (optional)</li>
            <li>• Use commas to separate values</li>
            <li>• Include headers in your CSV file</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkSubjectUpload;
