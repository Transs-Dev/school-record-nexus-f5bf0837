
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Clock, CheckCircle, XCircle, Receipt } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  fetchAllStudents,
  fetchFeeConfigurations,
  submitFeePayment,
  fetchFeePayments,
  fetchStudentFeeRecords,
  type Student
} from "@/utils/studentDatabase";
import {
  type FeeConfiguration,
  type FeePayment,
  type StudentFeeRecord
} from "@/utils/feeDatabase";

const StudentFeeSubmission = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [feeConfigs, setFeeConfigs] = useState<FeeConfiguration[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentPayments, setStudentPayments] = useState<FeePayment[]>([]);
  const [studentFeeRecords, setStudentFeeRecords] = useState<StudentFeeRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    term: "Term 1",
    academic_year: new Date().getFullYear().toString(),
    amount: "",
    payment_mode: "Mobile Money" as "Cash" | "Mobile Money" | "Bank",
    transaction_code: ""
  });

  const terms = ["Term 1", "Term 2", "Term 3"];
  const paymentModes = ["Cash", "Mobile Money", "Bank"];

  useEffect(() => {
    loadStudents();
    loadFeeConfigurations();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentData();
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    try {
      const studentsData = await fetchAllStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  const loadFeeConfigurations = async () => {
    try {
      const configsData = await fetchFeeConfigurations();
      setFeeConfigs(configsData);
    } catch (error) {
      console.error("Error loading fee configurations:", error);
    }
  };

  const loadStudentData = async () => {
    if (!selectedStudent?.id) return;

    try {
      const [paymentsData, feeRecordsData] = await Promise.all([
        fetchFeePayments({ studentId: selectedStudent.id }),
        fetchStudentFeeRecords(selectedStudent.id)
      ]);

      setStudentPayments(paymentsData);
      setStudentFeeRecords(feeRecordsData);
    } catch (error) {
      console.error("Error loading student data:", error);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent?.id || !paymentForm.amount) return;

    setLoading(true);
    try {
      const paymentData = {
        student_id: selectedStudent.id,
        term: paymentForm.term,
        academic_year: paymentForm.academic_year,
        amount: parseFloat(paymentForm.amount),
        payment_mode: paymentForm.payment_mode,
        transaction_code: paymentForm.transaction_code || undefined,
        verification_status: 'Pending' as const
      };

      await submitFeePayment(paymentData);

      toast({
        title: "Payment Submitted Successfully!",
        description: "Your payment has been submitted for verification.",
      });

      // Reset form
      setPaymentForm({
        term: "Term 1",
        academic_year: new Date().getFullYear().toString(),
        amount: "",
        payment_mode: "Mobile Money",
        transaction_code: ""
      });

      // Reload student data
      loadStudentData();

    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your payment. Please try again.",
        variant: "destructive"
      });
      console.error("Error submitting payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case 'Rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getCurrentFeeAmount = () => {
    const config = feeConfigs.find(
      c => c.term === paymentForm.term && c.academic_year === paymentForm.academic_year
    );
    return config?.amount || 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Fee Submission</h2>
        <p className="text-gray-600">Submit and track fee payments for students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Submit Fee Payment</span>
            </CardTitle>
            <CardDescription>
              Submit a new fee payment for verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Select Student *</Label>
                <Select 
                  value={selectedStudent?.id || ""} 
                  onValueChange={(value) => {
                    const student = students.find(s => s.id === value);
                    setSelectedStudent(student || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id!}>
                        {student.student_name} ({student.registration_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStudent && (
                <>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Student Information</p>
                    <p className="text-sm">{selectedStudent.student_name}</p>
                    <p className="text-sm text-gray-600">Grade: {selectedStudent.grade}</p>
                    <p className="text-sm text-gray-600">Registration: {selectedStudent.registration_number}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="term">Term *</Label>
                      <Select value={paymentForm.term} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, term: value }))}>
                        <SelectTrigger>
                          <SelectValue />
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

                    <div className="space-y-2">
                      <Label htmlFor="academic_year">Academic Year *</Label>
                      <Select value={paymentForm.academic_year} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, academic_year: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2024, 2025, 2026].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {getCurrentFeeAmount() > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Required Fee Amount</p>
                      <p className="text-lg font-bold text-green-700">
                        KES {getCurrentFeeAmount().toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="amount">Payment Amount (KES) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount paid"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_mode">Payment Mode *</Label>
                    <Select value={paymentForm.payment_mode} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, payment_mode: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentModes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transaction_code">Transaction Code</Label>
                    <Input
                      id="transaction_code"
                      placeholder="Enter transaction/reference code"
                      value={paymentForm.transaction_code}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, transaction_code: e.target.value }))}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Receipt className="w-4 h-4 mr-2" />
                        Submit Payment
                      </>
                    )}
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Student Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              {selectedStudent ? `Payment history for ${selectedStudent.student_name}` : "Select a student to view payment history"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStudent ? (
              <div className="space-y-4">
                {/* Fee Summary */}
                {studentFeeRecords.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Fee Summary</h4>
                    {studentFeeRecords.map((record: any) => (
                      <div key={`${record.term}-${record.academic_year}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{record.term} {record.academic_year}</p>
                          <p className="text-sm text-gray-600">
                            {record.payment_percentage?.toFixed(1)}% paid
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-600">
                            KES {record.paid_amount?.toLocaleString() || 0}
                          </p>
                          <p className="text-sm text-gray-600">
                            / {record.required_amount?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Payment History Table */}
                <div>
                  <h4 className="font-medium mb-2">Recent Payments</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Term</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.term}</TableCell>
                          <TableCell>KES {payment.amount.toLocaleString()}</TableCell>
                          <TableCell>{payment.payment_mode}</TableCell>
                          <TableCell>{getStatusBadge(payment.verification_status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {studentPayments.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-600">No payment history found</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
                <p className="text-gray-600">Choose a student from the dropdown to view their payment history and submit new payments.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentFeeSubmission;
