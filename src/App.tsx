import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";
import { InactivityWarning } from "@/components/InactivityWarning";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import BestCard from "./pages/BestCard";
import Benefits from "./pages/Benefits";
import Offers from "./pages/Offers";
import CardComparison from "./pages/CardComparison";
import Advisor from "./pages/Advisor";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full gold-gradient animate-pulse" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full gold-gradient animate-pulse" />
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full gold-gradient animate-pulse" />
      </div>
    );
  }
  
  return <Navigate to={user ? "/dashboard" : "/auth"} replace />;
}

function LogoutRoute() {
  const { signOut } = useAuth();
  
  signOut().then(() => {
    window.location.href = '/auth';
  });
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-12 h-12 rounded-full gold-gradient animate-pulse" />
    </div>
  );
}

// Wrapper component that provides inactivity logout for protected routes
function InactivityWrapper({ children }: { children: React.ReactNode }) {
  const { showWarning, secondsRemaining, stayLoggedIn, logout } = useInactivityLogout();
  
  return (
    <>
      {children}
      <InactivityWarning
        open={showWarning}
        secondsRemaining={secondsRemaining}
        onStayLoggedIn={stayLoggedIn}
        onLogout={logout}
      />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/logout" element={<LogoutRoute />} />
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><InactivityWrapper><Dashboard /></InactivityWrapper></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><InactivityWrapper><Wallet /></InactivityWrapper></ProtectedRoute>} />
          <Route path="/compare" element={<ProtectedRoute><InactivityWrapper><CardComparison /></InactivityWrapper></ProtectedRoute>} />
          <Route path="/best" element={<ProtectedRoute><InactivityWrapper><BestCard /></InactivityWrapper></ProtectedRoute>} />
          <Route path="/advisor" element={<ProtectedRoute><InactivityWrapper><Advisor /></InactivityWrapper></ProtectedRoute>} />
          <Route path="/benefits" element={<ProtectedRoute><InactivityWrapper><Benefits /></InactivityWrapper></ProtectedRoute>} />
          <Route path="/offers" element={<ProtectedRoute><InactivityWrapper><Offers /></InactivityWrapper></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><InactivityWrapper><Analytics /></InactivityWrapper></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><InactivityWrapper><Settings /></InactivityWrapper></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
