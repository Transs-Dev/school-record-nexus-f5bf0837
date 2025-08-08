
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Download, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { insertStudent, type Student } from "@/utils/studentDatabase";
import { toast } from "@/hooks/use-toast";

interface BulkEnrollmentResult {
  success: number;
  failed: number;
  errors: string[];
}

const BulkEnrollment = () => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const downloadTemplate = () => {
    const headers = [
      'Student Name',
      'Grade',
      'Gender',
      'Date of Birth',
      'Admission Date', 
      'Parent/Guardian Name',
      'Primary Contact',
      'Alternative Contact',
      'Home Address'
    ];
    
    const sampleData = [
      'John Doe,Grade 1,Male,2015-01-15,2024-01-01,Jane Doe,+256700123456,+256700123457,123 Main Street Kampala',
      'Mary Smith,Grade 2,Female,2014-05-20,2024-01-01,Robert Smith,+256700234567,,456 Oak Avenue Entebbe'
    ];

    const csvContent = [
      headers.join(','),
      ...sampleData
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_enrollment_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded. Fill it out and upload to enroll students in bulk.",
    });
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      
      row._lineNumber = index + 2; // +2 because we skip header and arrays are 0-indexed
      return row;
    });
  };

  const validateStudentData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data['Student Name']?.trim()) {
      errors.push(`Line ${data._lineNumber}: Student Name is required`);
    }
    
    if (!data['Grade']?.trim()) {
      errors.push(`Line ${data._lineNumber}: Grade is required`);
    }
    
    if (!data['Gender']?.trim() || !['Male', 'Female'].includes(data['Gender'])) {
      errors.push(`Line ${data._lineNumber}: Gender must be 'Male' or 'Female'`);
    }
    
    if (!data['Date of Birth']?.trim()) {
      errors.push(`Line ${data._lineNumber}: Date of Birth is required`);
    } else {
      const dob = new Date(data['Date of Birth']);
      if (isNaN(dob.getTime())) {
        errors.push(`Line ${data._lineNumber}: Invalid Date of Birth format (use YYYY-MM-DD)`);
      }
    }
    
    if (!data['Admission Date']?.trim()) {
      errors.push(`Line ${data._lineNumber}: Admission Date is required`);
    } else {
      const admissionDate = new Date(data['Admission Date']);
      if (isNaN(admissionDate.getTime())) {
        errors.push(`Line ${data._lineNumber}: Invalid Admission Date format (use YYYY-MM-DD)`);
      }
    }
    
    if (!data['Parent/Guardian Name']?.trim()) {
      errors.push(`Line ${data._lineNumber}: Parent/Guardian Name is required`);
    }
    
    if (!data['Primary Contact']?.trim()) {
      errors.push(`Line ${data._lineNumber}: Primary Contact is required`);
    } else if (!/^[+]?[\d\s-()]{10,15}$/.test(data['Primary Contact'].trim())) {
      errors.push(`Line ${data._lineNumber}: Invalid Primary Contact format`);
    }
    
    if (data['Alternative Contact'] && !/^[+]?[\d\s-()]{10,15}$/.test(data['Alternative Contact'].trim())) {
      errors.push(`Line ${data._lineNumber}: Invalid Alternative Contact format`);
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const processFile = async () => {
    if (!file) return;

    setUploading(true);
    const result: BulkEnrollmentResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    try {
      const text = await file.text();
      const studentsData = parseCSV(text);
      
      if (studentsData.length === 0) {
        toast({
          title: "No Data Found",
          description: "The CSV file appears to be empty or invalid.",
          variant: "destructive"
        });
        return;
      }

      // Validate all records first
      const allErrors: string[] = [];
      studentsData.forEach(data => {
        const { errors } = validateStudentData(data);
        allErrors.push(...errors);
      });

      if (allErrors.length > 0) {
        result.errors = allErrors;
        result.failed = studentsData.length;
        
        toast({
          title: "Validation Errors",
          description: `Found ${allErrors.length} validation errors. Please check the console for details.`,
          variant: "destructive"
        });
        console.error("Validation errors:", allErrors);
        return;
      }

      // Process each student
      for (const data of studentsData) {
        try {
          const studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'> = {
            student_name: data['Student Name'].trim(),
            grade: data['Grade'].trim(),
            date_of_birth: data['Date of Birth'].trim(),
            parent_name: data['Parent/Guardian Name'].trim(),
            address: data['Home Address']?.trim() || undefined,
            primary_contact: data['Primary Contact'].trim(),
            alternative_contact: data['Alternative Contact']?.trim() || undefined,
            gender: data['Gender'] as 'Male' | 'Female',
            admission_date: data['Admission Date'].trim(),
            registration_number: "" // Will be auto-generated
          };

          await insertStudent(studentData);
          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Line ${data._lineNumber}: Failed to enroll ${data['Student Name']} - ${error}`);
        }
      }

      // Show results
      if (result.success > 0) {
        toast({
          title: "Bulk Enrollment Complete",
          description: `Successfully enrolled ${result.success} students${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        });
      }

      if (result.errors.length > 0) {
        console.error("Enrollment errors:", result.errors);
      }

    } catch (error) {
      console.error('Error processing CSV file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to process the CSV file. Please check the format and try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV file.",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Bulk Student Enrollment</h3>
        <p className="text-gray-600">Upload multiple students at once using a CSV file</p>
      </div>

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>How to Use Bulk Enrollment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Download the CSV template below</li>
            <li>Fill in the student information in the template</li>
            <li>Upload the completed CSV file</li>
            <li>Review and confirm the enrollment</li>
          </ol>
        </CardContent>
      </Card>

      {/* Download Template */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Download Template</CardTitle>
          <CardDescription>
            Download the CSV template with required columns and sample data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} className="w-full md:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Download CSV Template
          </Button>
        </CardContent>
      </Card>

      {/* Upload File */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Upload Completed File</CardTitle>
          <CardDescription>
            Select and upload your completed CSV file with student data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {file && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>
          )}

          <Button 
            onClick={processFile} 
            disabled={!file || uploading}
            className="w-full md:w-auto"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload and Enroll Students
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>CSV Requirements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-orange-700 space-y-2">
            <p className="font-medium">Required columns (in order):</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Student Name (required)</li>
              <li>Grade (required - e.g., "Grade 1", "Grade 2")</li>
              <li>Gender (required - "Male" or "Female")</li>
              <li>Date of Birth (required - YYYY-MM-DD format)</li>
              <li>Admission Date (required - YYYY-MM-DD format)</li>
              <li>Parent/Guardian Name (required)</li>
              <li>Primary Contact (required - phone number)</li>
              <li>Alternative Contact (optional - phone number)</li>
              <li>Home Address (optional)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkEnrollment;
