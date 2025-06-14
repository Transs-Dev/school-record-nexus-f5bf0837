
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Lock, AlertCircle } from "lucide-react";
import { fetchAllStudents, type Student } from "@/utils/studentDatabase";

interface StudentAuthProps {
  onAuthenticated: (student: Student) => void;
}

const StudentAuth = ({ onAuthenticated }: StudentAuthProps) => {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check if password is correct
      if (password !== "student") {
        setError("Invalid password");
        setLoading(false);
        return;
      }

      // Fetch all students and find the one with matching registration number
      const students = await fetchAllStudents();
      const student = students.find(
        s => s.registration_number.toLowerCase() === registrationNumber.toLowerCase()
      );

      if (!student) {
        setError("Student not found. Please check your registration number.");
        setLoading(false);
        return;
      }

      // Authentication successful
      onAuthenticated(student);
    } catch (error) {
      console.error("Authentication error:", error);
      setError("An error occurred during authentication. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <User className="w-6 h-6" />
            <span>Student Portal Login</span>
          </CardTitle>
          <CardDescription>
            Enter your registration number and password to access your portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="registration">Registration Number</Label>
              <Input
                id="registration"
                type="text"
                placeholder="Enter your registration number"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !registrationNumber || !password}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAuth;
