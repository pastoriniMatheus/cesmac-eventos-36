
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import QRCodePage from "./pages/QRCode";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const queryClient = new QueryClient();

const App = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex h-screen bg-background">
            <Sidebar collapsed={sidebarCollapsed} />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header onToggleSidebar={toggleSidebar} />
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/qrcode" element={<QRCodePage />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
