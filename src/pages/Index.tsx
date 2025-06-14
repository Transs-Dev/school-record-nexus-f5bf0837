import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Dashboard from "@/components/Dashboard";
import StudentEnrollment from "@/components/StudentEnrollment";
import StudentRecords from "@/components/StudentRecords";
import AcademicSection from "@/components/AcademicSection";
import FeeManagement from "@/components/FeeManagement";
import TourGuide from "@/components/TourGuide";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showTourGuide, setShowTourGuide] = useState(false);

  return (
    <div className="w-full">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard" onClick={() => setActiveTab("dashboard")}>Dashboard</TabsTrigger>
          <TabsTrigger value="enrollment" onClick={() => setActiveTab("enrollment")}>Enrollment</TabsTrigger>
          <TabsTrigger value="records" onClick={() => setActiveTab("records")}>Records</TabsTrigger>
          <TabsTrigger value="academic" onClick={() => setActiveTab("academic")}>Academic</TabsTrigger>
          <TabsTrigger value="fees" onClick={() => setActiveTab("fees")}>Fees</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <Dashboard onStartTour={() => setShowTourGuide(true)} />
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
        <TabsContent value="fees">
          <FeeManagement />
        </TabsContent>
      </Tabs>

      <TourGuide 
        isOpen={showTourGuide} 
        onClose={() => setShowTourGuide(false)}
        currentTab={activeTab}
      />
    </div>
  );
};

export default Index;
