
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, GraduationCap } from "lucide-react";
import { formatCurrency } from "@/utils/feeDatabase";

interface StudentResult {
  id: string;
  student_name: string;
  registration_number: string;
  mathematics: number;
  english: number;
  kiswahili: number;
  science: number;
  social_studies: number;
  ire_cre: number;
  total: number;
  position: number;
  remarks: string;
}

interface PrintableResultsProps {
  grade: string;
  term: string;
  academicYear: string;
  results: StudentResult[];
}

const PrintableResults = ({ grade, term, academicYear, results }: PrintableResultsProps) => {
  // Sort results by position (ascending)
  const sortedResults = [...results].sort((a, b) => a.position - b.position);

  const handlePrint = () => {
    window.print();
  };

  const getGradeColor = (total: number) => {
    if (total >= 500) return "text-green-600 bg-green-50";
    if (total >= 400) return "text-blue-600 bg-blue-50";
    if (total >= 300) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-pink-300 text-pink-600 hover:bg-pink-50 hover-lift"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Results
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader className="no-print">
          <DialogTitle>Printable Results - {grade}</DialogTitle>
          <DialogDescription>
            {term} {academicYear} Academic Results
          </DialogDescription>
        </DialogHeader>

        <div className="print-content">
          {/* Header for Print */}
          <div className="text-center mb-8 border-b pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mr-4">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">School Management System</h1>
                <p className="text-lg text-pink-600">Academic Excellence Report</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><strong>Grade:</strong> {grade}</div>
              <div><strong>Term:</strong> {term}</div>
              <div><strong>Academic Year:</strong> {academicYear}</div>
            </div>
          </div>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Academic Results</span>
                <Badge variant="secondary">{sortedResults.length} Students</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Pos.</TableHead>
                    <TableHead>Reg. No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-center">Math</TableHead>
                    <TableHead className="text-center">Eng</TableHead>
                    <TableHead className="text-center">Kis</TableHead>
                    <TableHead className="text-center">Sci</TableHead>
                    <TableHead className="text-center">SS</TableHead>
                    <TableHead className="text-center">IRE/CRE</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedResults.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-bold text-center">
                        <Badge variant="outline" className="font-bold">
                          #{student.position}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {student.registration_number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.student_name}
                      </TableCell>
                      <TableCell className="text-center">{student.mathematics}</TableCell>
                      <TableCell className="text-center">{student.english}</TableCell>
                      <TableCell className="text-center">{student.kiswahili}</TableCell>
                      <TableCell className="text-center">{student.science}</TableCell>
                      <TableCell className="text-center">{student.social_studies}</TableCell>
                      <TableCell className="text-center">{student.ire_cre}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getGradeColor(student.total)}>
                          {student.total}/600
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{student.remarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Footer for Print */}
          <div className="mt-8 pt-4 border-t text-center text-sm text-gray-600">
            <p>Generated on {new Date().toLocaleDateString('en-GB')} | School Management System</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 no-print mt-6">
          <Button onClick={handlePrint} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
            <Printer className="w-4 h-4 mr-2" />
            Print Results
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintableResults;
