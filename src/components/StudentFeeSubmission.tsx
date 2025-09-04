
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Clock, CheckCircle, XCircle, Receipt, Search, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { fetchAllStudents, type Student } from "@/utils/studentDatabase";
import {
  type FeeConfiguration,
  type FeePayment,
  type StudentFeeRecord,
  fetchFeeConfigurations,
  submitFeePayment,
  fetchStudentFeeRecords
} from "@/utils/feeDatabase";

const StudentFeeSubmission = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [feeConfigs, setFeeConfigs] = useState<FeeConfiguration[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentFeeRecord, setStudentFeeRecord] = useState<StudentFeeRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [paymentForm, setPaymentForm] = useState({
    term: "Term 1",
    academic_year: new Date().getFullYear().toString(),
    amount: "",
    payment_mode: "Cash",
    transaction_code: ""
  });

  const terms = ["Term 1", "Term 2", "Term 3"];
  const paymentModes = ["Cash", "Mobile Money", "Bank"];
  
  // Generate dynamic academic years (current year - 2 to current year + 3)
  const currentYear = new Date().getFullYear();
  const academicYears = Array.from(
    { length: 6 }, 
    (_, i) => currentYear - 2 + i
  );

  useEffect(() => {
    loadStudents();
    loadFeeConfigurations();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery]);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentFeeRecord();
      updatePaymentAmount();
    }
  }, [selectedStudent, paymentForm.term, paymentForm.academic_year]);

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

  const loadStudentFeeRecord = async () => {
    if (!selectedStudent?.id) return;

    try {
      const feeRecordsData = await fetchStudentFeeRecords(
        selectedStudent.id,
        paymentForm.term,
        paymentForm.academic_year
      );
      
      if (feeRecordsData.length > 0) {
        setStudentFeeRecord(feeRecordsData[0]);
      } else {
        setStudentFeeRecord(null);
      }
    } catch (error) {
      console.error("Error loading student fee record:", error);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.student_name.toLowerCase().includes(query) ||
        student.registration_number.toLowerCase().includes(query)
      );
    }
    
    // Sort by grade
    filtered.sort((a, b) => {
      const gradeA = a.grade.toLowerCase();
      const gradeB = b.grade.toLowerCase();
      return gradeA.localeCompare(gradeB);
    });
    
    setFilteredStudents(filtered);
  };

  const updatePaymentAmount = () => {
    const config = feeConfigs.find(
      c => c.term === paymentForm.term && c.academic_year === paymentForm.academic_year
    );
    
    if (config && studentFeeRecord) {
      const balance = studentFeeRecord.required_amount - studentFeeRecord.paid_amount;
      setPaymentForm(prev => ({ ...prev, amount: Math.max(0, balance).toString() }));
    } else if (config) {
      setPaymentForm(prev => ({ ...prev, amount: config.amount.toString() }));
    }
  };

  const getCurrentFeeAmount = () => {
    const config = feeConfigs.find(
      c => c.term === paymentForm.term && c.academic_year === paymentForm.academic_year
    );
    return config?.amount || 0;
  };

  const getBalance = () => {
    if (studentFeeRecord) {
      return Math.max(0, studentFeeRecord.required_amount - studentFeeRecord.paid_amount);
    }
    return getCurrentFeeAmount();
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent?.id || !paymentForm.amount) {
      toast({
        title: "Missing Information",
        description: "Please select a student and enter a payment amount",
        variant: "destructive"
      });
      return;
    }

    const paymentAmount = parseFloat(paymentForm.amount);
    if (paymentAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        student_id: selectedStudent.id,
        term: paymentForm.term,
        academic_year: paymentForm.academic_year,
        amount: paymentAmount,
        payment_mode: paymentForm.payment_mode as 'Cash' | 'Mobile Money' | 'Bank',
        verification_status: 'Verified' as const,
        transaction_code: paymentForm.transaction_code || undefined
      };

      console.log("Submitting payment:", paymentData);
      const result = await submitFeePayment(paymentData);
      console.log("Payment submitted successfully:", result);

      toast({
        title: "Payment Submitted Successfully!",
        description: `Payment of KES ${paymentAmount.toLocaleString()} has been recorded for ${selectedStudent.student_name}.`,
      });

      // Reset form and reload data
      setPaymentForm({
        term: "Term 1",
        academic_year: new Date().getFullYear().toString(),
        amount: "",
        payment_mode: "Cash",
        transaction_code: ""
      });
      setSelectedStudent(null);
      setStudentFeeRecord(null);

      // Reload the student fee records to reflect the new payment
      await loadStudents();

    } catch (error) {
      console.error("Error submitting payment:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting the payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Submit Fee Payment</h2>
        <p className="text-gray-600">Submit a new fee payment for verification</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Select Student</span>
            </CardTitle>
            <CardDescription>
              Search and select a student to submit payment for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search Students</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by name or registration number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Student List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">No students found</p>
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedStudent?.id === student.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{student.student_name}</p>
                          <p className="text-sm text-gray-600">{student.registration_number}</p>
                        </div>
                        <Badge variant="outline">{student.grade}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Payment Details</span>
            </CardTitle>
            <CardDescription>
              {selectedStudent ? `Submit payment for ${selectedStudent.student_name}` : "Select a student to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStudent ? (
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                {/* Student Information */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Student Information</p>
                  <p className="text-sm font-medium">{selectedStudent.student_name}</p>
                  <p className="text-sm text-gray-600">Grade: {selectedStudent.grade}</p>
                  <p className="text-sm text-gray-600">Registration: {selectedStudent.registration_number}</p>
                  <p className="text-sm text-gray-600">Parent: {selectedStudent.parent_name}</p>
                  <p className="text-sm text-gray-600">Contact: {selectedStudent.primary_contact}</p>
                </div>

                {/* Term Selection */}
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
                        {academicYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="space-y-2">
                  <Label htmlFor="payment_mode">Payment Mode *</Label>
                  <Select value={paymentForm.payment_mode} onValueChange={(value) => setPaymentForm(prev => ({ ...prev, payment_mode: value }))}>
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

                {/* Transaction Code (Optional for Mobile Money and Bank) */}
                {(paymentForm.payment_mode === "Mobile Money" || paymentForm.payment_mode === "Bank") && (
                  <div className="space-y-2">
                    <Label htmlFor="transaction_code">
                      Transaction Code {paymentForm.payment_mode === "Mobile Money" ? "(M-Pesa Code)" : "(Bank Reference)"}
                    </Label>
                    <Input
                      id="transaction_code"
                      type="text"
                      placeholder={`Enter ${paymentForm.payment_mode === "Mobile Money" ? "M-Pesa confirmation code" : "bank reference number"}`}
                      value={paymentForm.transaction_code}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, transaction_code: e.target.value }))}
                    />
                  </div>
                )}

                {/* Fee Information */}
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Fee Information</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Required Amount:</span>
                      <span className="font-medium">KES {getCurrentFeeAmount().toLocaleString()}</span>
                    </div>
                    {studentFeeRecord && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Already Paid:</span>
                        <span className="font-medium">KES {studentFeeRecord.paid_amount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t pt-2 mt-2">
                      <span className="text-sm font-medium">Balance:</span>
                      <span className="font-bold text-green-700">KES {getBalance().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount (KES) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount to pay"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    required
                    min="0"
                    max={getBalance()}
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500">
                    Maximum payable amount: KES {getBalance().toLocaleString()}
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading || !paymentForm.amount}>
                  {loading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4 mr-2" />
                      Submit Payment
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
                <p className="text-gray-600">Choose a student from the list to submit a payment.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentFeeSubmission;

