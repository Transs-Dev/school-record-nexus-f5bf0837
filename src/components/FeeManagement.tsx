
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentFeeSubmission from "./StudentFeeSubmission";
import FeeVerification from "./FeeVerification";
import FeeConfiguration from "./FeeConfiguration";

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState("submission");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Fee Management</h2>
        <p className="text-gray-600">Manage student fees, payments and configurations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Management System</CardTitle>
          <CardDescription>
            Submit, verify and manage student fee payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="space-y-4"
          >
            <TabsList className="grid grid-cols-3 w-[600px]">
              <TabsTrigger value="submission">Fee Submission</TabsTrigger>
              <TabsTrigger value="verification">Fee Verification</TabsTrigger>
              <TabsTrigger value="configuration">Fee Configuration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="submission" className="space-y-4">
              <StudentFeeSubmission />
            </TabsContent>
            
            <TabsContent value="verification" className="space-y-4">
              <FeeVerification />
            </TabsContent>
            
            <TabsContent value="configuration" className="space-y-4">
              <FeeConfiguration />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeeManagement;
