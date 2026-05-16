import { createPortal } from 'react-dom';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, disabled = false }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold font-display mb-2 text-teal-600">{title || 'Confirm Action'}</h3>
        <p className="text-sage-500 font-medium mb-8 leading-relaxed">
          {message || 'Are you sure you want to proceed?'}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="px-6 py-2.5 text-sage-500 font-semibold hover:bg-sage-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className="px-6 py-2.5 bg-coral-500 text-white font-semibold hover:bg-coral-600 rounded-xl transition-all shadow-lg shadow-coral-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
