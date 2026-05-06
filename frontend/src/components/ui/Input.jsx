export default function Input({ type = 'text', className = '', ...props }) {
  return (
    <input
      type={type}
      className={`appearance-none block w-full px-5 py-3.5 bg-sage-50 border border-sage-100 rounded-2xl shadow-sm placeholder-sage-300 outline-none focus:ring-2 focus:ring-mint-300 focus:border-mint-300 focus:bg-white transition-all sm:text-sm font-medium ${className}`}
      {...props}
    />
  );
}
