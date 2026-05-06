import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin, logout as apiLogout } from '../api/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);

  const hydrateUser = async () => {
    try {
      const data = await getMe();
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrateUser();
  }, []);

  const login = async (email, password, isAdmin = false) => {
    if (isAdmin) {
      await apiLogin(email, password);
    } else {
      // We need a customer login API wrapper
      const { customerLogin } = await import('../api/auth');
      await customerLogin(email, password);
    }
    await hydrateUser();
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: () => !!user, // Provided as a function
      userIsAuthenticated: !!user, // Kept as boolean for backward compatibility if needed
      loading, 
      login, 
      logout,
      pendingAction,
      setPendingAction
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
