
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AboutPage from "./components/AboutPage";
import LandingPage from "./components/LandingPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WhatsAppChat from "./components/WhatsAppChat";
import DevAuthBypass from "./components/DevAuthBypass";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <DevAuthBypass />
        <BrowserRouter>
          <div className="min-h-screen w-full">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <WhatsAppChat />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
