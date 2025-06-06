
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentFeeSubmission from "./StudentFeeSubmission";

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
            <TabsList className="grid grid-cols-2 w-[400px]">
              <TabsTrigger value="submission">Fee Submission</TabsTrigger>
              <TabsTrigger value="verification">Fee Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="submission" className="space-y-4">
              <StudentFeeSubmission />
            </TabsContent>
            
            <TabsContent value="verification" className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-md">
                <p className="text-blue-700">
                  This section allows administrative staff to verify fee payments made by students.
                  Contact the school bursar for access.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeeManagement;
