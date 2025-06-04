
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Save, User, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { insertStudent, type Student } from "@/utils/studentDatabase";

const StudentEnrollment = () => {
  const [studentName, setStudentName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [parentName, setParentName] = useState("");
  const [address, setAddress] = useState("");
  const [primaryContact, setPrimaryContact] = useState("");
  const [alternativeContact, setAlternativeContact] = useState("");
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentName || !selectedClass || !dateOfBirth || !parentName || !primaryContact || !gender) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const studentData: Student = {
        student_name: studentName,
        grade: selectedClass,
        date_of_birth: format(dateOfBirth, "yyyy-MM-dd"),
        parent_name: parentName,
        address: address || null,
        primary_contact: primaryContact,
        alternative_contact: alternativeContact || null,
        gender: gender
      };

      const result = await insertStudent(studentData);

      toast({
        title: "Student Enrolled Successfully!",
        description: `Registration Number: ${result.registration_number}`,
      });

      // Reset form
      setStudentName("");
      setSelectedClass("");
      setDateOfBirth(undefined);
      setParentName("");
      setAddress("");
      setPrimaryContact("");
      setAlternativeContact("");
      setGender('Male');
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description: "There was an error enrolling the student. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Enrollment</h2>
        <p className="text-gray-600">Register new students to the school system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Student Information</span>
              </CardTitle>
              <CardDescription>
                Enter the student's personal and academic details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-name">Student Name *</Label>
                    <Input
                      id="student-name"
                      placeholder="Enter full name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Class *</Label>
                    <Select value={selectedClass} onValueChange={setSelectedClass} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateOfBirth && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateOfBirth ? format(dateOfBirth, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateOfBirth}
                          onSelect={setDateOfBirth}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={gender} onValueChange={(value: 'Male' | 'Female') => setGender(value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-800">
                      <Users className="w-5 h-5" />
                      <span>Parent/Guardian Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="parent-name">Parent/Guardian Name *</Label>
                      <Input
                        id="parent-name"
                        placeholder="Enter parent/guardian name"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="Enter home address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primary-contact">Primary Contact *</Label>
                        <Input
                          id="primary-contact"
                          type="tel"
                          placeholder="Enter phone number"
                          value={primaryContact}
                          onChange={(e) => setPrimaryContact(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alternative-contact">Alternative Contact</Label>
                        <Input
                          id="alternative-contact"
                          type="tel"
                          placeholder="Enter alternative number"
                          value={alternativeContact}
                          onChange={(e) => setAlternativeContact(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Enrolling..." : "Enroll Student"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Card */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Enrollment Preview</CardTitle>
              <CardDescription>Review student information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentName && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="font-medium">Student Name</p>
                  <p className="text-sm">{studentName}</p>
                </div>
              )}
              
              {selectedClass && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="font-medium">Grade</p>
                  <p className="text-sm">{selectedClass}</p>
                </div>
              )}

              {gender && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="font-medium">Gender</p>
                  <p className="text-sm">{gender}</p>
                </div>
              )}
              
              {parentName && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="font-medium">Parent/Guardian</p>
                  <p className="text-sm">{parentName}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentEnrollment;
