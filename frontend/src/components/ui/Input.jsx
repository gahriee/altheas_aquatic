import Label from './Label';

export default function Input({ label, type = 'text', className = '', ...props }) {
  const inputElement = (
    <input
      type={type}
      className={`appearance-none block w-full px-5 py-3.5 bg-sage-50 border border-sage-100 rounded-2xl shadow-sm placeholder-sage-300 outline-none focus:ring-2 focus:ring-mint-300 focus:border-mint-300 focus:bg-white transition-all sm:text-sm font-medium ${className}`}
      {...props}
    />
  );

  if (label) {
    return (
      <div className="space-y-1">
        <Label>{label}</Label>
        {inputElement}
      </div>
    );
  }

  return inputElement;
}
