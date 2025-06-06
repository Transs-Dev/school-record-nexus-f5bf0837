
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Search, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  type FeePayment,
  fetchFeePayments,
  verifyFeePayment
} from "@/utils/feeDatabase";

const FeeVerification = () => {
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    verificationStatus: "all",
    term: "all",
    academicYear: new Date().getFullYear().toString(),
    searchQuery: ""
  });

  const terms = ["Term 1", "Term 2", "Term 3"];
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Pending", label: "Pending" },
    { value: "Verified", label: "Verified" },
    { value: "Rejected", label: "Rejected" }
  ];

  useEffect(() => {
    loadPayments();
  }, [filters]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const filterParams: any = {};
      
      if (filters.verificationStatus !== "all") {
        filterParams.verificationStatus = filters.verificationStatus;
      }
      if (filters.term !== "all") {
        filterParams.term = filters.term;
      }
      if (filters.academicYear !== "all") {
        filterParams.academicYear = filters.academicYear;
      }

      const paymentsData = await fetchFeePayments(filterParams);
      
      // Filter by search query if provided
      let filteredPayments = paymentsData;
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        filteredPayments = paymentsData.filter(payment =>
          payment.students?.student_name.toLowerCase().includes(query) ||
          payment.students?.registration_number.toLowerCase().includes(query) ||
          payment.transaction_code?.toLowerCase().includes(query)
        );
      }
      
      setPayments(filteredPayments);
    } catch (error) {
      console.error("Error loading payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string, status: 'Verified' | 'Rejected') => {
    try {
      await verifyFeePayment(paymentId, status, 'bursar'); // You can replace 'bursar' with actual user ID
      
      toast({
        title: "Payment Updated",
        description: `Payment has been ${status.toLowerCase()}`,
      });
      
      loadPayments(); // Reload the list
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      });
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Fee Payment Verification</h2>
        <p className="text-gray-600">Review and verify student fee payments</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter Payments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Student name, reg number, or transaction code"
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.verificationStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, verificationStatus: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
              <Select value={filters.term} onValueChange={(value) => setFilters(prev => ({ ...prev, term: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terms</SelectItem>
                  {terms.map((term) => (
                    <SelectItem key={term} value={term}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Select value={filters.academicYear} onValueChange={(value) => setFilters(prev => ({ ...prev, academicYear: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {[2024, 2025, 2026].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>
            {payments.length} payment{payments.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Found</h3>
              <p className="text-gray-600">No payments match your current filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Transaction Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.students?.student_name}</p>
                        <p className="text-sm text-gray-600">{payment.students?.registration_number}</p>
                        <p className="text-sm text-gray-600">{payment.students?.grade}</p>
                      </div>
                    </TableCell>
                    <TableCell>{payment.term} {payment.academic_year}</TableCell>
                    <TableCell>KES {payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{payment.payment_mode}</TableCell>
                    <TableCell>{payment.transaction_code || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(payment.verification_status)}</TableCell>
                    <TableCell>
                      {new Date(payment.created_at!).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {payment.verification_status === 'Pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleVerifyPayment(payment.id!, 'Verified')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleVerifyPayment(payment.id!, 'Rejected')}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {payment.verification_status !== 'Pending' && (
                        <span className="text-sm text-gray-500">
                          {payment.verification_status === 'Verified' ? 'Verified' : 'Rejected'}
                          {payment.verified_at && (
                            <><br />{new Date(payment.verified_at).toLocaleDateString()}</>
                          )}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeeVerification;
