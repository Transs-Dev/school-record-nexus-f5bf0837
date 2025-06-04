
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, GraduationCap, FileText, DollarSign, BookOpen, UserCheck, Loader, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import StudentEnrollment from "@/components/StudentEnrollment";
import StudentRecords from "@/components/StudentRecords";
import AcademicSection from "@/components/AcademicSection";
import StudentPortal from "@/components/StudentPortal";
import { getStudentStats } from "@/utils/studentDatabase";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [studentStats, setStudentStats] = useState({
    total: 0,
    maleCount: 0,
    femaleCount: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

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

  // Refresh stats when switching to dashboard tab
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
      color: "text-blue-600"
    },
    {
      title: "Active Teachers",
      value: "45",
      change: "+3 new hires",
      icon: GraduationCap,
      color: "text-green-600"
    },
    {
      title: "Fee Collection",
      value: "85%",
      change: "+5% from last term",
      icon: DollarSign,
      color: "text-yellow-600"
    },
    {
      title: "Academic Progress",
      value: "92%",
      change: "Above target",
      icon: BookOpen,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Back to Home</span>
              </Link>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">School Management System</h1>
                <p className="text-sm text-gray-600">Ronga Secondary School (RSS)</p>
              </div>
            </div>
            <Button variant="outline" className="flex items-center space-x-2 transform hover:scale-105 transition-all duration-300">
              <UserCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5 bg-white/80 backdrop-blur-sm shadow-lg">
            <TabsTrigger value="dashboard" className="transition-all duration-300 hover:scale-105">Dashboard</TabsTrigger>
            <TabsTrigger value="enrollment" className="transition-all duration-300 hover:scale-105">Enrollment</TabsTrigger>
            <TabsTrigger value="records" className="transition-all duration-300 hover:scale-105">Records</TabsTrigger>
            <TabsTrigger value="academic" className="transition-all duration-300 hover:scale-105">Academic</TabsTrigger>
            <TabsTrigger value="student-portal" className="transition-all duration-300 hover:scale-105">Student Portal</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
              <p className="text-gray-600">Welcome to your school management dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-white/80 backdrop-blur-sm group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    {isLoadingStats && index === 0 ? (
                      <Loader className="w-5 h-5 animate-spin text-blue-600" />
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
            <Card className="p-6 transform hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm animate-fade-in">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for school administration
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setActiveTab("enrollment")}
                    className="h-20 flex flex-col items-center justify-center space-y-2 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                  >
                    <Users className="w-6 h-6" />
                    <span>New Student</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("academic")}
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                  >
                    <FileText className="w-6 h-6" />
                    <span>Enter Marks</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("records")}
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
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
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
