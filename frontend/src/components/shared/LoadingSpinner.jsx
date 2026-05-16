import { Loader2 } from 'lucide-react';

/**
 * Consistent loading spinner used across all storefront pages.
 * Matches the Loader2 + glow pattern from the Home page.
 */
export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 space-y-4">
      <div className="relative">
        <Loader2 className="text-teal-500 animate-spin" size={48} />
        <div className="absolute inset-0 bg-teal-500/20 blur-xl rounded-full animate-pulse" />
      </div>
      <p className="text-sage-300 font-bold tracking-[0.2em] uppercase text-[10px]">{message}</p>
    </div>
  );
}
