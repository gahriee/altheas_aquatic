export default function Label({ children, htmlFor, className = '', ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-bold text-sage-500 mb-2 ml-1 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
