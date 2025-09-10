
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, Shield, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PinProtectionProps {
  children: React.ReactNode;
  sectionName: string;
}

const PinProtection: React.FC<PinProtectionProps> = ({ children, sectionName }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const checkPinStatus = async () => {
    // Check if PIN was recently entered for this session
    const unlockStatus = sessionStorage.getItem(`pin_unlocked_${sectionName}`);
    const unlockTime = sessionStorage.getItem(`pin_unlock_time_${sectionName}`);
    
    if (unlockStatus && unlockTime) {
      const timeElapsed = Date.now() - parseInt(unlockTime);
      // Auto-lock after 30 minutes of inactivity
      if (timeElapsed < 30 * 60 * 1000) {
        // Re-establish admin session for continued access
        try {
          await supabase.rpc('set_admin_session');
        } catch (error) {
          console.error('Error setting admin session:', error);
        }
        setIsUnlocked(true);
      } else {
        sessionStorage.removeItem(`pin_unlocked_${sectionName}`);
        sessionStorage.removeItem(`pin_unlock_time_${sectionName}`);
      }
    }
  };

  useEffect(() => {
    checkPinStatus();
  }, [sectionName]);

  const verifyPin = async () => {
    if (!pin) {
      toast({
        title: "PIN Required",
        description: "Please enter your PIN to access this section.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pin_settings')
        .select('pin_hash')
        .single();

      if (error) {
        throw error;
      }

      // In a real app, you'd hash the entered PIN and compare
      // For now, we're doing direct comparison (not secure)
      if (pin === data.pin_hash) {
        // Set admin session for secure access to financial data
        await supabase.rpc('set_admin_session');
        
        setIsUnlocked(true);
        sessionStorage.setItem(`pin_unlocked_${sectionName}`, 'true');
        sessionStorage.setItem(`pin_unlock_time_${sectionName}`, Date.now().toString());
        setPin("");
        
        toast({
          title: "Access Granted",
          description: `Welcome to ${sectionName} section.`,
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Incorrect PIN. Please try again.",
          variant: "destructive"
        });
        setPin("");
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      toast({
        title: "Error",
        description: "Failed to verify PIN. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async () => {
    // Revoke admin session to secure financial data
    try {
      await supabase.rpc('revoke_admin_session');
    } catch (error) {
      console.error('Error revoking admin session:', error);
    }
    
    setIsUnlocked(false);
    sessionStorage.removeItem(`pin_unlocked_${sectionName}`);
    sessionStorage.removeItem(`pin_unlock_time_${sectionName}`);
    
    toast({
      title: "Section Locked",
      description: `${sectionName} section has been locked.`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyPin();
    }
  };

  if (isUnlocked) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Unlock className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">{sectionName} - Access Granted</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLock}>
            <Lock className="w-4 h-4 mr-2" />
            Lock Section
          </Button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{sectionName}</h2>
        <p className="text-gray-600">This section is protected. Please enter your PIN to continue.</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span>PIN Protection</span>
          </CardTitle>
          <CardDescription>
            Enter your PIN to access the {sectionName} section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">PIN</Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-10"
                disabled={loading}
                maxLength={10}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPin(!showPin)}
                disabled={loading}
              >
                {showPin ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <Button onClick={verifyPin} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Lock className="w-4 h-4 mr-2 animate-pulse" />
                Verifying...
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Unlock Section
              </>
            )}
          </Button>

          <div className="text-center text-sm text-gray-500">
            Default PIN: 1200
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PinProtection;
