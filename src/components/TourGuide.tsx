
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, X, Users, FileText, BookOpen, UserCheck, DollarSign, GraduationCap } from "lucide-react";

interface TourGuideProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
}

const TourGuide = ({ isOpen, onClose, currentTab }: TourGuideProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps = [
    {
      title: "Welcome to School Management System",
      description: "This comprehensive system helps you manage all aspects of your educational institution efficiently.",
      icon: GraduationCap,
      color: "bg-gradient-to-r from-pink-500 to-rose-500"
    },
    {
      title: "Dashboard Overview",
      description: "Get a quick overview of student statistics, recent activities, and access quick actions for common tasks.",
      icon: GraduationCap,
      color: "bg-gradient-to-r from-pink-500 to-rose-500"
    },
    {
      title: "Student Enrollment",
      description: "Register new students, manage enrollment data, and maintain comprehensive student profiles with all necessary information.",
      icon: Users,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500"
    },
    {
      title: "Student Records",
      description: "View, search, and manage all student records. Access detailed information, update profiles, and track student history.",
      icon: FileText,
      color: "bg-gradient-to-r from-green-500 to-emerald-500"
    },
    {
      title: "Academic Section",
      description: "Enter examination marks, generate report cards, track academic performance, and manage grading systems.",
      icon: BookOpen,
      color: "bg-gradient-to-r from-purple-500 to-violet-500"
    },
    {
      title: "Student Portal",
      description: "Students can access their academic results, fee statements, and personal information through this portal.",
      icon: UserCheck,
      color: "bg-gradient-to-r from-orange-500 to-red-500"
    },
    {
      title: "Fee Management",
      description: "Configure fees, track payments, verify transactions, and generate financial reports. All amounts are in Zambian Kwacha (ZMW).",
      icon: DollarSign,
      color: "bg-gradient-to-r from-yellow-500 to-amber-500"
    }
  ];

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            System Tour Guide
          </DialogTitle>
          <DialogDescription>
            Learn how to use each section of the school management system
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className={`w-20 h-20 ${currentTourStep.color} rounded-full flex items-center justify-center mx-auto animate-pulse-pink`}>
                <currentTourStep.icon className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {currentTourStep.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {currentTourStep.description}
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center space-x-2">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? "bg-pink-500 scale-125" 
                        : index < currentStep 
                          ? "bg-pink-300" 
                          : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <div className="text-sm text-gray-500">
                Step {currentStep + 1} of {tourSteps.length}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="border-pink-300 text-pink-600 hover:bg-pink-50"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              Skip Tour
            </Button>
            
            {currentStep === tourSteps.length - 1 ? (
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                Complete Tour
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TourGuide;
