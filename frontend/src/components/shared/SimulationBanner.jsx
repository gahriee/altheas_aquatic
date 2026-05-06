import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, BellRing } from 'lucide-react';
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

  const handleToggleToasts = (e) => {
    setToastsEnabled(e.target.checked);
  };

  return (
    <div className="sticky top-0 z-[60] bg-slate-900 text-white shadow-lg animate-in slide-in-from-top duration-500">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Banner Info */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-1.5 rounded-lg border border-white/10">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest leading-none">Simulation Mode</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Logged in as Administrator</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          {/* Toast Toggle */}
          <div className="flex items-center gap-3 border-x border-white/10 px-8">
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-bold uppercase tracking-wider leading-none">Admin Toasts</p>
              <p className="text-[9px] text-slate-400 font-medium mt-1">
                {toastsEnabled ? 'Actively showing' : 'Muted on storefront'}
              </p>
            </div>
            <Switch 
              id="admin-toast-toggle"
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
    </div>
  );
}
