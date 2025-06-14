
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, DollarSign, TrendingUp, Award, Calendar } from "lucide-react";
import { getTotalStudentCount, getStudentCountByGrade } from "@/utils/studentDatabase";

interface DashboardProps {
  onStartTour: () => void;
}

const Dashboard = ({ onStartTour }: DashboardProps) => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [gradeStats, setGradeStats] = useState<Record<string, number>>({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const total = await getTotalStudentCount();
      const grades = await getStudentCountByGrade();
      setTotalStudents(total);
      setGradeStats(grades);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const statsCards = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Active Grades",
      value: Object.keys(gradeStats).length,
      icon: BookOpen,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Academic Year",
      value: new Date().getFullYear(),
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "System Status",
      value: "Active",
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Welcome to the School Management System</p>
        </div>
        <Button 
          onClick={onStartTour} 
          variant="outline" 
          className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
        >
          <Award className="w-4 h-4 mr-2" />
          Take Tour
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.textColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(gradeStats).length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Students by Grade</CardTitle>
            <CardDescription className="text-gray-600">Distribution of students across different grades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(gradeStats).map(([grade, count]) => (
                <div key={grade} className="text-center p-6 border border-gray-100 rounded-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow duration-200">
                  <div className="font-semibold text-gray-700 mb-2">{grade}</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
