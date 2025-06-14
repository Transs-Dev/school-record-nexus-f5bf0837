import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Package, Users, ChevronRight, Plus, Search } from "lucide-react";
import { fetchAllStudents, Student } from "@/utils/studentDatabase";
import { 
  createFurnitureTransaction, 
  getFurnitureTransactions, 
  FurnitureTransaction,
  CreateFurnitureTransaction 
} from "@/utils/furnitureDatabase";

const FurnitureManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [transactionType, setTransactionType] = useState<'distribution' | 'return'>('distribution');
  const [chairQuantity, setChairQuantity] = useState<number>(0);
  const [lockerQuantity, setLockerQuantity] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, transactionsData] = await Promise.all([
        fetchAllStudents(),
        getFurnitureTransactions()
      ]);
      setStudents(studentsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load furniture data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!selectedStudent) {
      toast({
        title: "Error",
        description: "Please select a student",
        variant: "destructive",
      });
      return;
    }

    if (chairQuantity === 0 && lockerQuantity === 0) {
      toast({
        title: "Error",
        description: "Please specify at least one item quantity",
        variant: "destructive",
      });
      return;
    }

    try {
      const transaction: CreateFurnitureTransaction = {
        student_id: selectedStudent,
        transaction_type: transactionType,
        chair_quantity: chairQuantity,
        locker_quantity: lockerQuantity,
        notes: notes.trim() || undefined
      };

      await createFurnitureTransaction(transaction);
      
      toast({
        title: "Success",
        description: `Furniture ${transactionType} recorded successfully`,
      });

      // Reset form
      setSelectedStudent("");
      setChairQuantity(0);
      setLockerQuantity(0);
      setNotes("");
      
      // Reload data
      loadData();
    } catch (error) {
      console.error('Error creating furniture transaction:', error);
      toast({
        title: "Error",
        description: "Failed to record furniture transaction",
        variant: "destructive",
      });
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.students?.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.students?.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.tracking_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading furniture data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Package className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Furniture Management</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Record Transaction</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="student-select">Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.student_name} - {student.registration_number} ({student.grade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transaction-type">Transaction Type</Label>
              <Select value={transactionType} onValueChange={(value: 'distribution' | 'return') => setTransactionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distribution">Distribution</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chair-quantity">Chair Quantity</Label>
                <Input
                  id="chair-quantity"
                  type="number"
                  min="0"
                  value={chairQuantity}
                  onChange={(e) => setChairQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="locker-quantity">Locker Quantity</Label>
                <Input
                  id="locker-quantity"
                  type="number"
                  min="0"
                  value={lockerQuantity}
                  onChange={(e) => setLockerQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>

            <Button onClick={handleCreateTransaction} className="w-full">
              Record {transactionType === 'distribution' ? 'Distribution' : 'Return'}
            </Button>
          </CardContent>
        </Card>

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
                  {transactions.reduce((sum, t) => sum + (t.chair_quantity || 0), 0)}
                </div>
                <p className="text-sm text-gray-600">Total Chairs</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {transactions.reduce((sum, t) => sum + (t.locker_quantity || 0), 0)}
                </div>
                <p className="text-sm text-gray-600">Total Lockers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  <TableHead>Type</TableHead>
                  <TableHead>Chairs</TableHead>
                  <TableHead>Lockers</TableHead>
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
                      <Badge variant={transaction.transaction_type === 'distribution' ? 'default' : 'secondary'}>
                        {transaction.transaction_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.chair_quantity || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {transaction.locker_quantity || 0}
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
    </div>
  );
};

export default FurnitureManagement;
