
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Chair, Locker } from "lucide-react";
import { getStudentFurnitureBalance } from "@/utils/furnitureDatabase";

interface StudentFurnitureStatusProps {
  studentId: string;
  studentName: string;
}

const StudentFurnitureStatus = ({ studentId, studentName }: StudentFurnitureStatusProps) => {
  const [furnitureData, setFurnitureData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFurnitureData();
  }, [studentId]);

  const loadFurnitureData = async () => {
    try {
      setLoading(true);
      const data = await getStudentFurnitureBalance(studentId);
      setFurnitureData(data);
    } catch (error) {
      console.error('Error loading furniture data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Furniture Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!furnitureData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Furniture Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No furniture data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Current Furniture Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Chair className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Chairs</p>
                <p className="text-2xl font-bold text-blue-600">{furnitureData.chairs}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <Locker className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Lockers</p>
                <p className="text-2xl font-bold text-green-600">{furnitureData.lockers}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {furnitureData.transactions && furnitureData.transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Chairs</TableHead>
                    <TableHead>Lockers</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {furnitureData.transactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.tracking_number}
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentFurnitureStatus;
