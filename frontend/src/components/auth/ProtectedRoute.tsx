import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/app/login';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Vérification...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <>{children}</>;
};