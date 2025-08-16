import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FeeConfigurationData {
  id: string;
  term: string;
  academic_year: string;
  amount: number;
  created_at: string;
}

const FeeConfiguration = () => {
  const [selectedTerm, setSelectedTerm] = useState("");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [amount, setAmount] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [configurations, setConfigurations] = useState<FeeConfigurationData[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('fee_configuration')
        .select('*')
        .order('academic_year', { ascending: false })
        .order('term', { ascending: true });

      if (error) {
        console.error('Error fetching fee configurations:', error);
        toast({
          title: "Error",
          description: "Failed to load fee configurations",
          variant: "destructive",
        });
      } else {
        setConfigurations(data || []);
      }
    } catch (error) {
      console.error('Error fetching fee configurations:', error);
      toast({
        title: "Error",
        description: "Failed to load fee configurations",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTerm || !amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Please select a term and enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const feeData = {
        term: selectedTerm,
        academic_year: academicYear,
        amount: parseFloat(amount.toString())
      };

      // Use upsert to handle conflicts
      const { error } = await supabase
        .from('fee_configuration')
        .upsert(feeData, {
          onConflict: 'term,academic_year'
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Fee configuration saved for ${selectedTerm} ${academicYear}`,
      });

      // Reset form
      setSelectedTerm("");
      setAmount("");
      
      // Refresh the configurations
      fetchConfigurations();
    } catch (error) {
      console.error('Error saving fee configuration:', error);
      toast({
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to save fee configuration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="term">Term</Label>
            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Term 1">Term 1</SelectItem>
                <SelectItem value="Term 2">Term 2</SelectItem>
                <SelectItem value="Term 3">Term 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="academicYear">Academic Year</Label>
            <Input
              type="number"
              id="academicYear"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
            />
          </div>
          <Button disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving..." : "Save Configuration"}
          </Button>
        </form>

        {configurations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Existing Configurations</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Term
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academic Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {configurations.map((config) => (
                    <tr key={config.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{config.term}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{config.academic_year}</td>
                      <td className="px-6 py-4 whitespace-nowrap">Ksh {config.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(config.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeConfiguration;
