import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GradeConfig {
  id: string;
  grade_letter: string;
  min_marks: number;
  max_marks: number;
  points: number;
  remarks: string;
  is_active: boolean;
}

const GradeConfiguration = () => {
  const [gradeConfigs, setGradeConfigs] = useState<GradeConfig[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newGrade, setNewGrade] = useState({
    grade_letter: '',
    min_marks: 0,
    max_marks: 0,
    points: 0,
    remarks: ''
  });
  const [editGrade, setEditGrade] = useState<Partial<GradeConfig>>({});
  const { toast } = useToast();
  const { hasRole, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      fetchGradeConfigs();
    }
  }, [authLoading]);

  const fetchGradeConfigs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('grade_configurations')
        .select('*')
        .order('min_marks', { ascending: false });

      if (error) throw error;
      setGradeConfigs(data || []);
    } catch (error) {
      console.error('Error fetching grade configurations:', error);
      toast({
        title: "Error",
        description: "Failed to load grade configurations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newGrade.grade_letter || newGrade.min_marks < 0 || newGrade.max_marks <= newGrade.min_marks) {
      toast({
        title: "Error",
        description: "Please fill all fields correctly. Max marks must be greater than min marks.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('grade_configurations')
        .insert([newGrade]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Grade configuration added successfully",
      });

      setNewGrade({ grade_letter: '', min_marks: 0, max_marks: 0, points: 0, remarks: '' });
      setIsAdding(false);
      fetchGradeConfigs();
    } catch (error) {
      console.error('Error adding grade configuration:', error);
      toast({
        title: "Error",
        description: "Failed to add grade configuration",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (id: string) => {
    if (!editGrade.grade_letter || editGrade.min_marks! < 0 || editGrade.max_marks! <= editGrade.min_marks!) {
      toast({
        title: "Error",
        description: "Please fill all fields correctly. Max marks must be greater than min marks.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('grade_configurations')
        .update(editGrade)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Grade configuration updated successfully",
      });

      setEditingId(null);
      setEditGrade({});
      fetchGradeConfigs();
    } catch (error) {
      console.error('Error updating grade configuration:', error);
      toast({
        title: "Error",
        description: "Failed to update grade configuration",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('grade_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Grade configuration deleted successfully",
      });

      fetchGradeConfigs();
    } catch (error) {
      console.error('Error deleting grade configuration:', error);
      toast({
        title: "Error",
        description: "Failed to delete grade configuration",
        variant: "destructive",
      });
    }
  };

  const startEdit = (config: GradeConfig) => {
    setEditingId(config.id);
    setEditGrade(config);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditGrade({});
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewGrade({ grade_letter: '', min_marks: 0, max_marks: 0, points: 0, remarks: '' });
  };

  if (authLoading || loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!hasRole('admin') && !hasRole('teacher')) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</div>
            <p className="text-gray-600">You need admin or teacher privileges to manage grade configurations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Grade Configuration</span>
          <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
            <Plus className="w-4 h-4 mr-2" />
            Add Grade
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                <TableHead>Min Marks</TableHead>
                <TableHead>Max Marks</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && (
                <TableRow>
                  <TableCell>
                    <Input
                      value={newGrade.grade_letter}
                      onChange={(e) => setNewGrade({ ...newGrade, grade_letter: e.target.value })}
                      placeholder="e.g., A"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newGrade.min_marks}
                      onChange={(e) => setNewGrade({ ...newGrade, min_marks: parseInt(e.target.value) || 0 })}
                      placeholder="80"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newGrade.max_marks}
                      onChange={(e) => setNewGrade({ ...newGrade, max_marks: parseInt(e.target.value) || 0 })}
                      placeholder="100"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newGrade.points}
                      onChange={(e) => setNewGrade({ ...newGrade, points: parseInt(e.target.value) || 0 })}
                      placeholder="12"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={newGrade.remarks}
                      onChange={(e) => setNewGrade({ ...newGrade, remarks: e.target.value })}
                      placeholder="Excellent"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleAdd}>
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelAdd}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {gradeConfigs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell>
                    {editingId === config.id ? (
                      <Input
                        value={editGrade.grade_letter || ''}
                        onChange={(e) => setEditGrade({ ...editGrade, grade_letter: e.target.value })}
                      />
                    ) : (
                      config.grade_letter
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === config.id ? (
                      <Input
                        type="number"
                        value={editGrade.min_marks || 0}
                        onChange={(e) => setEditGrade({ ...editGrade, min_marks: parseInt(e.target.value) || 0 })}
                      />
                    ) : (
                      config.min_marks
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === config.id ? (
                      <Input
                        type="number"
                        value={editGrade.max_marks || 0}
                        onChange={(e) => setEditGrade({ ...editGrade, max_marks: parseInt(e.target.value) || 0 })}
                      />
                    ) : (
                      config.max_marks
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === config.id ? (
                      <Input
                        type="number"
                        value={editGrade.points || 0}
                        onChange={(e) => setEditGrade({ ...editGrade, points: parseInt(e.target.value) || 0 })}
                      />
                    ) : (
                      config.points
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === config.id ? (
                      <Input
                        value={editGrade.remarks || ''}
                        onChange={(e) => setEditGrade({ ...editGrade, remarks: e.target.value })}
                      />
                    ) : (
                      config.remarks
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === config.id ? (
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleEdit(config.id)}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(config)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(config.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeConfiguration;
