/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Global variable to track toast status outside of React components.
 * This allows the non-React apiFetch utility to check the state.
 */
let globalToastsEnabled = true;

export function getGlobalToastsEnabled() {
  return globalToastsEnabled;
}

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toastsEnabled, setToastsEnabled] = useState(true);

  // Sync state with global variable
  useEffect(() => {
    globalToastsEnabled = toastsEnabled;
  }, [toastsEnabled]);

  return (
    <ToastContext.Provider value={{ toastsEnabled, setToastsEnabled }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastConfig() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastConfig must be used within a ToastProvider');
  }
  return context;
}
