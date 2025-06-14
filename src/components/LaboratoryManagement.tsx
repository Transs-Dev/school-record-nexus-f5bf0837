
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Beaker, AlertTriangle, DollarSign, FileText } from "lucide-react";
import { 
  getLaboratoryStock, 
  addLaboratoryStock, 
  updateLaboratoryStock, 
  deleteLaboratoryStock,
  createLaboratoryClearance,
  getLaboratoryClearances,
  processPayment,
  LaboratoryStock,
  LaboratoryClearance
} from "@/utils/laboratoryDatabase";
import { getStudents } from "@/utils/studentDatabase";

const LaboratoryManagement = () => {
  const [tools, setTools] = useState<LaboratoryStock[]>([]);
  const [clearances, setClearances] = useState<LaboratoryClearance[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Tool management states
  const [newTool, setNewTool] = useState({
    tool_name: "",
    category: "",
    total_quantity: 0,
    available_quantity: 0,
    unit_cost: 0
  });

  // Clearance creation states
  const [newClearance, setNewClearance] = useState({
    student_id: "",
    tool_id: "",
    damage_type: "",
    quantity: 1,
    compensation_fee: 0,
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [toolsData, clearancesData, studentsData] = await Promise.all([
        getLaboratoryStock(),
        getLaboratoryClearances(),
        getStudents()
      ]);
      setTools(toolsData);
      setClearances(clearancesData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading laboratory data:', error);
      toast({
        title: "Error",
        description: "Failed to load laboratory data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatKenyanShillings = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleAddTool = async () => {
    if (!newTool.tool_name.trim()) {
      toast({
        title: "Error",
        description: "Tool name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await addLaboratoryStock(newTool);
      toast({
        title: "Success",
        description: "Tool added successfully",
      });
      setNewTool({
        tool_name: "",
        category: "",
        total_quantity: 0,
        available_quantity: 0,
        unit_cost: 0
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tool",
        variant: "destructive",
      });
    }
  };

  const handleCreateClearance = async () => {
    if (!newClearance.student_id || !newClearance.tool_id || !newClearance.damage_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createLaboratoryClearance(newClearance);
      toast({
        title: "Success",
        description: "Laboratory clearance record created successfully",
      });
      setNewClearance({
        student_id: "",
        tool_id: "",
        damage_type: "",
        quantity: 1,
        compensation_fee: 0,
        notes: ""
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create clearance record",
        variant: "destructive",
      });
    }
  };

  const handleProcessPayment = async (clearanceId: string) => {
    try {
      await processPayment(clearanceId, {
        payment_mode: "cash",
        payment_date: new Date().toISOString().split('T')[0]
      });
      toast({
        title: "Success",
        description: "Payment processed and receipt generated",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-orange-600">Pending</Badge>;
      case 'waived':
        return <Badge className="bg-blue-100 text-blue-800">Waived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Beaker className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Laboratory Management</h2>
      </div>

      <Tabs defaultValue="stock" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock">Tool Inventory</TabsTrigger>
          <TabsTrigger value="clearances">Clearances</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Tool</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tool Name</Label>
                  <Input
                    value={newTool.tool_name}
                    onChange={(e) => setNewTool({ ...newTool, tool_name: e.target.value })}
                    placeholder="Enter tool name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newTool.category} onValueChange={(value) => setNewTool({ ...newTool, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Biology Equipment">Biology Equipment</SelectItem>
                      <SelectItem value="Chemistry Equipment">Chemistry Equipment</SelectItem>
                      <SelectItem value="Physics Equipment">Physics Equipment</SelectItem>
                      <SelectItem value="Glassware">Glassware</SelectItem>
                      <SelectItem value="Measuring Instruments">Measuring Instruments</SelectItem>
                      <SelectItem value="Safety Equipment">Safety Equipment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Total Quantity</Label>
                  <Input
                    type="number"
                    value={newTool.total_quantity}
                    onChange={(e) => setNewTool({ ...newTool, total_quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Available Quantity</Label>
                  <Input
                    type="number"
                    value={newTool.available_quantity}
                    onChange={(e) => setNewTool({ ...newTool, available_quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Cost (KES)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTool.unit_cost}
                    onChange={(e) => setNewTool({ ...newTool, unit_cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <Button onClick={handleAddTool} disabled={loading}>
                Add Tool
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Laboratory Tools Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tools.map((tool) => (
                    <TableRow key={tool.id}>
                      <TableCell className="font-medium">{tool.tool_name}</TableCell>
                      <TableCell>{tool.category}</TableCell>
                      <TableCell>{tool.available_quantity}</TableCell>
                      <TableCell>{tool.total_quantity}</TableCell>
                      <TableCell>{formatKenyanShillings(tool.unit_cost || 0)}</TableCell>
                      <TableCell>
                        {tool.available_quantity === 0 ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : tool.available_quantity < tool.total_quantity * 0.2 ? (
                          <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clearances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Create Clearance Record</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student</Label>
                  <Select value={newClearance.student_id} onValueChange={(value) => setNewClearance({ ...newClearance, student_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.student_name} - {student.registration_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tool</Label>
                  <Select value={newClearance.tool_id} onValueChange={(value) => setNewClearance({ ...newClearance, tool_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tool" />
                    </SelectTrigger>
                    <SelectContent>
                      {tools.map((tool) => (
                        <SelectItem key={tool.id} value={tool.id}>
                          {tool.tool_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Damage Type</Label>
                  <Select value={newClearance.damage_type} onValueChange={(value) => setNewClearance({ ...newClearance, damage_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select damage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="broken">Broken</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newClearance.quantity}
                    onChange={(e) => setNewClearance({ ...newClearance, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Compensation Fee (KES)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newClearance.compensation_fee}
                    onChange={(e) => setNewClearance({ ...newClearance, compensation_fee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={newClearance.notes}
                  onChange={(e) => setNewClearance({ ...newClearance, notes: e.target.value })}
                  placeholder="Additional notes about the damage..."
                />
              </div>

              <Button onClick={handleCreateClearance} disabled={loading}>
                Create Clearance Record
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Laboratory Clearances</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Tool</TableHead>
                    <TableHead>Damage Type</TableHead>
                    <TableHead>Compensation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clearances.map((clearance) => (
                    <TableRow key={clearance.id}>
                      <TableCell className="font-mono">{clearance.tracking_number}</TableCell>
                      <TableCell>{clearance.students?.student_name}</TableCell>
                      <TableCell>{clearance.laboratory_stock?.tool_name}</TableCell>
                      <TableCell className="capitalize">{clearance.damage_type}</TableCell>
                      <TableCell>{formatKenyanShillings(clearance.compensation_fee)}</TableCell>
                      <TableCell>{getStatusBadge(clearance.payment_status)}</TableCell>
                      <TableCell>
                        {clearance.payment_status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleProcessPayment(clearance.id)}
                            className="flex items-center space-x-1"
                          >
                            <DollarSign className="h-4 w-4" />
                            <span>Process Payment</span>
                          </Button>
                        )}
                        {clearance.receipt_number && (
                          <Badge variant="outline" className="ml-2">
                            Receipt: {clearance.receipt_number}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Laboratory Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">Total Tools</h3>
                  <p className="text-2xl font-bold text-blue-600">{tools.length}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">Pending Clearances</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {clearances.filter(c => c.payment_status === 'pending').length}
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">Total Compensation</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatKenyanShillings(clearances.reduce((total, c) => total + c.compensation_fee, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LaboratoryManagement;
