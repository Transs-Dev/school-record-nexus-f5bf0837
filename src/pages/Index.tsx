import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  UserPlus, 
  FileText,
  RotateCcw,
  Key,
  Play
} from "lucide-react";
import StudentEnrollment from "@/components/StudentEnrollment";
import StudentRecords from "@/components/StudentRecords";
import AcademicSection from "@/components/AcademicSection";
import FeeManagement from "@/components/FeeManagement";
import SubjectManagement from "@/components/SubjectManagement";
import SystemReset from "@/components/SystemReset";
import ResultsSection from "@/components/ResultsSection";
import PinProtection from "@/components/PinProtection";
import ChangePinDialog from "@/components/ChangePinDialog";
import TourGuide from "@/components/TourGuide";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Show tour on page load/refresh
    const hasSeenTour = sessionStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setShowTour(true);
      sessionStorage.setItem('hasSeenTour', 'true');
    }
  }, []);

  const protectedSections = ["enrollment", "records", "academic", "fees"];

  const renderTabContent = (tabValue: string, content: React.ReactNode, sectionName: string) => {
    if (protectedSections.includes(tabValue)) {
      return (
        <PinProtection sectionName={sectionName}>
          {content}
        </PinProtection>
      );
    }
    return content;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-lg shadow-sm p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              School Management System
            </h1>
            <p className="text-gray-600">
              Manage students, academics, fees, and generate reports efficiently
            </p>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTour(true)}
              className="flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Start Tour</span>
            </Button>
            <ChangePinDialog />
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              Access all school management features from this central hub
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-3 lg:grid-cols-8 h-auto p-1">
                <TabsTrigger value="overview" className="flex items-center space-x-2 p-3">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="enrollment" className="flex items-center space-x-2 p-3">
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Enrollment</span>
                </TabsTrigger>
                <TabsTrigger value="records" className="flex items-center space-x-2 p-3">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Records</span>
                </TabsTrigger>
                <TabsTrigger value="academic" className="flex items-center space-x-2 p-3">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Academic</span>
                </TabsTrigger>
                <TabsTrigger value="fees" className="flex items-center space-x-2 p-3">
                  <DollarSign className="w-4 h-4" />
                  <span className="hidden sm:inline">Fees</span>
                </TabsTrigger>
                <TabsTrigger value="results" className="flex items-center space-x-2 p-3">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Results</span>
                </TabsTrigger>
                <TabsTrigger value="subjects" className="flex items-center space-x-2 p-3">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Subjects</span>
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center space-x-2 p-3">
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">System</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-muted-foreground">
                        Enrolled students
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Grades</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">9</div>
                      <p className="text-xs text-muted-foreground">
                        Grade 1 to Grade 9
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Fee Collection</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">--</div>
                      <p className="text-xs text-muted-foreground">
                        This academic year
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Current Term</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">Term 1</div>
                      <p className="text-xs text-muted-foreground">
                        Academic Year 2025
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        onClick={() => setActiveTab("enrollment")} 
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Enroll New Student
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("academic")} 
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Enter Marks
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("fees")} 
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Record Fee Payment
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("results")} 
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Status</CardTitle>
                      <CardDescription>Current system information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Database</span>
                        <span className="text-sm font-medium text-green-600">Connected</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Security</span>
                        <span className="text-sm font-medium text-green-600">PIN Protected</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Subjects</span>
                        <span className="text-sm font-medium text-blue-600">Database Synced</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Currency</span>
                        <span className="text-sm font-medium text-blue-600">Zambian Kwacha (ZMW)</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="enrollment" className="space-y-4">
                {renderTabContent("enrollment", <StudentEnrollment />, "Student Enrollment")}
              </TabsContent>

              <TabsContent value="records" className="space-y-4">
                {renderTabContent("records", <StudentRecords />, "Student Records")}
              </TabsContent>

              <TabsContent value="academic" className="space-y-4">
                {renderTabContent("academic", <AcademicSection />, "Academic Management")}
              </TabsContent>

              <TabsContent value="fees" className="space-y-4">
                {renderTabContent("fees", <FeeManagement />, "Fee Management")}
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                <ResultsSection />
              </TabsContent>

              <TabsContent value="subjects" className="space-y-4">
                <SubjectManagement />
              </TabsContent>

              <TabsContent value="system" className="space-y-4">
                <SystemReset />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Tour Guide */}
        {showTour && (
          <TourGuide 
            isOpen={showTour} 
            onClose={() => setShowTour(false)}
            currentTab={activeTab}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
