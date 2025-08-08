import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Save, Loader2, Users } from "lucide-react";
import { insertStudent, type Student } from "@/utils/studentDatabase";
import { toast } from "@/hooks/use-toast";
import BulkEnrollment from "./BulkEnrollment";

const StudentEnrollment = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_name: "",
    grade: "",
    date_of_birth: "",
    parent_name: "",
    address: "",
    primary_contact: "",
    alternative_contact: "",
    gender: "" as 'Male' | 'Female' | "",
    admission_date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const grades = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    if (!formData.student_name.trim()) {
      newErrors.student_name = "Student name is required";
    } else if (formData.student_name.trim().length < 2) {
      newErrors.student_name = "Student name must be at least 2 characters";
    }

    if (!formData.grade) {
      newErrors.grade = "Grade selection is required";
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Date of birth is required";
    } else {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (birthDate > today) {
        newErrors.date_of_birth = "Date of birth cannot be in the future";
      } else if (age > 25) {
        newErrors.date_of_birth = "Student seems too old for primary education";
      } else if (age < 3) {
        newErrors.date_of_birth = "Student seems too young for enrollment";
      }
    }

    if (!formData.parent_name.trim()) {
      newErrors.parent_name = "Parent/Guardian name is required";
    } else if (formData.parent_name.trim().length < 2) {
      newErrors.parent_name = "Parent/Guardian name must be at least 2 characters";
    }

    if (!formData.primary_contact.trim()) {
      newErrors.primary_contact = "Primary contact is required";
    } else if (!/^[+]?[\d\s-()]{10,15}$/.test(formData.primary_contact.trim())) {
      newErrors.primary_contact = "Please enter a valid phone number";
    }

    if (formData.alternative_contact && !/^[+]?[\d\s-()]{10,15}$/.test(formData.alternative_contact.trim())) {
      newErrors.alternative_contact = "Please enter a valid alternative phone number";
    }

    if (!formData.gender) {
      newErrors.gender = "Gender selection is required";
    }

    if (!formData.admission_date) {
      newErrors.admission_date = "Admission date is required";
    } else {
      const admissionDate = new Date(formData.admission_date);
      const today = new Date();
      
      if (admissionDate > today) {
        newErrors.admission_date = "Admission date cannot be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form before submitting.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'> = {
        student_name: formData.student_name.trim(),
        grade: formData.grade,
        date_of_birth: formData.date_of_birth,
        parent_name: formData.parent_name.trim(),
        address: formData.address.trim() || undefined,
        primary_contact: formData.primary_contact.trim(),
        alternative_contact: formData.alternative_contact.trim() || undefined,
        gender: formData.gender as 'Male' | 'Female',
        admission_date: formData.admission_date,
        registration_number: "" // Will be auto-generated
      };

      const result = await insertStudent(studentData);
      
      toast({
        title: "Student Enrolled Successfully!",
        description: `${result.student_name} has been enrolled with registration number ${result.registration_number}`,
      });

      // Reset form
      setFormData({
        student_name: "",
        grade: "",
        date_of_birth: "",
        parent_name: "",
        address: "",
        primary_contact: "",
        alternative_contact: "",
        gender: "",
        admission_date: new Date().toISOString().split('T')[0]
      });
      setErrors({});

    } catch (error) {
      console.error('Error enrolling student:', error);
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll student. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Enrollment</h2>
        <p className="text-gray-600">Register new students into the school system</p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single" className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Single Enrollment</span>
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Bulk Enrollment</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card className="transform hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>New Student Registration</span>
              </CardTitle>
              <CardDescription>
                Please fill in all required fields marked with (*) to enroll a new student
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="student-name">
                        Student Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="student-name"
                        placeholder="Enter student's full name"
                        value={formData.student_name}
                        onChange={(e) => updateFormData('student_name', e.target.value)}
                        className={errors.student_name ? "border-red-500" : ""}
                      />
                      {errors.student_name && (
                        <p className="text-sm text-red-500">{errors.student_name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grade">
                        Grade <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.grade} onValueChange={(value) => updateFormData('grade', value)}>
                        <SelectTrigger id="grade" className={errors.grade ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select Grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.grade && (
                        <p className="text-sm text-red-500">{errors.grade}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-of-birth">
                        Date of Birth <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="date-of-birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => updateFormData('date_of_birth', e.target.value)}
                        className={errors.date_of_birth ? "border-red-500" : ""}
                      />
                      {errors.date_of_birth && (
                        <p className="text-sm text-red-500">{errors.date_of_birth}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <Select value={formData.gender} onValueChange={(value: 'Male' | 'Female') => updateFormData('gender', value)}>
                        <SelectTrigger id="gender" className={errors.gender ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && (
                        <p className="text-sm text-red-500">{errors.gender}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="admission-date">
                        Admission Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="admission-date"
                        type="date"
                        value={formData.admission_date}
                        onChange={(e) => updateFormData('admission_date', e.target.value)}
                        className={errors.admission_date ? "border-red-500" : ""}
                      />
                      {errors.admission_date && (
                        <p className="text-sm text-red-500">{errors.admission_date}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Parent/Guardian Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Parent/Guardian Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parent-name">
                        Parent/Guardian Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="parent-name"
                        placeholder="Enter parent/guardian full name"
                        value={formData.parent_name}
                        onChange={(e) => updateFormData('parent_name', e.target.value)}
                        className={errors.parent_name ? "border-red-500" : ""}
                      />
                      {errors.parent_name && (
                        <p className="text-sm text-red-500">{errors.parent_name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="primary-contact">
                        Primary Contact <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="primary-contact"
                        placeholder="Enter primary phone number"
                        value={formData.primary_contact}
                        onChange={(e) => updateFormData('primary_contact', e.target.value)}
                        className={errors.primary_contact ? "border-red-500" : ""}
                      />
                      {errors.primary_contact && (
                        <p className="text-sm text-red-500">{errors.primary_contact}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alternative-contact">Alternative Contact</Label>
                      <Input
                        id="alternative-contact"
                        placeholder="Enter alternative phone number (optional)"
                        value={formData.alternative_contact}
                        onChange={(e) => updateFormData('alternative_contact', e.target.value)}
                        className={errors.alternative_contact ? "border-red-500" : ""}
                      />
                      {errors.alternative_contact && (
                        <p className="text-sm text-red-500">{errors.alternative_contact}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Home Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter complete home address (optional)"
                      value={formData.address}
                      onChange={(e) => updateFormData('address', e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={loading}
                    className="min-w-[150px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Enroll Student
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <BulkEnrollment />
        </TabsContent>
      </Tabs>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Auto-Generated Information</h4>
          <p className="text-sm text-blue-700">
            The student's registration number will be automatically generated upon successful enrollment.
          </p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">Validation Requirements</h4>
          <p className="text-sm text-green-700">
            All fields marked with (*) are required. Phone numbers must be valid, and dates must be realistic.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentEnrollment;
