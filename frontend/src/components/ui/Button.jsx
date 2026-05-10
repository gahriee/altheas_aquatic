import { forwardRef } from 'react';

const Button = forwardRef(function Button({
  children,
  as: Component = 'button',
  variant = 'primary',
  loading = false,
  fullWidth = true,
  className = '',
  disabled = false,
  ...props
}, ref) {
  const variants = {
    primary: 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg shadow-teal-500/20 focus:ring-teal-500',
    secondary: 'bg-mint-300 hover:opacity-90 text-white shadow-md shadow-mint-300/10 focus:ring-mint-300',
    outline: 'bg-transparent border border-sage-200 text-sage-600 hover:bg-sage-50 hover:border-teal-500 hover:text-teal-600 focus:ring-teal-500',
    ghost: 'bg-transparent text-teal-600 hover:bg-teal-50 shadow-none border-transparent',
    danger: 'bg-coral-500 hover:bg-coral-600 text-white shadow-lg shadow-coral-500/20 focus:ring-coral-500',
  };

  const baseStyles = 'flex justify-center items-center gap-3 py-4 px-6 rounded-2xl text-sm font-semibold transition-all outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]';
  const disabledStyles = 'opacity-50 cursor-not-allowed pointer-events-none';

  return (
    <Component
      ref={ref}
      className={`${baseStyles} ${fullWidth ? 'w-full' : ''} ${variants[variant]} ${disabled || loading ? disabledStyles : ''} ${className}`}
      disabled={Component === 'button' ? (disabled || loading) : undefined}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="animate-pulse">Loading...</span>
        </span>
      ) : (
        children
      )}
    </Component>
  );
});

export default Button;
