import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import AuthPage from "./pages/auth-page";
import Dashboard from "./pages/dashboard";
import Products from "./pages/products";
import Inventory from "./pages/inventory";
import Users from "./pages/users";
import Profile from "./pages/profile";

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        <AuthPage />
      </Route>
      <ProtectedRoute path="/products">
        <Products />
      </ProtectedRoute>
      <ProtectedRoute path="/inventory">
        <Inventory />
      </ProtectedRoute>
      <ProtectedRoute path="/users">
        <Users />
      </ProtectedRoute>
      <ProtectedRoute path="/profile">
        <Profile />
      </ProtectedRoute>
      <ProtectedRoute path="/">
        <Dashboard />
      </ProtectedRoute>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}