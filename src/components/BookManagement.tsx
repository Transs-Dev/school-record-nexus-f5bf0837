
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Search, Library, ArrowRightLeft, History } from "lucide-react";
import { getBookTransactions } from "@/utils/bookDatabase";
import BookStockManagement from "./BookStockManagement";
import BookDistribution from "./BookDistribution";
import BookReturn from "./BookReturn";

const BookManagement = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState("stock");
  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const transactionsData = await getBookTransactions();
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load book transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionComplete = () => {
    loadTransactions();
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.students?.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.students?.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.book_stock?.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.tracking_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <BookOpen className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Book Management</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 w-[600px]">
          <TabsTrigger value="stock" className="flex items-center space-x-2">
            <Library className="h-4 w-4" />
            <span>Stock</span>
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Distribution</span>
          </TabsTrigger>
          <TabsTrigger value="return" className="flex items-center space-x-2">
            <ArrowRightLeft className="h-4 w-4" />
            <span>Return</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BookStockManagement />
            
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {transactions.filter(t => t.transaction_type === 'distribution').length}
                    </div>
                    <p className="text-sm text-gray-600">Total Distributions</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {transactions.filter(t => t.transaction_type === 'return').length}
                    </div>
                    <p className="text-sm text-gray-600">Total Returns</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {transactions.reduce((sum, t) => sum + (t.quantity || 0), 0)}
                    </div>
                    <p className="text-sm text-gray-600">Total Books Moved</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {transactions.filter(t => t.compensation_fee && t.compensation_fee > 0).length}
                    </div>
                    <p className="text-sm text-gray-600">Damaged Returns</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution">
          <BookDistribution onTransactionComplete={handleTransactionComplete} />
        </TabsContent>

        <TabsContent value="return">
          <BookReturn onTransactionComplete={handleTransactionComplete} />
        </TabsContent>

        <TabsContent value="history">
          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Transaction History</span>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking Number</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Compensation</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-sm">
                          {transaction.tracking_number}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.students?.student_name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">
                              {transaction.students?.registration_number} • {transaction.students?.grade}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.book_stock?.book_title || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{transaction.book_stock?.author}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.transaction_type === 'distribution' ? 'default' : 'secondary'}>
                            {transaction.transaction_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {transaction.quantity || 1}
                        </TableCell>
                        <TableCell>
                          {transaction.condition && (
                            <Badge variant={transaction.condition === 'good' ? 'default' : transaction.condition === 'bad' ? 'destructive' : 'outline'}>
                              {transaction.condition}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {transaction.compensation_fee ? `$${transaction.compensation_fee}` : '-'}
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {transaction.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No transactions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookManagement;
