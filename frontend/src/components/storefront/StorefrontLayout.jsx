import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useToastConfig } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import SimulationBanner from '../shared/SimulationBanner';

export default function StorefrontLayout() {
  const { setToastsEnabled } = useToastConfig();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Default storefront behavior is muted toasts
    // but if an admin is browsing, we respect their simulation setting
    if (!isAdmin) {
      setToastsEnabled(false);
    }
  }, [setToastsEnabled, isAdmin]);

  return (
    <div className="flex flex-col min-h-screen bg-sage-50">
      <div className="sticky top-0 z-40 shadow-sm">
        {isAdmin && <SimulationBanner />}
        <Navbar />
      </div>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-teal-600 text-teal-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-bold font-display text-white mb-2 tracking-tight">Althea's Aquatic Farm</p>
          <p className="opacity-80">© {new Date().getFullYear()} — Premium Aquatic Species & Supplies</p>
        </div>
      </footer>
    </div>
  );
}
