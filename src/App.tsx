
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, createContext } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ClientDetail from "./pages/ClientDetail";
import AddClient from "./pages/AddClient";
import EditClient from "./pages/EditClient";
import NotFound from "./pages/NotFound";

// Create auth context
export const AuthContext = createContext({
  isAuthenticated: false,
  login: (username: string, password: string) => {},
  logout: () => {}
});

const queryClient = new QueryClient();

const App = () => {
  // Check if user is logged in from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  
  // Simple authentication functions
  const login = (username: string, password: string) => {
    // For MVP, we'll just check if fields are not empty
    if (username && password) {
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };
  
  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
              } />
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
              } />
              <Route path="/dashboard" element={
                isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
              } />
              <Route path="/client/:id" element={
                isAuthenticated ? <ClientDetail /> : <Navigate to="/login" />
              } />
              <Route path="/add-client" element={
                isAuthenticated ? <AddClient /> : <Navigate to="/login" />
              } />
              <Route path="/edit-client/:id" element={
                isAuthenticated ? <EditClient /> : <Navigate to="/login" />
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};

export default App;
