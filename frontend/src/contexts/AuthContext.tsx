import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const authStatus = localStorage.getItem('dashboard_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (password: string): boolean => {
    // Le mot de passe sera défini via une variable d'environnement Vercel
    const correctPassword = import.meta.env.VITE_DASHBOARD_PASSWORD || 'dashboard2024!';
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('dashboard_authenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('dashboard_authenticated');
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};