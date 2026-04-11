import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import LoginModal from '../shared/LoginModal';

export default function StorefrontLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-sage-50">
      <Navbar />
      <LoginModal />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-teal-600 text-teal-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-semibold text-white mb-2">Althea's Aquatic</p>
          <p className="opacity-80">© {new Date().getFullYear()} — Premium Aquatic Species & Supplies</p>
        </div>
      </footer>
    </div>
  );
}
