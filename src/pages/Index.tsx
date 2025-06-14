
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Dashboard from "@/components/Dashboard";
import StudentEnrollment from "@/components/StudentEnrollment";
import StudentRecords from "@/components/StudentRecords";
import AcademicSection from "@/components/AcademicSection";
import FeeManagement from "@/components/FeeManagement";
import StudentPortal from "@/components/StudentPortal";
import FurnitureManagement from "@/components/FurnitureManagement";
import TourGuide from "@/components/TourGuide";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showTourGuide, setShowTourGuide] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { value: "dashboard", label: "Dashboard" },
    { value: "enrollment", label: "Enrollment" },
    { value: "records", label: "Records" },
    { value: "academic", label: "Academic" },
    { value: "fees", label: "Fees" },
    { value: "furniture", label: "Furniture" },
    { value: "portal", label: "Student Portal" },
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              School Management
            </h1>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {tabs.map((tab) => (
                    <Button
                      key={tab.value}
                      variant={activeTab === tab.value ? "default" : "ghost"}
                      className={`w-full justify-start text-left ${
                        activeTab === tab.value 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "hover:bg-blue-50"
                      }`}
                      onClick={() => handleTabChange(tab.value)}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop Navigation */}
          <div className="hidden lg:block bg-white border-b shadow-sm">
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between py-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  School Management System
                </h1>
                <TabsList className="bg-gray-100 p-1 rounded-lg">
                  {tabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.value}
                      value={tab.value} 
                      onClick={() => setActiveTab(tab.value)}
                      className="px-6 py-2 rounded-md font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 lg:px-6 py-6">
            <TabsContent value="dashboard" className="mt-0">
              <Dashboard onStartTour={() => setShowTourGuide(true)} />
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
            <TabsContent value="furniture" className="mt-0">
              <FurnitureManagement />
            </TabsContent>
            <TabsContent value="portal" className="mt-0">
              <StudentPortal />
            </TabsContent>
          </div>
        </Tabs>

        <TourGuide 
          isOpen={showTourGuide} 
          onClose={() => setShowTourGuide(false)}
          currentTab={activeTab}
        />
      </div>
    </div>
  );
};

export default Index;
