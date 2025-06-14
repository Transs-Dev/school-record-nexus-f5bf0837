
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Package, Edit3, Save, X } from "lucide-react";
import { getFurnitureStock, updateFurnitureStock, FurnitureStock } from "@/utils/furnitureDatabase";

const StockManagement = () => {
  const [stock, setStock] = useState<FurnitureStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ available: number; total: number }>({ available: 0, total: 0 });
  const { toast } = useToast();

  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      setLoading(true);
      const stockData = await getFurnitureStock();
      setStock(stockData);
    } catch (error) {
      console.error('Error loading stock:', error);
      toast({
        title: "Error",
        description: "Failed to load stock data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (item: FurnitureStock) => {
    setEditing(item.item_type);
    setEditValues({
      available: item.available_quantity,
      total: item.total_quantity
    });
  };

  const cancelEditing = () => {
    setEditing(null);
    setEditValues({ available: 0, total: 0 });
  };

  const saveStock = async (itemType: 'chair' | 'locker') => {
    try {
      if (editValues.available > editValues.total) {
        toast({
          title: "Error",
          description: "Available quantity cannot exceed total quantity",
          variant: "destructive",
        });
        return;
      }

      await updateFurnitureStock(itemType, editValues.available, editValues.total);
      
      toast({
        title: "Success",
        description: `${itemType} stock updated successfully`,
      });

      setEditing(null);
      loadStock();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Stock Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Stock Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stock.map((item) => (
          <div key={item.item_type} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold capitalize">{item.item_type}s</h3>
              {editing !== item.item_type ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startEditing(item)}
                  className="flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => saveStock(item.item_type)}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEditing}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                </div>
              )}
            </div>

            {editing === item.item_type ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`total-${item.item_type}`}>Total Quantity</Label>
                  <Input
                    id={`total-${item.item_type}`}
                    type="number"
                    min="0"
                    value={editValues.total}
                    onChange={(e) => setEditValues(prev => ({ ...prev, total: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor={`available-${item.item_type}`}>Available Quantity</Label>
                  <Input
                    id={`available-${item.item_type}`}
                    type="number"
                    min="0"
                    max={editValues.total}
                    value={editValues.available}
                    onChange={(e) => setEditValues(prev => ({ ...prev, available: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{item.total_quantity}</div>
                  <p className="text-sm text-gray-600">Total Quantity</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{item.available_quantity}</div>
                  <p className="text-sm text-gray-600">Available</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default StockManagement;
