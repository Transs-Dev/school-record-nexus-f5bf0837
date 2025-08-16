
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, FileText, BookOpen, Settings } from "lucide-react";
import BulkMarksEntry from "./BulkMarksEntry";
import ResultsSection from "./ResultsSection";
import GradeBookManagement from "./GradeBookManagement";
import GradeConfiguration from "./GradeConfiguration";
import { useAuth } from "@/hooks/useAuth";

const AcademicSection = () => {
  const [activeTab, setActiveTab] = useState("marks");
  const { hasRole, loading } = useAuth();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  const canAccessGradeConfig = hasRole('admin') || hasRole('teacher');

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Academic Management</h1>
          <p className="text-gray-600">Manage student marks, results, and grade configurations</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="marks" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Marks Entry
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="gradebook" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Grade Books
          </TabsTrigger>
          <TabsTrigger 
            value="gradeconfig" 
            className="flex items-center gap-2"
            disabled={!canAccessGradeConfig}
          >
            <Settings className="w-4 h-4" />
            Grade Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Marks Entry</CardTitle>
              <CardDescription>
                Upload and manage student examination marks efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkMarksEntry />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <ResultsSection />
        </TabsContent>

        <TabsContent value="gradebook" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grade Book Management</CardTitle>
              <CardDescription>
                Manage and distribute grade books to students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GradeBookManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gradeconfig" className="space-y-6">
          {canAccessGradeConfig ? (
            <GradeConfiguration />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
                  <p className="text-gray-600">You need admin or teacher privileges to access grade configuration.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AcademicSection;
