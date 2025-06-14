
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, TrendingUp, DollarSign, UserPlus, FileText } from "lucide-react";
import { getTotalStudentCount } from "@/utils/studentDatabase";

interface OverviewProps {
  onTabChange: (tab: string) => void;
}

const Overview = ({ onTabChange }: OverviewProps) => {
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentCount();
  }, []);

  const loadStudentCount = async () => {
    try {
      const count = await getTotalStudentCount();
      setTotalStudents(count);
    } catch (error) {
      console.error('Error loading student count:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "--" : totalStudents}
            </div>
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
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => onTabChange("enrollment")} 
              className="w-full justify-start"
              variant="outline"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Enroll New Student
            </Button>
            <Button 
              onClick={() => onTabChange("academic")} 
              className="w-full justify-start"
              variant="outline"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Enter Marks
            </Button>
            <Button 
              onClick={() => onTabChange("fees")} 
              className="w-full justify-start"
              variant="outline"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Record Fee Payment
            </Button>
            <Button 
              onClick={() => onTabChange("results")} 
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
    </div>
  );
};

export default Overview;
