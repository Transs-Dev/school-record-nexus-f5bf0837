
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Target, Eye, Heart, Users, Award, BookOpen, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const AboutPage = () => {
  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "Committed to delivering the highest quality education management solutions"
    },
    {
      icon: Heart,
      title: "Care",
      description: "Every student matters, and we ensure their academic journey is well-supported"
    },
    {
      icon: Shield,
      title: "Integrity",
      description: "Transparent, secure, and reliable systems that schools can trust"
    },
    {
      icon: Users,
      title: "Community",
      description: "Building stronger connections between students, teachers, and parents"
    }
  ];

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Complete student lifecycle management from enrollment to graduation, including detailed records, attendance tracking, and performance monitoring."
    },
    {
      icon: BookOpen,
      title: "Academic Management",
      description: "Comprehensive grade management, curriculum tracking, assignment management, and academic performance analytics."
    },
    {
      icon: Award,
      title: "Achievement Tracking",
      description: "Monitor and celebrate student achievements, awards, extracurricular activities, and personal development milestones."
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Advanced security measures including encrypted data storage, role-based access control, and regular security audits."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">RSS Management</h1>
                <p className="text-sm text-gray-600">Ronga Secondary School</p>
              </div>
            </Link>
            <Link to="/dashboard">
              <Button className="transform hover:scale-105 transition-all duration-300">
                Access Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 animate-fade-in">
              About Our System
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The Ronga Secondary School Management System is a comprehensive digital solution 
              designed to streamline educational operations, enhance student experiences, and 
              support academic excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="text-center">
                <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-3xl font-bold text-gray-900">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg leading-relaxed text-center">
                  To empower educational institutions with innovative technology solutions that 
                  enhance learning outcomes, streamline administrative processes, and foster 
                  meaningful connections within the school community.
                </p>
              </CardContent>
            </Card>

            <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader className="text-center">
                <Eye className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                <CardTitle className="text-3xl font-bold text-gray-900">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg leading-relaxed text-center">
                  To be the leading provider of comprehensive school management solutions that 
                  transform educational experiences and contribute to building a brighter future 
                  for students worldwide.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl border-0 bg-white/80 backdrop-blur-sm group">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                    <value.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* System Features */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">System Capabilities</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Comprehensive features designed for modern educational institutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 text-white transform hover:scale-105 transition-all duration-300 hover:bg-white/20">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-blue-100">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Experience the power of our comprehensive school management system today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                Access Dashboard
              </Button>
            </Link>
            <a href="https://wa.me/254725409996" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-300 hover:shadow-lg">
                Contact Support
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
