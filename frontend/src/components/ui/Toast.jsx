import { Toaster } from 'react-hot-toast';

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
          padding: '16px 24px',
          color: '#3B4D4B', // Sage 700ish
          borderRadius: '0px',
          fontWeight: '700',
          fontSize: '14px',
          border: '1px solid #E6EEED', // Sage 100
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
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
    />
  );
}
