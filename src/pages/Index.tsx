
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, GraduationCap, FileText, DollarSign, BookOpen, UserCheck } from "lucide-react";
import StudentEnrollment from "@/components/StudentEnrollment";
import StudentRecords from "@/components/StudentRecords";
import AcademicSection from "@/components/AcademicSection";
import StudentPortal from "@/components/StudentPortal";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const stats = [
    {
      title: "Total Students",
      value: "1,234",
      change: "+12 this month",
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
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">School Management System</h1>
                <p className="text-sm text-gray-600">Ronga Secondary School (RSS)</p>
              </div>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="student-portal">Student Portal</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
              <p className="text-gray-600">Welcome to your school management dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
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
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <Users className="w-6 h-6" />
                    <span>New Student</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("academic")}
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <FileText className="w-6 h-6" />
                    <span>Enter Marks</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("records")}
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                  >
                    <BookOpen className="w-6 h-6" />
                    <span>View Records</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enrollment">
            <StudentEnrollment />
          </TabsContent>

          <TabsContent value="records">
            <StudentRecords />
          </TabsContent>

          <TabsContent value="academic">
            <AcademicSection />
          </TabsContent>

          <TabsContent value="student-portal">
            <StudentPortal />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
