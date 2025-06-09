
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ChangePinDialog = () => {
  const [open, setOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const resetForm = () => {
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setShowCurrentPin(false);
    setShowNewPin(false);
    setShowConfirmPin(false);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleChangePin = async () => {
    if (!currentPin || !newPin || !confirmPin) {
      toast({
        title: "All Fields Required",
        description: "Please fill in all PIN fields.",
        variant: "destructive"
      });
      return;
    }

    if (newPin !== confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "New PIN and confirmation PIN do not match.",
        variant: "destructive"
      });
      return;
    }

    if (newPin.length < 4) {
      toast({
        title: "PIN Too Short",
        description: "PIN must be at least 4 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (newPin === currentPin) {
      toast({
        title: "Same PIN",
        description: "New PIN must be different from current PIN.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // First verify current PIN
      const { data, error: fetchError } = await supabase
        .from('pin_settings')
        .select('pin_hash, id')
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // In a real app, you'd hash the entered PIN and compare
      if (currentPin !== data.pin_hash) {
        toast({
          title: "Incorrect Current PIN",
          description: "The current PIN you entered is incorrect.",
          variant: "destructive"
        });
        return;
      }

      // Update to new PIN
      const { error: updateError } = await supabase
        .from('pin_settings')
        .update({ pin_hash: newPin })
        .eq('id', data.id);

      if (updateError) {
        throw updateError;
      }

      // Clear all active sessions
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('pin_unlocked_') || key.startsWith('pin_unlock_time_')) {
          sessionStorage.removeItem(key);
        }
      });

      toast({
        title: "PIN Changed Successfully",
        description: "Your PIN has been updated. You'll need to re-enter it for protected sections.",
      });

      handleClose();
      
      // Refresh the page to force re-authentication
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Error changing PIN:', error);
      toast({
        title: "Error Changing PIN",
        description: "Failed to change PIN. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Key className="w-4 h-4" />
          <span>Change PIN</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5" />
            <span>Change PIN</span>
          </DialogTitle>
          <DialogDescription>
            Enter your current PIN and set a new one. You'll need to re-authenticate after changing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-pin">Current PIN</Label>
            <div className="relative">
              <Input
                id="current-pin"
                type={showCurrentPin ? "text" : "password"}
                placeholder="Enter current PIN"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                disabled={loading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPin(!showCurrentPin)}
                disabled={loading}
              >
                {showCurrentPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-pin">New PIN</Label>
            <div className="relative">
              <Input
                id="new-pin"
                type={showNewPin ? "text" : "password"}
                placeholder="Enter new PIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                disabled={loading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPin(!showNewPin)}
                disabled={loading}
              >
                {showNewPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirm New PIN</Label>
            <div className="relative">
              <Input
                id="confirm-pin"
                type={showConfirmPin ? "text" : "password"}
                placeholder="Confirm new PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                disabled={loading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                disabled={loading}
              >
                {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button onClick={handleChangePin} disabled={loading} className="flex-1">
              {loading ? "Changing..." : "Change PIN"}
            </Button>
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePinDialog;
