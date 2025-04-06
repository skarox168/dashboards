// start the app always with '/' route
import { Toaster as Sonner } from "@/components/ui/sonner";

import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { TooltipProvider } from "./components/ui/tooltip";

import { ThemeProvider } from "./components/layout/theme-provider";
import { SidebarProvider } from "./components/layout/sidebar-provider";
import "./index.css";
import Index from "./pages";
import LoginForm from "./pages/login";
import SignupForm from "./pages/signup";
import Logout from "./pages/logout";
import Profile from "./pages/profile";
import { ProtectedRoute } from "./components/auth/route-components";
import DashboardView from "./pages/dashboard-view";
import DashboardEditor from "./pages/dashboard-editor";
import DatabaseConnections from "./pages/admin/database-connections";
import UserManagement from "./pages/admin/user-management";
import DashboardTemplates from "./pages/admin/dashboard-templates";
import DashboardList from "./pages/dashboards";
import Settings from "./pages/admin/settings";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <SidebarProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Index />} />
              <Route path='/login' element={<LoginForm />} />
              <Route path='/signup' element={<SignupForm />} />
              <Route path='/logout' element={<Logout />} />
              <Route path='/profile' element={<ProtectedRoute Component={Profile} />} />
              <Route path='/dashboards' element={<ProtectedRoute Component={DashboardList} />} />
              <Route path='/dashboards/:id' element={<ProtectedRoute Component={DashboardView} />} />
              <Route path='/dashboards/new' element={<ProtectedRoute Component={DashboardEditor} />} />
              <Route path='/dashboards/:id/edit' element={<ProtectedRoute Component={DashboardEditor} />} />
              <Route path='/templates' element={<ProtectedRoute Component={DashboardTemplates} />} />
              <Route path='/admin/databases' element={<ProtectedRoute Component={DatabaseConnections} />} />
              <Route path='/admin/users' element={<ProtectedRoute Component={UserManagement} />} />
              <Route path='/admin/settings' element={<ProtectedRoute Component={Settings} />} />
            </Routes>
          </BrowserRouter>
          <Sonner />
          <Toaster />
        </SidebarProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);