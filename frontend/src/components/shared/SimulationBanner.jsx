import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Menu, X } from 'lucide-react';
import { useToastConfig } from '../../context/ToastContext';
import Switch from '../ui/Switch';

/**
 * SimulationBanner
 * ----------------------------------------
 * A sticky top banner displayed to administrators when they are 
 * browsing the storefront, allowing for quick dashboard access 
 * and simulation control (e.g., toggling toasts).
 */
export default function SimulationBanner() {
  const { toastsEnabled, setToastsEnabled } = useToastConfig();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleToasts = (e) => {
    setToastsEnabled(e.target.checked);
  };

  return (
    <div className="sticky top-0 z-[60] bg-slate-900 text-white shadow-lg animate-in slide-in-from-top duration-500">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Banner Info */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-1.5 rounded-lg border border-white/10 shrink-0">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest leading-none">Simulation Mode</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Logged in as Administrator</p>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white transition-colors focus:outline-none"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Controls - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {/* Toast Toggle */}
          <div className="flex items-center gap-3 border-x border-white/10 px-8">
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-bold uppercase tracking-wider leading-none">Admin Toasts</p>
              <p className="text-[9px] text-slate-400 font-medium mt-1">
                {toastsEnabled ? 'Actively showing' : 'Muted on storefront'}
              </p>
            </div>
            <Switch 
              id="admin-toast-toggle-desktop"
              checked={toastsEnabled}
              onChange={handleToggleToasts}
              className="scale-90"
            />
          </div>

          {/* Quick Link */}
          <Link 
            to="/admin" 
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            Dashboard
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Controls - Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden px-4 py-4 bg-slate-800 border-t border-white/10 space-y-4 animate-in slide-in-from-top-2 fade-in">
          <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-white/5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Admin Toasts</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                {toastsEnabled ? 'Actively showing' : 'Muted on storefront'}
              </p>
            </div>
            <Switch 
              id="admin-toast-toggle-mobile"
              checked={toastsEnabled}
              onChange={handleToggleToasts}
            />
          </div>

          <Link 
            to="/admin" 
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between w-full p-3 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            Go to Admin Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
