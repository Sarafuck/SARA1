
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/app-layout";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AdminNew from "@/pages/admin-new";
import Loans from "@/pages/loans";
import Friends from "@/pages/friends";
import Chat from "@/pages/chat";
import Shop from "@/pages/shop";
import Membership from "@/pages/membership";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="*" component={Landing} />
      ) : (
        <AppLayout>
          <Route path="/" component={Home} />
          <Route path="/loans" component={Loans} />
          <Route path="/friends" component={Friends} />
          <Route path="/chat" component={Chat} />
          <Route path="/shop" component={Shop} />
          <Route path="/membership" component={Membership} />
          <Route path="/admin" component={AdminNew} />
          <Route path="/:rest*" component={NotFound} />
        </AppLayout>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
