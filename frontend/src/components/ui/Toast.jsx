import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { X } from 'lucide-react';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={12}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          padding: '12px 18px',
          color: '#3B4D4B', // Sage 700
          borderRadius: '20px',
          fontWeight: '600',
          fontSize: '14px',
          fontFamily: "'Inter', sans-serif",
          border: '1px solid #E6EEED', // Sage 100
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          maxWidth: '400px',
        },

        // Custom success styling
        success: {
          iconTheme: {
            primary: '#10B981', // Emerald 500
            secondary: '#FFFFFF',
          },
          style: {
            background: '#F0FDF4', // Emerald 50
            border: '1px solid #DCFCE7', // Emerald 100
            color: '#065F46', // Emerald 800
          },
        },

        // Custom error styling
        error: {
          iconTheme: {
            primary: '#EF4444', // Coral 500
            secondary: '#FFFFFF',
          },
          style: {
            background: '#FEF2F2', // Coral 50
            border: '1px solid #FEE2E2', // Coral 100
            color: '#991B1B', // Coral 800
          },
        },
      }}
    >
      {(t) => (
        <ToastBar 
          toast={t}
          style={{
            ...t.style,
            animation: t.visible ? 'toast-enter 0.3s ease-out forwards' : 'toast-exit 0.3s ease-in forwards',
          }}
        >
          {({ icon, message }) => (
            <>
              <div 
                className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                onClick={() => toast.dismiss(t.id)}
              >
                {icon}
                <div className="flex-1">{message}</div>
              </div>
              {t.type !== 'loading' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                  }}
                  className="ml-4 p-1 rounded-full hover:bg-black/5 text-sage-300 hover:text-sage-500 transition-colors"
                  aria-label="Dismiss"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              )}
            </>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
