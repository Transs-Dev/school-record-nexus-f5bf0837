import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Plus, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  type FeeConfiguration as FeeConfigType,
  fetchFeeConfigurations,
  saveFeeConfiguration
} from "@/utils/feeDatabase";

const FeeConfiguration = () => {
  const [feeConfigs, setFeeConfigs] = useState<FeeConfigType[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingConfig, setEditingConfig] = useState<FeeConfigType | null>(null);
  const [formData, setFormData] = useState({
    term: "Term 1",
    academic_year: new Date().getFullYear().toString(),
    amount: ""
  });

  const terms = ["Term 1", "Term 2", "Term 3"];

  useEffect(() => {
    loadFeeConfigurations();
  }, []);

  const loadFeeConfigurations = async () => {
    try {
      setLoading(true);
      const configs = await fetchFeeConfigurations();
      setFeeConfigs(configs);
    } catch (error) {
      console.error("Error loading fee configurations:", error);
      toast({
        title: "Error",
        description: "Failed to load fee configurations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid fee amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const result = await saveFeeConfiguration({
        term: formData.term,
        academic_year: formData.academic_year,
        amount: parseFloat(formData.amount)
      });

      console.log("Fee configuration saved:", result);

      toast({
        title: "Fee Configuration Saved",
        description: `Fee for ${formData.term} ${formData.academic_year} has been set to KES ${parseFloat(formData.amount).toLocaleString()}`,
      });

      // Reset form
      setFormData({
        term: "Term 1",
        academic_year: new Date().getFullYear().toString(),
        amount: ""
      });
      setEditingConfig(null);

      // Reload configurations
      await loadFeeConfigurations();
    } catch (error) {
      console.error("Error saving fee configuration:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save fee configuration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: FeeConfigType) => {
    setEditingConfig(config);
    setFormData({
      term: config.term,
      academic_year: config.academic_year,
      amount: config.amount.toString()
    });
  };

  const handleCancelEdit = () => {
    setEditingConfig(null);
    setFormData({
      term: "Term 1",
      academic_year: new Date().getFullYear().toString(),
      amount: ""
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Fee Configuration</h2>
        <p className="text-gray-600">Set fee amounts for different terms and academic years</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>{editingConfig ? 'Edit Fee Configuration' : 'Add Fee Configuration'}</span>
            </CardTitle>
            <CardDescription>
              {editingConfig ? 'Update the fee amount for this term' : 'Set the fee amount for a specific term and academic year'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="term">Term *</Label>
                  <Select 
                    value={formData.term} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, term: value }))}
                    disabled={!!editingConfig}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map((term) => (
                        <SelectItem key={term} value={term}>
                          {term}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academic_year">Academic Year *</Label>
                  <Select 
                    value={formData.academic_year} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, academic_year: value }))}
                    disabled={!!editingConfig}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026, 2027].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Fee Amount (KES) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter fee amount"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Settings className="w-4 h-4 mr-2 animate-spin" />
                      {editingConfig ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      {editingConfig ? <Edit className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      {editingConfig ? 'Update Configuration' : 'Save Configuration'}
                    </>
                  )}
                </Button>
                {editingConfig && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Current Configurations */}
        <Card>
          <CardHeader>
            <CardTitle>Current Fee Configurations</CardTitle>
            <CardDescription>
              Existing fee amounts for different terms and years
            </CardDescription>
          </CardHeader>
          <CardContent>
            {feeConfigs.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Configurations</h3>
                <p className="text-gray-600">No fee configurations have been set up yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Term</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeConfigs.map((config) => (
                    <TableRow key={`${config.term}-${config.academic_year}`}>
                      <TableCell className="font-medium">{config.term}</TableCell>
                      <TableCell>{config.academic_year}</TableCell>
                      <TableCell>KES {config.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(config)}
                          disabled={editingConfig?.id === config.id}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeeConfiguration;
