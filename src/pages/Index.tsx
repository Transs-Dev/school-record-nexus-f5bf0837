
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
  Play,
  Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
import Overview from "@/components/Overview";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showTour, setShowTour] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
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

  const tabs = [
    { value: "overview", label: "Overview", icon: TrendingUp },
    { value: "enrollment", label: "Enrollment", icon: UserPlus },
    { value: "records", label: "Records", icon: Users },
    { value: "academic", label: "Academic", icon: BookOpen },
    { value: "fees", label: "Fees", icon: DollarSign },
    { value: "results", label: "Results", icon: FileText },
    { value: "subjects", label: "Subjects", icon: BookOpen },
    { value: "system", label: "System", icon: RotateCcw },
  ];

  const TabsList = () => (
    <div className="grid grid-cols-3 lg:grid-cols-8 h-auto p-1">
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          variant={activeTab === tab.value ? "default" : "ghost"}
          onClick={() => {
            setActiveTab(tab.value);
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center space-x-2 p-3"
        >
          <tab.icon className="w-4 h-4" />
          <span className="hidden sm:inline">{tab.label}</span>
        </Button>
      ))}
    </div>
  );

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
              {/* Desktop Navigation */}
              <div className="hidden lg:block">
                <TabsList />
              </div>

              {/* Mobile Navigation */}
              <div className="lg:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Menu className="w-4 h-4 mr-2" />
                      Navigation Menu
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <div className="space-y-2 mt-6">
                      {tabs.map((tab) => (
                        <Button
                          key={tab.value}
                          variant={activeTab === tab.value ? "default" : "ghost"}
                          onClick={() => {
                            setActiveTab(tab.value);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full justify-start"
                        >
                          <tab.icon className="w-4 h-4 mr-2" />
                          {tab.label}
                        </Button>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <TabsContent value="overview" className="space-y-4">
                <Overview onTabChange={setActiveTab} />
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
          />
        )}
      </div>
    </div>
  );
};

export default Index;
