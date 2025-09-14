import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Menu, GraduationCap, Users, BookOpen, DollarSign, Sofa, FlaskConical, Settings, Home, BarChart, ClipboardList, LogOut, TrendingUp } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import Performance from "@/components/Performance";
import StudentEnrollment from "@/components/StudentEnrollment";
import AcademicSection from "@/components/AcademicSection";
import FeeManagement from "@/components/FeeManagement";
import BookManagement from "@/components/BookManagement";
import FurnitureManagement from "@/components/FurnitureManagement";
import LaboratoryManagement from "@/components/LaboratoryManagement";
import SubjectManagement from "@/components/SubjectManagement";
import StudentRecords from "@/components/StudentRecords";
import SystemReset from "@/components/SystemReset";
import TourGuide from "@/components/TourGuide";
import { useIsMobile } from "@/hooks/use-mobile";
import Overview from "@/components/Overview";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const isMobile = useIsMobile();
  const { signOut, user } = useAuth();

  // Tab configuration for easier management
  const tabs = [
    { value: "overview", label: "Overview", icon: Home },
    { value: "dashboard", label: "Dashboard", icon: BarChart },
    { value: "performance", label: "Performance", icon: TrendingUp },
    { value: "enrollment", label: "Enrollment", icon: Users },
    { value: "records", label: "Records", icon: ClipboardList },
    { value: "academic", label: "Academic", icon: GraduationCap },
    { value: "fees", label: "Fees", icon: DollarSign },
    { value: "books", label: "Books", icon: BookOpen },
    { value: "furniture", label: "Furniture", icon: Sofa },
    { value: "laboratory", label: "Laboratory", icon: FlaskConical },
    { value: "subjects", label: "Subjects", icon: BookOpen },
    { value: "settings", label: "Settings", icon: Settings },
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setShowMobileMenu(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile Header */}
      {isMobile && (
        <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">School Management</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                      <span className="text-lg font-semibold">School Management</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">{user?.email}</div>
                  </div>
                  <div className="flex-1 py-4">
                    {tabs.map((tab) => {
                      const IconComponent = tab.icon;
                      return (
                        <button
                          key={tab.value}
                          onClick={() => handleTabChange(tab.value)}
                          className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-100 transition-colors ${
                            activeTab === tab.value 
                              ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" 
                              : "text-gray-700"
                          }`}
                        >
                          <IconComponent className="h-5 w-5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="p-4 border-t">
                    <Button 
                      variant="ghost" 
                      onClick={signOut}
                      className="w-full flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="flex h-screen">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          {/* Desktop Header with Navigation */}
          <div className="hidden lg:flex bg-white border-b px-6 py-4 items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">School Management System</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={signOut} className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
              
              <TabsList className="bg-gray-100 p-1 rounded-lg">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-700"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="hidden xl:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6">
            <TabsContent value="overview" className="mt-0">
              <Overview onTabChange={setActiveTab} />
            </TabsContent>
            
            <TabsContent value="dashboard" className="mt-0">
              <Dashboard onStartTour={() => setShowTour(true)} />
            </TabsContent>
            
            <TabsContent value="performance" className="mt-0">
              <Performance />
            </TabsContent>
            
            <TabsContent value="enrollment" className="mt-0">
              <StudentEnrollment />
            </TabsContent>
            
            <TabsContent value="records" className="mt-0">
              <StudentRecords />
            </TabsContent>
            
            <TabsContent value="academic" className="mt-0">
              <AcademicSection />
            </TabsContent>
            
            <TabsContent value="fees" className="mt-0">
              <FeeManagement />
            </TabsContent>
            
            <TabsContent value="books" className="mt-0">
              <BookManagement />
            </TabsContent>
            
            <TabsContent value="furniture" className="mt-0">
              <FurnitureManagement />
            </TabsContent>
            
            <TabsContent value="laboratory" className="mt-0">
              <LaboratoryManagement />
            </TabsContent>
            
            <TabsContent value="subjects" className="mt-0">
              <SubjectManagement />
            </TabsContent>
            
            <TabsContent value="settings" className="mt-0">
              <SystemReset />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {showTour && (
        <TourGuide 
          isOpen={showTour} 
          onClose={() => setShowTour(false)}
          currentTab={activeTab}
        />
      )}
    </div>
  );
};

export default Index;