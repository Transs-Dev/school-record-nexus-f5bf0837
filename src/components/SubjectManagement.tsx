
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Upload } from "lucide-react";
import { fetchSubjects, addSubject, deleteSubject, type Subject } from "@/utils/subjectDatabase";
import BulkSubjectUpload from "./BulkSubjectUpload";

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [newSubject, setNewSubject] = useState({
    key: "",
    label: "",
    max_marks: 100,
    class_teacher: ""
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const subjectsData = await fetchSubjects();
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.key.trim() || !newSubject.label.trim()) {
      toast({
        title: "Error",
        description: "Subject key and label are required",
        variant: "destructive",
      });
      return;
    }

    try {
      await addSubject({
        key: newSubject.key.toLowerCase().replace(/\s+/g, '_'),
        label: newSubject.label,
        max_marks: newSubject.max_marks,
        class_teacher: newSubject.class_teacher || null
      });
      toast({
        title: "Success",
        description: "Subject added successfully",
      });
      setNewSubject({
        key: "",
        label: "",
        max_marks: 100,
        class_teacher: ""
      });
      loadSubjects();
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({
        title: "Error",
        description: "Failed to add subject to database",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await deleteSubject(id);
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
      loadSubjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <BookOpen className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Subject Management</h2>
      </div>

      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-6">
          {/* Add New Subject Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add New Subject</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject Key</Label>
                  <Input
                    value={newSubject.key}
                    onChange={(e) => setNewSubject({ ...newSubject, key: e.target.value })}
                    placeholder="e.g., mathematics"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject Label</Label>
                  <Input
                    value={newSubject.label}
                    onChange={(e) => setNewSubject({ ...newSubject, label: e.target.value })}
                    placeholder="e.g., Mathematics"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Marks</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newSubject.max_marks}
                    onChange={(e) => setNewSubject({ ...newSubject, max_marks: parseInt(e.target.value) || 100 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Class Teacher</Label>
                  <Input
                    value={newSubject.class_teacher}
                    onChange={(e) => setNewSubject({ ...newSubject, class_teacher: e.target.value })}
                    placeholder="Teacher name (optional)"
                  />
                </div>
              </div>

              <Button onClick={handleAddSubject} disabled={loading}>
                Add Subject
              </Button>
            </CardContent>
          </Card>

          {/* Subjects List */}
          <Card>
            <CardHeader>
              <CardTitle>All Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Key</TableHead>
                    <TableHead>Subject Label</TableHead>
                    <TableHead>Max Marks</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.key}</TableCell>
                      <TableCell>{subject.label}</TableCell>
                      <TableCell>{subject.max_marks}</TableCell>
                      <TableCell>{subject.class_teacher || "N/A"}</TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteSubject(subject.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {subjects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No subjects found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <BulkSubjectUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubjectManagement;
