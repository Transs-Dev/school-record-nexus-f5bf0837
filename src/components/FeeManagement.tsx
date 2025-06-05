
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Settings, FileText, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  fetchFeeConfigurations,
  saveFeeConfiguration,
  fetchFeePayments,
  verifyFeePayment,
  getFeeAnalytics,
  type FeeConfiguration,
  type FeePayment
} from "@/utils/feeDatabase";

const FeeManagement = () => {
  const [feeConfigs, setFeeConfigs] = useState<FeeConfiguration[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const [configForm, setConfigForm] = useState({
    term: "Term 1",
    academic_year: selectedYear,
    amount: ""
  });

  const terms = ["Term 1", "Term 2", "Term 3"];

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [configsData, paymentsData, analyticsData] = await Promise.all([
        fetchFeeConfigurations(),
        fetchFeePayments({ academicYear: selectedYear }),
        getFeeAnalytics(selectedYear)
      ]);

      setFeeConfigs(configsData);
      setPayments(paymentsData);
      setAnalytics(analyticsData);
    } catch (error) {
      toast({
        title: "Error Loading Data",
        description: "Failed to load fee management data.",
        variant: "destructive"
      });
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeeConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configForm.amount) return;

    try {
      await saveFeeConfiguration({
        term: configForm.term,
        academic_year: configForm.academic_year,
        amount: parseFloat(configForm.amount)
      });

      toast({
        title: "Fee Configuration Saved",
        description: `${configForm.term} fee set to KES ${parseFloat(configForm.amount).toLocaleString()}`,
      });

      setConfigForm({
        term: "Term 1",
        academic_year: selectedYear,
        amount: ""
      });

      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save fee configuration.",
        variant: "destructive"
      });
    }
  };

  const handleVerifyPayment = async (paymentId: string, status: 'Verified' | 'Rejected') => {
    try {
      await verifyFeePayment(paymentId, status, 'admin'); // In a real app, this would be the logged-in user ID
      
      toast({
        title: `Payment ${status}`,
        description: `The payment has been ${status.toLowerCase()}.`,
      });

      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status.toLowerCase()} payment.`,
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
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Fee Management System</h2>
          <p className="text-gray-600">Manage school fees, payments, and financial records</p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
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

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
              <DollarSign className="w-4 h-4 ml-auto text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                KES {analytics.totalCollected.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <Clock className="w-4 h-4 ml-auto text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                KES {analytics.pendingAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Payments</CardTitle>
              <CheckCircle className="w-4 h-4 ml-auto text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.verifiedPayments}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <TrendingUp className="w-4 h-4 ml-auto text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {analytics.pendingPayments}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Payment Verification</span>
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Fee Configuration</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Verification</CardTitle>
              <CardDescription>
                Review and verify student fee payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Mode</TableHead>
                      <TableHead>Transaction Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.students?.student_name || 'N/A'}
                        </TableCell>
                        <TableCell>{payment.students?.registration_number || 'N/A'}</TableCell>
                        <TableCell>{payment.term}</TableCell>
                        <TableCell>KES {payment.amount.toLocaleString()}</TableCell>
                        <TableCell>{payment.payment_mode}</TableCell>
                        <TableCell>{payment.transaction_code || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(payment.verification_status)}</TableCell>
                        <TableCell>
                          {payment.verification_status === 'Pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleVerifyPayment(payment.id, 'Verified')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleVerifyPayment(payment.id, 'Rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {payments.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Found</h3>
                    <p className="text-gray-600">No fee payments found for the selected year.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Set Fee Configuration</CardTitle>
                <CardDescription>
                  Configure fee amounts for each term
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveFeeConfig} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="term">Term</Label>
                    <Select value={configForm.term} onValueChange={(value) => setConfigForm(prev => ({ ...prev, term: value }))}>
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
                    <Label htmlFor="academic_year">Academic Year</Label>
                    <Select value={configForm.academic_year} onValueChange={(value) => setConfigForm(prev => ({ ...prev, academic_year: value }))}>
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

                  <div className="space-y-2">
                    <Label htmlFor="amount">Fee Amount (KES)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter fee amount"
                      value={configForm.amount}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, amount: e.target.value }))}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Save Configuration
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Fee Structure</CardTitle>
                <CardDescription>
                  Current fee configurations for {selectedYear}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feeConfigs
                    .filter(config => config.academic_year === selectedYear)
                    .map((config) => (
                      <div key={`${config.term}-${config.academic_year}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{config.term}</p>
                          <p className="text-sm text-gray-600">{config.academic_year}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">KES {config.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}

                  {feeConfigs.filter(config => config.academic_year === selectedYear).length === 0 && (
                    <div className="text-center py-8">
                      <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Configuration Found</h3>
                      <p className="text-gray-600">Set up fee configurations for {selectedYear}.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Fee Collection Analytics</CardTitle>
              <CardDescription>
                Financial overview for {selectedYear}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(analytics.termBreakdown).map(([term, amount]) => (
                      <div key={term} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">{term}</p>
                        <p className="text-2xl font-bold text-blue-700">
                          KES {(amount as number).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Payment Summary</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Payments:</span>
                          <span className="font-medium">{analytics.totalPayments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Verified Payments:</span>
                          <span className="font-medium text-green-600">{analytics.verifiedPayments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending Payments:</span>
                          <span className="font-medium text-orange-600">{analytics.pendingPayments}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Collection Overview</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total Collected:</span>
                          <span className="font-medium text-green-600">KES {analytics.totalCollected.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pending Amount:</span>
                          <span className="font-medium text-orange-600">KES {analytics.pendingAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeeManagement;
