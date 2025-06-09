
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Users, GraduationCap, FileText, DollarSign, BookOpen, UserCheck, Loader, Menu, X, HelpCircle } from "lucide-react";
import StudentEnrollment from "@/components/StudentEnrollment";
import StudentRecords from "@/components/StudentRecords";
import AcademicSection from "@/components/AcademicSection";
import StudentPortal from "@/components/StudentPortal";
import FeeManagement from "@/components/FeeManagement";
import TourGuide from "@/components/TourGuide";
import { getStudentStats } from "@/utils/studentDatabase";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [studentStats, setStudentStats] = useState({
    total: 0,
    maleCount: 0,
    femaleCount: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    loadStudentStats();
  }, []);

  const loadStudentStats = async () => {
    try {
      setIsLoadingStats(true);
      const stats = await getStudentStats();
      setStudentStats(stats);
    } catch (error) {
      console.error('Error loading student stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === "dashboard") {
      loadStudentStats();
    }
  }, [activeTab]);

  const stats = [
    {
      title: "Total Students",
      value: isLoadingStats ? "..." : studentStats.total.toString(),
      change: `${studentStats.maleCount} Male, ${studentStats.femaleCount} Female`,
      icon: Users,
      color: "text-pink-600"
    }
  ];

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: GraduationCap, description: "Overview of school statistics" },
    { id: "enrollment", label: "Enrollment", icon: Users, description: "Manage student enrollment" },
    { id: "records", label: "Records", icon: FileText, description: "View and manage student records" },
    { id: "academic", label: "Academic", icon: BookOpen, description: "Academic performance and results" },
    { id: "student-portal", label: "Student Portal", icon: UserCheck, description: "Student access portal" },
    { id: "fees", label: "Fee Management", icon: DollarSign, description: "Manage school fees and payments" },
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white/90 backdrop-blur-md shadow-sm border-b border-pink-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center hover-lift">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">School Management</h1>
              <p className="text-xs text-pink-600">Education Excellence</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTour(true)}
              className="hover:bg-pink-100"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-pink-100">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 bg-gradient-to-b from-pink-50 to-white">
                <div className="p-6 border-b border-pink-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">School Management</h2>
                      <p className="text-sm text-pink-600">Education Excellence</p>
                    </div>
                  </div>
                </div>
                
                <nav className="p-4 space-y-2">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      className={`w-full justify-start p-4 h-auto hover-lift ${
                        activeTab === item.id 
                          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg" 
                          : "hover:bg-pink-100"
                      }`}
                      onClick={() => handleTabChange(item.id)}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs opacity-70">{item.description}</div>
                      </div>
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-white/90 backdrop-blur-md shadow-sm border-b border-pink-200">
        <div className="container-responsive">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center hover-lift animate-pulse-pink">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="heading-responsive font-bold text-gray-900">School Management System</h1>
                <p className="text-sm text-pink-600">Excellence in Education</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setShowTour(true)}
                className="border-pink-300 text-pink-600 hover:bg-pink-50 hover-lift"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                <span>Take Tour</span>
              </Button>
              <Button variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50 hover-lift">
                <UserCheck className="w-4 h-4 mr-2" />
                <span>Admin Portal</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-responsive py-4 lg:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Navigation */}
          <TabsList className="hidden lg:grid grid-cols-6 bg-white/80 backdrop-blur-sm shadow-lg border border-pink-200 rounded-2xl p-2">
            {navigationItems.map((item) => (
              <TabsTrigger 
                key={item.id}
                value={item.id} 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white transition-all duration-300 hover-lift rounded-xl"
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            <div className="text-center lg:text-left">
              <h2 className="heading-responsive font-bold text-gray-900 mb-2">Dashboard Overview</h2>
              <p className="text-responsive text-gray-600">Welcome to your school management dashboard</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {stats.map((stat, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-xl transition-all duration-300 hover-lift border-0 bg-white/80 backdrop-blur-sm group animate-fade-in border border-pink-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    {isLoadingStats && index === 0 ? (
                      <Loader className="w-5 h-5 animate-spin text-pink-600" />
                    ) : (
                      <stat.icon className={`w-5 h-5 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 hover-lift border-0 bg-white/80 backdrop-blur-sm animate-fade-in border border-pink-200">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="heading-responsive">Quick Actions</CardTitle>
                <CardDescription className="text-responsive">
                  Common tasks for school administration
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setActiveTab("enrollment")}
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover-lift bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  >
                    <Users className="w-6 h-6" />
                    <span>New Student</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("academic")}
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover-lift border-pink-300 text-pink-600 hover:bg-pink-50"
                  >
                    <FileText className="w-6 h-6" />
                    <span>Enter Marks</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("records")}
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover-lift border-pink-300 text-pink-600 hover:bg-pink-50"
                  >
                    <BookOpen className="w-6 h-6" />
                    <span>View Records</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enrollment" className="animate-fade-in">
            <StudentEnrollment />
          </TabsContent>

          <TabsContent value="records" className="animate-fade-in">
            <StudentRecords />
          </TabsContent>

          <TabsContent value="academic" className="animate-fade-in">
            <AcademicSection />
          </TabsContent>

          <TabsContent value="student-portal" className="animate-fade-in">
            <StudentPortal />
          </TabsContent>

          <TabsContent value="fees" className="animate-fade-in">
            <FeeManagement />
          </TabsContent>
        </Tabs>
      </main>

      {/* Tour Guide Component */}
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
