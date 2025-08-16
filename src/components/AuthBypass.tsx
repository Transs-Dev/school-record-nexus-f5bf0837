
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, LogOut } from 'lucide-react';

const AuthBypass = () => {
  const { isAuthenticated, signInBypass, signOut } = useAuth();

  useEffect(() => {
    // Auto sign-in for development if not authenticated
    if (!isAuthenticated) {
      signInBypass();
    }
  }, [isAuthenticated, signInBypass]);

  if (isAuthenticated) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Card className="w-64">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-600">Auth Status</CardTitle>
            <CardDescription className="text-xs">Authenticated for testing</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button onClick={signOut} size="sm" variant="outline" className="w-full">
              <LogOut className="w-3 h-3 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-64">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-red-600">Auth Required</CardTitle>
          <CardDescription className="text-xs">Sign in to access features</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button onClick={signInBypass} size="sm" className="w-full">
            <LogIn className="w-3 h-3 mr-2" />
            Sign In (Dev)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthBypass;
