
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Save, Calculator } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AcademicSection = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [studentMarks, setStudentMarks] = useState<Record<string, any>>({});

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  const terms = ["Term 1", "Term 2", "Term 3"];

  const subjects = [
    "Mathematics",
    "English",
    "Kiswahili",
    "Science",
    "Social Studies",
    "IRE/CRE"
  ];

  // Mock students for selected grade
  const getStudentsForGrade = (grade: string) => {
    if (!grade) return [];
    
    return [
      { registrationNumber: "RSS/00001/25", name: "John Kamau" },
      { registrationNumber: "RSS/00002/25", name: "Sarah Wanjiku" },
      { registrationNumber: "RSS/00003/25", name: "David Mwangi" },
      { registrationNumber: "RSS/00004/25", name: "Faith Akinyi" },
      { registrationNumber: "RSS/00005/25", name: "Michael Ochieng" }
    ].filter((_, index) => grade.includes((index % 3 + 7).toString())); // Mock filtering
  };

  const students = getStudentsForGrade(selectedGrade);

  const updateMark = (regNumber: string, subject: string, mark: string) => {
    const numericMark = parseInt(mark) || 0;
    
    setStudentMarks(prev => ({
      ...prev,
      [regNumber]: {
        ...prev[regNumber],
        [subject]: numericMark
      }
    }));
  };

  const updateRemarks = (regNumber: string, remarks: string) => {
    setStudentMarks(prev => ({
      ...prev,
      [regNumber]: {
        ...prev[regNumber],
        remarks
      }
    }));
  };

  const calculateTotal = (regNumber: string) => {
    const marks = studentMarks[regNumber] || {};
    return subjects.reduce((total, subject) => total + (marks[subject] || 0), 0);
  };

  const calculatePosition = (regNumber: string) => {
    const totals = students.map(student => ({
      regNumber: student.registrationNumber,
      total: calculateTotal(student.registrationNumber)
    })).sort((a, b) => b.total - a.total);

    const position = totals.findIndex(t => t.regNumber === regNumber) + 1;
    return position;
  };

  const generateRemarks = (total: number) => {
    if (total >= 500) return "Excellent performance";
    if (total >= 400) return "Good performance";
    if (total >= 300) return "Average performance";
    if (total >= 200) return "Below average";
    return "Needs improvement";
  };

  const handleSave = () => {
    if (!selectedGrade || !selectedTerm) {
      toast({
        title: "Missing Selection",
        description: "Please select both grade and term before saving.",
        variant: "destructive"
      });
      return;
    }

    // Here you would save to database
    toast({
      title: "Marks Saved Successfully!",
      description: `Results for ${selectedGrade} - ${selectedTerm} have been saved.`,
    });

    console.log("Saving marks:", {
      grade: selectedGrade,
      term: selectedTerm,
      marks: studentMarks
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Academic Section</h2>
        <p className="text-gray-600">Enter and manage examination results</p>
      </div>

      {/* Selection Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Class & Term Selection</span>
          </CardTitle>
          <CardDescription>
            Select the grade and term to enter examination marks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade-select">Grade</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger id="grade-select">
                  <SelectValue placeholder="Select Grade" />
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
              <Label htmlFor="term-select">Term</Label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger id="term-select">
                  <SelectValue placeholder="Select Term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marks Entry Table */}
      {selectedGrade && selectedTerm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Marks Entry - {selectedGrade} ({selectedTerm})</span>
              <Badge variant="secondary">{students.length} Students</Badge>
            </CardTitle>
            <CardDescription>
              Enter marks for each subject (Maximum: 100 marks per subject)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Reg. Number</TableHead>
                    <TableHead className="min-w-[150px]">Student Name</TableHead>
                    {subjects.map((subject) => (
                      <TableHead key={subject} className="min-w-[100px] text-center">
                        {subject}
                      </TableHead>
                    ))}
                    <TableHead className="min-w-[80px] text-center">Total</TableHead>
                    <TableHead className="min-w-[80px] text-center">Position</TableHead>
                    <TableHead className="min-w-[200px]">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const total = calculateTotal(student.registrationNumber);
                    const position = calculatePosition(student.registrationNumber);
                    
                    return (
                      <TableRow key={student.registrationNumber}>
                        <TableCell className="font-mono text-sm">
                          {student.registrationNumber}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        {subjects.map((subject) => (
                          <TableCell key={subject}>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={studentMarks[student.registrationNumber]?.[subject] || ""}
                              onChange={(e) => updateMark(student.registrationNumber, subject, e.target.value)}
                              className="w-20 text-center"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-semibold">
                          <Badge variant={total >= 400 ? "default" : total >= 300 ? "secondary" : "destructive"}>
                            {total}/600
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {total > 0 && (
                            <Badge variant="outline">
                              #{position}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Textarea
                            placeholder={total > 0 ? generateRemarks(total) : "Enter remarks"}
                            value={studentMarks[student.registrationNumber]?.remarks || ""}
                            onChange={(e) => updateRemarks(student.registrationNumber, e.target.value)}
                            className="min-w-[200px] h-8 resize-none"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calculator className="w-4 h-4" />
                <span>Total marks calculated automatically (out of 600)</span>
              </div>
              <Button onClick={handleSave} size="lg">
                <Save className="w-4 h-4 mr-2" />
                Save All Marks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedGrade && !selectedTerm && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Grade and Term</h3>
            <p className="text-gray-600 text-center">
              Choose a grade and term to start entering examination marks
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AcademicSection;
