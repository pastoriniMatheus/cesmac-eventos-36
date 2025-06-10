
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Messages from "./pages/Messages";
import QRCodePage from "./pages/QRCode";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Handle QR code redirects - redirect immediately without loading React app
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/r/')) {
      const shortUrl = path.replace('/r/', '');
      console.log('Redirecionando QR code:', shortUrl);
      // Redirect immediately to the edge function
      window.location.replace(`https://dobtquebpcnzjisftcfh.supabase.co/functions/v1/qr-redirect/${shortUrl}`);
      return;
    }
  }, []);

  // Don't render the React app if it's a QR redirect
  if (window.location.pathname.startsWith('/r/')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/qr-code" element={<QRCodePage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
