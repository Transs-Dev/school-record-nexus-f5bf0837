
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RotateCcw, Trash2, Database, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SystemReset = () => {
  const [confirmationText, setConfirmationText] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetStep, setResetStep] = useState("");

  const CONFIRMATION_PHRASE = "RESET SCHOOL SYSTEM";

  const handleSystemReset = async () => {
    if (confirmationText !== CONFIRMATION_PHRASE) {
      toast({
        title: "Confirmation Required",
        description: `Please type "${CONFIRMATION_PHRASE}" to confirm system reset.`,
        variant: "destructive"
      });
      return;
    }

    try {
      setIsResetting(true);
      
      // Step 1: Delete all examination marks
      setResetStep("Deleting examination records...");
      const { error: examError } = await supabase
        .from('examination_marks')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (examError) throw examError;

      // Step 2: Delete all fee payments
      setResetStep("Deleting fee payment records...");
      const { error: paymentError } = await supabase
        .from('fee_payments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (paymentError) throw paymentError;

      // Step 3: Delete all student fee records
      setResetStep("Deleting student fee records...");
      const { error: feeRecordError } = await supabase
        .from('student_fee_records')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (feeRecordError) throw feeRecordError;

      // Step 4: Delete all fee configurations
      setResetStep("Deleting fee configurations...");
      const { error: feeConfigError } = await supabase
        .from('fee_configuration')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (feeConfigError) throw feeConfigError;

      // Step 5: Delete all students
      setResetStep("Deleting student records...");
      const { error: studentError } = await supabase
        .from('students')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (studentError) throw studentError;

      setResetStep("System reset completed!");
      
      toast({
        title: "System Reset Successful",
        description: "All records have been cleared. The system is now ready for fresh setup.",
      });

      // Clear confirmation text
      setConfirmationText("");
      
    } catch (error) {
      console.error('Error resetting system:', error);
      toast({
        title: "Reset Failed",
        description: "An error occurred while resetting the system. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
      setResetStep("");
    }
  };

  const resetSections = [
    {
      title: "Student Records",
      description: "All student enrollment data and personal information",
      count: "All students"
    },
    {
      title: "Examination Records", 
      description: "All marks, grades, and academic performance data",
      count: "All terms & grades"
    },
    {
      title: "Fee Management",
      description: "Payment records, configurations, and fee structures",
      count: "All fee data"
    },
    {
      title: "System Configuration",
      description: "Academic years, terms, and custom settings",
      count: "All configurations"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">System Reset</h2>
        <p className="text-gray-600">Reset the entire system to its initial state</p>
      </div>

      {/* Warning Card */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            <span>Critical Warning</span>
          </CardTitle>
          <CardDescription className="text-red-700">
            This action will permanently delete ALL data in the system and cannot be undone.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* What Will Be Reset */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Data That Will Be Deleted</span>
          </CardTitle>
          <CardDescription>
            The following data will be permanently removed from the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resetSections.map((section, index) => (
              <Card key={index} className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{section.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{section.description}</p>
                      <Badge variant="destructive" className="text-xs">
                        {section.count}
                      </Badge>
                    </div>
                    <Trash2 className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RotateCcw className="w-5 h-5" />
            <span>Confirm System Reset</span>
          </CardTitle>
          <CardDescription>
            Type the confirmation phrase exactly as shown to proceed with the reset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-600 mb-2">Type this phrase to confirm:</p>
              <p className="font-mono text-lg font-bold text-gray-900">{CONFIRMATION_PHRASE}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmation">Confirmation Phrase</Label>
              <Input
                id="confirmation"
                placeholder={`Type "${CONFIRMATION_PHRASE}" to confirm`}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="font-mono"
              />
            </div>

            {isResetting && resetStep && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">{resetStep}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                onClick={handleSystemReset}
                variant="destructive"
                disabled={confirmationText !== CONFIRMATION_PHRASE || isResetting}
                className="flex items-center space-x-2"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting System...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Entire System</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setConfirmationText("")}
                disabled={isResetting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">After Reset</h4>
          <p className="text-sm text-blue-700">
            The system will be restored to its initial state, ready for fresh setup. 
            You can immediately start enrolling new students and configuring the system.
          </p>
        </div>
        
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h4 className="font-medium text-orange-800 mb-2">Backup Recommendation</h4>
          <p className="text-sm text-orange-700">
            Consider exporting important data before proceeding with the reset. 
            This action cannot be reversed once completed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemReset;
