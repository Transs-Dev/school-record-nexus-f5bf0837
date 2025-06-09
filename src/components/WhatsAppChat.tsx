
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const WhatsAppChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = "+254725409996";
  
  const developerQueries = [
    "I'm facing a database connection issue with Supabase",
    "Need help with authentication implementation",
    "Having trouble with form validation and data submission",
    "Experiencing issues with responsive design on mobile devices",
    "Need assistance with API integration and error handling",
    "Having problems with component state management",
    "Need help with TypeScript type definitions",
    "Experiencing build or deployment errors",
    "Need guidance on best practices and code optimization"
  ];

  const sendWhatsAppMessage = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Developer Queries Panel */}
      {isOpen && (
        <Card className="mb-4 w-96 max-h-96 overflow-y-auto animate-fade-in shadow-2xl border-0 bg-white/95 backdrop-blur-md border border-pink-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Developer Support</h3>
                <p className="text-xs text-pink-600">Get help with technical challenges</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-pink-50 rounded"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {developerQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => sendWhatsAppMessage(query)}
                  className="w-full text-left p-3 rounded-lg bg-pink-50 hover:bg-pink-100 transition-all duration-200 text-sm text-gray-700 hover:text-pink-700 border hover:border-pink-200 hover-lift"
                >
                  {query}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-pink-200">
              <button
                onClick={() => sendWhatsAppMessage("Hi! I need technical support with the school management system.")}
                className="w-full p-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg transition-all duration-200 font-medium hover-lift"
              >
                Start Custom Developer Chat
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WhatsApp Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-2xl animate-pulse-pink hover:animate-none transition-all duration-300 hover-lift p-0 relative group"
      >
        {/* WhatsApp Icon */}
        <svg 
          className="w-8 h-8 text-white" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63"/>
        </svg>
        
        {/* Developer indicator */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">?</span>
        </div>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-pink-400 animate-ping opacity-75"></div>
      </Button>
    </div>
  );
};

export default WhatsAppChat;
