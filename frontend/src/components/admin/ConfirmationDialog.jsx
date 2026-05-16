import { createPortal } from 'react-dom';
import { AlertCircle, Trash2, RotateCcw, Info, Loader2 } from 'lucide-react';
import Button from '../ui/Button';

/**
 * ----------------------------------------
 * ConfirmationDialog
 * ----------------------------------------
 * A premium, shared confirmation modal for administrative actions.
 * Prevents closing on backdrop click to ensure intentional actions.
 */
export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'danger', // 'danger' | 'success' | 'info'
  loading = false,
}) {
  if (!isOpen) return null;

  const themes = {
    danger: {
      icon: <Trash2 size={24} />,
      iconBg: 'bg-coral-500/10',
      iconColor: 'text-coral-500',
      confirmColor: 'danger',
      btnShadow: 'shadow-coral-500/20'
    },
    success: {
      icon: <RotateCcw size={24} />,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      confirmColor: 'primary', // Using Teal as primary success button
      btnShadow: 'shadow-teal-500/20'
    },
    info: {
      icon: <Info size={24} />,
      iconBg: 'bg-teal-500/10',
      iconColor: 'text-teal-500',
      confirmColor: 'primary',
      btnShadow: 'shadow-teal-500/20'
    }
  };

  const theme = themes[variant] || themes.info;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop - Explicitly no onClick for non-closable background */}
      <div className="absolute inset-0 bg-black/60 animate-in fade-in duration-300" />

      {/* Dialog Container */}
      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-sage-900/30 border border-sage-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-16 h-16 rounded-2xl ${theme.iconBg} flex items-center justify-center ${theme.iconColor} shadow-inner`}>
              {theme.icon}
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-display text-sage-800 tracking-tight">{title}</h2>
              <p className="text-sm font-medium text-sage-400 leading-relaxed px-4">
                {message}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-4 border border-sage-100 text-sage-400 hover:bg-sage-50"
            >
              {cancelLabel}
            </Button>
            <Button
              variant={theme.confirmColor}
              onClick={onConfirm}
              loading={loading}
              className={`flex-1 py-4 shadow-lg ${theme.btnShadow}`}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
