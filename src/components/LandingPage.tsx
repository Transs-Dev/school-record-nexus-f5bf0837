
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Award, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student enrollment, records management, and tracking system"
    },
    {
      icon: BookOpen,
      title: "Academic Excellence",
      description: "Grade management, academic progress tracking, and performance analytics"
    },
    {
      icon: Award,
      title: "Achievement Tracking",
      description: "Monitor student achievements, awards, and extracurricular activities"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Advanced security measures to protect sensitive student information"
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Instant access to updated information and real-time notifications"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-all duration-300 hover:shadow-2xl">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-fade-in">
              Ronga Secondary School
              <span className="block text-3xl md:text-4xl text-blue-600 mt-4">
                Management System
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Streamline your school operations with our comprehensive management system. 
              From student enrollment to academic tracking, we provide the tools you need 
              for educational excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  Access Dashboard
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our System?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to enhance educational management and student success
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl border-0 bg-white/80 backdrop-blur-sm group"
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                    <feature.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-blue-100">Students Enrolled</div>
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-blue-100">Qualified Teachers</div>
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-blue-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your School Management?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of educational institutions that trust our system for their daily operations.
          </p>
          <Link to="/dashboard">
            <Button size="lg" className="px-12 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
