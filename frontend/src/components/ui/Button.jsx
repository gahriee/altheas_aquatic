export default function Button({
  children,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  className = '',
  disabled = false,
  ...props
}) {
  const variants = {
    primary: 'bg-teal-500 hover:bg-teal-600 text-white shadow-xl shadow-teal-100 focus:ring-teal-500',
    secondary: 'bg-mint-300 hover:bg-mint-400 text-white shadow-xl shadow-mint-100 focus:ring-mint-300',
    ghost: 'bg-transparent text-teal-600 hover:bg-teal-50 shadow-none border-teal-100',
    danger: 'bg-coral-500 hover:bg-coral-600 text-white shadow-xl shadow-coral-100 focus:ring-coral-500',
  };

  const baseStyles = 'flex justify-center items-center py-4 px-6 rounded-2xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]';
  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';

  return (
    <button
      className={`${baseStyles} ${fullWidth ? 'w-full' : ''} ${variants[variant]} ${disabled || loading ? disabledStyles : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-pulse">Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
