
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Edit, Trash2, Save, Loader2, UserCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Subject {
  id: string;
  key: string;
  label: string;
  max_marks: number;
  class_teacher: string | null;
}

interface Class {
  id: string;
  class_name: string;
  class_teacher: string | null;
}

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [newSubject, setNewSubject] = useState({ key: "", label: "", max_marks: 100, class_teacher: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('label');

      if (subjectsError) throw subjectsError;

      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .order('class_name');

      if (classesError) throw classesError;

      setSubjects(subjectsData || []);
      setClasses(classesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load subjects and classes from database. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.key || !newSubject.label) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Check if subject key already exists
    if (subjects.some(subject => subject.key === newSubject.key)) {
      toast({
        title: "Duplicate Subject",
        description: "A subject with this key already exists.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('subjects')
        .insert([{
          key: newSubject.key.toLowerCase().replace(/\s+/g, '_'),
          label: newSubject.label,
          max_marks: newSubject.max_marks,
          class_teacher: newSubject.class_teacher || null
        }])
        .select()
        .single();

      if (error) throw error;

      setSubjects([...subjects, data]);
      setNewSubject({ key: "", label: "", max_marks: 100, class_teacher: "" });
      
      toast({
        title: "Subject Added",
        description: `${data.label} has been added successfully.`,
      });
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({
        title: "Error Adding Subject",
        description: "Failed to add subject to database. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingId(subject.id);
    setEditingSubject({ ...subject });
  };

  const handleSaveEdit = async () => {
    if (!editingSubject) return;

    try {
      setSubmitting(true);
      const { data, error } = await supabase
        .from('subjects')
        .update({
          key: editingSubject.key,
          label: editingSubject.label,
          max_marks: editingSubject.max_marks,
          class_teacher: editingSubject.class_teacher || null
        })
        .eq('id', editingId)
        .select()
        .single();

      if (error) throw error;

      const updatedSubjects = subjects.map(subject => 
        subject.id === editingId ? data : subject
      );
      
      setSubjects(updatedSubjects);
      setEditingId(null);
      setEditingSubject(null);
      
      toast({
        title: "Subject Updated",
        description: `${data.label} has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating subject:', error);
      toast({
        title: "Error Updating Subject",
        description: "Failed to update subject in database. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', subjectId);

      if (error) throw error;

      setSubjects(subjects.filter(s => s.id !== subjectId));
      
      toast({
        title: "Subject Deleted",
        description: `${subject.label} has been removed from the system.`,
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: "Error Deleting Subject",
        description: "Failed to delete subject from database. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingSubject(null);
  };

  const getTotalMaxMarks = () => {
    return subjects.reduce((total, subject) => total + subject.max_marks, 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Subject Management</h2>
          <p className="text-gray-600">Add, edit, and manage subjects for examination grading</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading subjects...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Subject Management</h2>
        <p className="text-gray-600">Add, edit, and manage subjects for examination grading</p>
      </div>

      {/* Add New Subject */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add New Subject</span>
          </CardTitle>
          <CardDescription>
            Create a new subject for examination grading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject-key">Subject Key</Label>
              <Input
                id="subject-key"
                placeholder="e.g., chemistry"
                value={newSubject.key}
                onChange={(e) => setNewSubject(prev => ({ ...prev, key: e.target.value }))}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject-label">Subject Name</Label>
              <Input
                id="subject-label"
                placeholder="e.g., Chemistry"
                value={newSubject.label}
                onChange={(e) => setNewSubject(prev => ({ ...prev, label: e.target.value }))}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-marks">Maximum Marks</Label>
              <Input
                id="max-marks"
                type="number"
                min="1"
                max="200"
                value={newSubject.max_marks}
                onChange={(e) => setNewSubject(prev => ({ ...prev, max_marks: parseInt(e.target.value) || 100 }))}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class-teacher">Class Teacher</Label>
              <Input
                id="class-teacher"
                placeholder="e.g., Mr. Smith"
                value={newSubject.class_teacher}
                onChange={(e) => setNewSubject(prev => ({ ...prev, class_teacher: e.target.value }))}
                disabled={submitting}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleAddSubject} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Current Subjects</span>
            </div>
            <Badge variant="secondary">
              Total Max: {getTotalMaxMarks()} marks
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage existing subjects, their maximum marks, and class teachers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Key</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead className="text-center">Maximum Marks</TableHead>
                  <TableHead>Class Teacher</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>
                      {editingId === subject.id ? (
                        <Input
                          value={editingSubject?.key || ""}
                          onChange={(e) => setEditingSubject(prev => prev ? { ...prev, key: e.target.value } : null)}
                          className="font-mono text-sm"
                          disabled={submitting}
                        />
                      ) : (
                        <span className="font-mono text-sm">{subject.key}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === subject.id ? (
                        <Input
                          value={editingSubject?.label || ""}
                          onChange={(e) => setEditingSubject(prev => prev ? { ...prev, label: e.target.value } : null)}
                          className="font-medium"
                          disabled={submitting}
                        />
                      ) : (
                        <span className="font-medium">{subject.label}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {editingId === subject.id ? (
                        <Input
                          type="number"
                          min="1"
                          max="200"
                          value={editingSubject?.max_marks || 100}
                          onChange={(e) => setEditingSubject(prev => prev ? { ...prev, max_marks: parseInt(e.target.value) || 100 } : null)}
                          className="w-20 mx-auto text-center"
                          disabled={submitting}
                        />
                      ) : (
                        <Badge variant="outline">{subject.max_marks}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === subject.id ? (
                        <Input
                          value={editingSubject?.class_teacher || ""}
                          onChange={(e) => setEditingSubject(prev => prev ? { ...prev, class_teacher: e.target.value } : null)}
                          placeholder="Enter teacher name"
                          disabled={submitting}
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          {subject.class_teacher ? (
                            <>
                              <UserCheck className="w-4 h-4 text-green-600" />
                              <span>{subject.class_teacher}</span>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">No teacher assigned</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {editingId === subject.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="h-8 w-8 p-0"
                              disabled={submitting}
                            >
                              {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                              className="h-8 w-8 p-0"
                              disabled={submitting}
                            >
                              <span className="sr-only">Cancel</span>
                              ×
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditSubject(subject)}
                              className="h-8 w-8 p-0"
                              disabled={submitting}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteSubject(subject.id)}
                              className="h-8 w-8 p-0"
                              disabled={submitting}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {subjects.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Subjects Found</h3>
              <p className="text-gray-600">Add your first subject to start managing examinations.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-800 mb-2">Important Note</h4>
        <p className="text-sm text-yellow-700">
          Changes to subjects will affect all examination records. The subjects are now persisted in the database 
          and will be automatically reflected in the marks entry section. Class teachers can be assigned to subjects 
          for better organization and accountability.
        </p>
      </div>
    </div>
  );
};

export default SubjectManagement;
